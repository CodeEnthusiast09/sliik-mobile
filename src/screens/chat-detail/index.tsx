import Ionicons from '@expo/vector-icons/Ionicons';
import {
  RecordingPresets,
  requestRecordingPermissionsAsync,
  useAudioRecorder,
  useAudioRecorderState,
} from 'expo-audio';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Linking,
  Modal,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native';
import type {
  TextInputChangeEvent,
  TextInputContentSizeChangeEvent,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Avatar } from '@/components/avatar';
import { EmptyState } from '@/components/empty-state';
import { ErrorState } from '@/components/error-state';
import { DetailSkeleton, ListSkeleton } from '@/components/skeleton';
import { StatusPill } from '@/components/status-pill';
import { useChatSocket } from '@/hooks/common/use-chat-socket';
import { useHideTabBar } from '@/hooks/common/use-hide-tab-bar';
import { useBooking } from '@/hooks/services/bookings';
import { useMessages } from '@/hooks/services/chat';
import { useCreateReport } from '@/hooks/services/reports';
import { useUploadAudio, useUploadImage } from '@/hooks/services/uploads';
import type { Message } from '@/interfaces/chat';
import {
  formatBookingDateTimeLabel,
  formatChatDayDivider,
  getErrorMessage,
  isSameLocalDay,
} from '@/lib/utils';
import { useAuthStore } from '@/store/auth';
import { showToast } from '@/store/toast';
import { MessageBubble } from './_components/message-bubble';
import { RecordingVisualizer } from './_components/recording-visualizer';

/** One line of input text at lineHeight 24. */
const INPUT_LINE_HEIGHT = 24;
/** Max input content height before internal scrolling (~4 lines). */
const INPUT_MAX_HEIGHT = 96;

function clampInputHeight(height: number): number {
  return Math.min(Math.max(height, INPUT_LINE_HEIGHT), INPUT_MAX_HEIGHT);
}

function formatRecordingDuration(durationMillis: number): string {
  const totalSeconds = Math.floor(durationMillis / 1000);
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${mins}:${String(secs).padStart(2, '0')}`;
}

const REPORT_REASONS = [
  'Spam',
  'Harassment or abuse',
  'Inappropriate content',
  'Scam or fraud',
  'Other',
];

function DayDivider({ isoDateTime }: { isoDateTime: string }) {
  return (
    <View className="items-center py-2">
      <Text className="text-[12px] font-medium text-[#948F86]">
        {formatChatDayDivider(isoDateTime)}
      </Text>
    </View>
  );
}

export function ChatDetailScreen() {
  const router = useRouter();
  const role = useAuthStore((state) => state.role);
  const { id } = useLocalSearchParams<{ id: string }>();

  useHideTabBar();

  const {
    data: booking,
    isLoading: isLoadingBooking,
    isError: isBookingError,
    error: bookingError,
    refetch: refetchBooking,
  } = useBooking(id);

  // Computed ahead of useChatSocket (which needs otherParty's id) rather
  // than after the loading/error guards below - booking is undefined until
  // it loads, so this degrades to undefined until then instead of erroring.
  const otherParty = role === 'customer' ? booking?.provider : booking?.customer;
  const myUserId =
    role === 'customer' ? booking?.customer?.userId : booking?.provider?.userId;

  const {
    data: messages,
    isLoading: isLoadingMessages,
    isError: isMessagesError,
    error: messagesError,
    refetch: refetchMessages,
  } = useMessages(id);
  const {
    sendMessage,
    beginPendingMessage,
    removePendingMessage,
    deleteMessage,
    isOtherOnline,
  } = useChatSocket(id, otherParty?.userId, myUserId);
  const uploadImageMutation = useUploadImage();
  const uploadAudioMutation = useUploadAudio();
  const recorder = useAudioRecorder({
    ...RecordingPresets.HIGH_QUALITY,
    isMeteringEnabled: true,
  });
  // Faster than the 500ms default so the live visualizer bars feel responsive.
  const recorderState = useAudioRecorderState(recorder, 100);
  const createReportMutation = useCreateReport();

  const [text, setText] = useState('');
  const [contentHeight, setContentHeight] = useState(INPUT_LINE_HEIGHT);
  const [viewerImageUrl, setViewerImageUrl] = useState<string | null>(null);
  const [menuVisible, setMenuVisible] = useState(false);
  const [reportModalVisible, setReportModalVisible] = useState(false);
  const [bookingCardDismissed, setBookingCardDismissed] = useState(false);
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(
    null,
  );
  const listRef = useRef<FlatList<Message>>(null);
  const previousMessageCountRef = useRef(0);

  // A single delayed scrollToEnd still lands short on web: markRead fires
  // right after every new message and invalidates the messages query,
  // replacing the list's data mid-animation, which cuts an animated
  // scrollToEnd off before it reaches the real bottom. Scrolling instantly
  // (no animation to interrupt) at a few staggered delays is what actually
  // lands on the true end reliably. Keyed on count (not the array
  // reference) so a message edit/delete in place doesn't also trigger one.
  useEffect(() => {
    const count = messages?.length ?? 0;
    if (count > previousMessageCountRef.current) {
      const timeouts = [50, 150, 400].map((delay) =>
        setTimeout(() => {
          listRef.current?.scrollToEnd({ animated: false });
        }, delay),
      );
      previousMessageCountRef.current = count;
      return () => timeouts.forEach(clearTimeout);
    }
    previousMessageCountRef.current = count;
  }, [messages?.length]);

  const inputHeight = clampInputHeight(contentHeight);

  function handleChangeText(value: string) {
    setText(value);
    // Native fires onContentSizeChange on both growth and deletion, but a
    // fully cleared input is handled here so the pill snaps back instantly.
    if (value === '') {
      setContentHeight(INPUT_LINE_HEIGHT);
    }
  }

  function handleContentSizeChange(event: TextInputContentSizeChangeEvent) {
    setContentHeight(event.nativeEvent.contentSize.height);
  }

  function handleWebChange(event: TextInputChangeEvent) {
    if (Platform.OS !== 'web') return;
    const target = event.target as unknown as HTMLTextAreaElement;
    if (!(target instanceof HTMLTextAreaElement)) return;
    const previousHeight = target.style.height;
    target.style.height = '0px';
    const measured = target.scrollHeight;
    target.style.height = previousHeight;
    setContentHeight(measured);
  }

  function handleSend() {
    const trimmed = text.trim();
    if (!trimmed) return;
    sendMessage(trimmed);
    setText('');
    // onContentSizeChange does not reliably fire on programmatic clears,
    // so reset the height explicitly.
    setContentHeight(INPUT_LINE_HEIGHT);
  }

  async function handleAttachPhoto() {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
    });
    if (result.canceled) return;

    try {
      const uploadResponse = await uploadImageMutation.mutateAsync(
        result.assets[0],
      );
      if (uploadResponse.data) {
        sendMessage('', { type: 'image', mediaUrl: uploadResponse.data.url });
      }
    } catch (err) {
      showToast(getErrorMessage(err), 'error');
    }
  }

  async function handleStartRecording() {
    const { granted } = await requestRecordingPermissionsAsync();
    if (!granted) {
      showToast(
        'Microphone permission is required to record a voice message',
        'error',
      );
      return;
    }
    await recorder.prepareToRecordAsync();
    recorder.record();
  }

  async function handleStopAndSendRecording() {
    await recorder.stop();
    const uri = recorder.uri;
    if (!uri) return;

    // Bubble appears right away (with a spinner, no playable audio yet)
    // instead of only after the Cloudinary upload + socket round trip
    // finish - the real message replaces it once both are done.
    const clientId = beginPendingMessage('audio');

    try {
      const uploadResponse = await uploadAudioMutation.mutateAsync(uri);
      if (uploadResponse.data) {
        sendMessage('', {
          type: 'audio',
          mediaUrl: uploadResponse.data.url,
          clientId,
        });
      } else {
        removePendingMessage(clientId);
      }
    } catch (err) {
      removePendingMessage(clientId);
      showToast(getErrorMessage(err), 'error');
    }
  }

  async function handleCancelRecording() {
    await recorder.stop();
  }

  if (isBookingError) {
    return (
      <View className="flex-1 bg-white">
        <SafeAreaView className="flex-1 px-6" edges={['top', 'bottom']}>
          <ErrorState
            message={getErrorMessage(bookingError)}
            onRetry={refetchBooking}
          />
        </SafeAreaView>
      </View>
    );
  }

  if (isLoadingBooking || !booking) {
    return (
      <View className="flex-1 bg-white">
        <SafeAreaView className="flex-1 px-6" edges={['top', 'bottom']}>
          <DetailSkeleton />
        </SafeAreaView>
      </View>
    );
  }

  function handleCall() {
    if (!otherParty?.phone) return;
    void Linking.openURL(`tel:${otherParty.phone}`);
  }

  function handleViewProfile() {
    setMenuVisible(false);
    if (!otherParty) return;
    router.push({ pathname: '/home/[id]', params: { id: otherParty.id } });
  }

  function handleSelectMessage(messageId: string) {
    // Long-pressing the already-selected message deselects it, same as
    // tapping the close button in the selection header.
    setSelectedMessageId((current) => (current === messageId ? null : messageId));
  }

  function handleDeleteSelected() {
    if (!selectedMessageId) return;
    const messageId = selectedMessageId;
    const confirmDelete = () => {
      deleteMessage(messageId);
      setSelectedMessageId(null);
    };

    // react-native-web's Alert.alert() is a no-op, so it needs a real
    // browser confirm() dialog on web instead.
    if (Platform.OS === 'web') {
      if (
        window.confirm(
          'Delete this message for everyone? This cannot be undone.',
        )
      ) {
        confirmDelete();
      }
      return;
    }

    Alert.alert(
      'Delete this message?',
      'This removes it for everyone in this conversation. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: confirmDelete },
      ],
    );
  }

  function handleSubmitReport(reason: string) {
    if (!otherParty?.userId || !booking) return;
    createReportMutation.mutate(
      { reportedUserId: otherParty.userId, bookingId: booking.id, reason },
      {
        onSuccess: () => {
          setReportModalVisible(false);
          showToast('Report submitted. Thank you for letting us know.', 'success');
        },
        onError: (err) => showToast(getErrorMessage(err), 'error'),
      },
    );
  }

  return (
    <View className="flex-1 bg-white">
      <SafeAreaView className="flex-1" edges={['top', 'bottom']}>
        <View className="flex-1 px-6">
          {selectedMessageId ? (
            <View className="flex-row items-center gap-3 py-2">
              <Pressable
                onPress={() => setSelectedMessageId(null)}
                hitSlop={10}
                className="h-9 w-9 items-center justify-center"
              >
                <Ionicons name="close" size={26} color="#4B2E46" />
              </Pressable>
              <Text className="flex-1 text-[15px] font-semibold text-[#26242A]">
                1 selected
              </Text>
              <Pressable
                onPress={handleDeleteSelected}
                hitSlop={10}
                className="h-9 w-9 items-center justify-center"
              >
                <Ionicons name="trash-outline" size={21} color="#E5484D" />
              </Pressable>
            </View>
          ) : (
            <View className="flex-row items-center gap-3 py-2">
              <Pressable
                onPress={() => router.back()}
                hitSlop={10}
                className="h-9 w-9 items-center justify-center"
              >
                <Ionicons name="arrow-back" size={28} color="#4B2E46" />
              </Pressable>
              <Avatar
                uri={otherParty?.avatarUrl}
                name={otherParty?.fullName ?? '?'}
                size={40}
              />
              <View className="flex-1">
                <Text
                  numberOfLines={1}
                  className="font-serif-bold text-[17px] text-[#26242A]"
                >
                  {otherParty?.fullName ?? 'Chat'}
                </Text>
                {isOtherOnline ? (
                  <Text className="text-[12px] font-medium text-[#2f9e44]">
                    Online
                  </Text>
                ) : null}
              </View>
              {otherParty?.phone ? (
                <Pressable
                  onPress={handleCall}
                  hitSlop={10}
                  className="h-9 w-9 items-center justify-center rounded-full border border-[#ECE7E0]"
                >
                  <Ionicons name="call-outline" size={17} color="#4B2E46" />
                </Pressable>
              ) : null}
              <Pressable
                onPress={() => setMenuVisible(true)}
                hitSlop={10}
                className="h-9 w-9 items-center justify-center"
              >
                <Ionicons name="ellipsis-vertical" size={19} color="#4B2E46" />
              </Pressable>
            </View>
          )}

          {!bookingCardDismissed ? (
            <Pressable
              onPress={() =>
                router.push({
                  pathname: '/bookings/[id]',
                  params: { id: booking.id, from: 'chat' },
                })
              }
              className="mt-2 flex-row gap-3 rounded-[20px] border border-[#ECE7E0] bg-white p-3"
            >
              <View className="flex-1 justify-center gap-1">
                <View className="flex-row items-center justify-between gap-2">
                  <Text
                    className="flex-1 font-serif-bold text-[15px] text-[#26242A]"
                    numberOfLines={1}
                  >
                    Booking{' '}
                    {booking.status.charAt(0).toUpperCase() +
                      booking.status.slice(1)}
                  </Text>
                  <StatusPill status={booking.status} />
                  <Pressable
                    onPress={(event) => {
                      event.stopPropagation();
                      setBookingCardDismissed(true);
                    }}
                    hitSlop={8}
                    className="h-6 w-6 items-center justify-center"
                  >
                    <Ionicons name="close" size={16} color="#948F86" />
                  </Pressable>
                </View>
                <Text className="text-[13px] text-[#817F80]">
                  {formatBookingDateTimeLabel(booking.scheduledAt)}
                </Text>
                {booking.service?.name ? (
                  <Text className="text-[13px] text-[#817F80]" numberOfLines={1}>
                    {booking.service.name}
                  </Text>
                ) : null}
                <View className="mt-0.5 flex-row items-center gap-1">
                  <Text className="text-[13px] font-bold text-[#4B2E46]">
                    View booking
                  </Text>
                  <Ionicons name="chevron-forward" size={14} color="#4B2E46" />
                </View>
              </View>
            </Pressable>
          ) : null}

          <KeyboardAvoidingView
            className="flex-1"
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            keyboardVerticalOffset={80}
          >
            {isLoadingMessages ? (
              <View className="mt-4">
                <ListSkeleton rows={4} rowHeight={48} />
              </View>
            ) : isMessagesError ? (
              <ErrorState
                message={getErrorMessage(messagesError)}
                onRetry={refetchMessages}
              />
            ) : (
              <FlatList
                showsVerticalScrollIndicator={false}
                ref={listRef}
                data={messages}
                keyExtractor={(message) => message.id}
                contentContainerClassName="grow gap-2 pt-4 pb-4"
                ListEmptyComponent={
                  <EmptyState message="No messages yet. Say hello!" />
                }
                renderItem={({ item, index }) => {
                  const previous =
                    index > 0 ? messages?.[index - 1] : undefined;
                  const showDivider =
                    !previous ||
                    !isSameLocalDay(previous.createdAt, item.createdAt);

                  return (
                    <View className="gap-2">
                      {showDivider ? (
                        <DayDivider isoDateTime={item.createdAt} />
                      ) : null}
                      <MessageBubble
                        message={item}
                        isMine={item.senderId === myUserId}
                        isSelected={item.id === selectedMessageId}
                        onPressImage={setViewerImageUrl}
                        onSelect={handleSelectMessage}
                      />
                    </View>
                  );
                }}
              />
            )}

            {recorderState.isRecording ? (
              <View className="flex-row items-center gap-2 py-3">
                <Pressable
                  onPress={handleCancelRecording}
                  hitSlop={4}
                  className="h-12 w-12 items-center justify-center rounded-full bg-[#F3F0EB]"
                >
                  <Ionicons name="trash-outline" size={20} color="#E5484D" />
                </Pressable>

                <View className="flex-1 flex-row items-center gap-3 rounded-[24px] border border-[#ECE7E0] bg-white px-5 py-3">
                  <View className="h-2.5 w-2.5 flex-none rounded-full bg-[#E5484D]" />
                  <RecordingVisualizer metering={recorderState.metering} />
                  <Text className="flex-none text-[15px] text-[#26242A]">
                    {formatRecordingDuration(recorderState.durationMillis)}
                  </Text>
                </View>

                <Pressable
                  onPress={handleStopAndSendRecording}
                  hitSlop={4}
                  className="h-12 w-12 items-center justify-center rounded-full bg-[#4B2E46]"
                >
                  <Ionicons name="checkmark" size={22} color="#F7EFE4" />
                </Pressable>
              </View>
            ) : (
              <View className="flex-row items-end gap-2 py-3">
                <Pressable
                  onPress={handleAttachPhoto}
                  disabled={uploadImageMutation.isPending}
                  hitSlop={4}
                  className="h-12 w-12 items-center justify-center rounded-full border border-[#ECE7E0] bg-white"
                >
                  {uploadImageMutation.isPending ? (
                    <ActivityIndicator size="small" color="#4B2E46" />
                  ) : (
                    <Ionicons name="add" size={22} color="#4B2E46" />
                  )}
                </Pressable>

                <View className="flex-1 flex-row items-end rounded-[24px] border border-[#ECE7E0] bg-white py-[11px] pl-5 pr-3">
                  <TextInput
                    placeholder="Type a message..."
                    placeholderTextColor="#A8A39B"
                    value={text}
                    onChangeText={handleChangeText}
                    onChange={handleWebChange}
                    onContentSizeChange={handleContentSizeChange}
                    multiline
                    className="flex-1 text-[16px] text-[#26242A]"
                    style={{
                      height: inputHeight,
                      lineHeight: INPUT_LINE_HEIGHT,
                      paddingVertical: 0,
                      paddingTop: 0,
                      outlineWidth: 0,
                      overflow: 'hidden',
                    }}
                  />
                  <Pressable
                    onPress={text.trim() ? handleSend : handleStartRecording}
                    disabled={uploadAudioMutation.isPending}
                    hitSlop={8}
                    className="h-6 w-6 items-center justify-center"
                  >
                    {uploadAudioMutation.isPending ? (
                      <ActivityIndicator size="small" color="#4B2E46" />
                    ) : (
                      <Ionicons
                        name={text.trim() ? 'send' : 'mic-outline'}
                        size={20}
                        color="#4B2E46"
                      />
                    )}
                  </Pressable>
                </View>
              </View>
            )}
          </KeyboardAvoidingView>
        </View>
      </SafeAreaView>

      <Modal
        visible={viewerImageUrl !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setViewerImageUrl(null)}
      >
        <View className="flex-1 bg-black">
          <SafeAreaView className="flex-1">
            <Pressable
              onPress={() => setViewerImageUrl(null)}
              hitSlop={10}
              className="absolute right-4 top-4 z-10 h-10 w-10 items-center justify-center rounded-full bg-black/50"
            >
              <Ionicons name="close" size={24} color="#FFFFFF" />
            </Pressable>

            {viewerImageUrl ? (
              <View className="flex-1 items-center justify-center">
                <Image
                  source={{ uri: viewerImageUrl }}
                  style={{ width: '100%', height: '100%' }}
                  contentFit="contain"
                />
              </View>
            ) : null}
          </SafeAreaView>
        </View>
      </Modal>

      <Modal
        visible={menuVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setMenuVisible(false)}
      >
        <Pressable
          className="flex-1 justify-end bg-black/40"
          onPress={() => setMenuVisible(false)}
        >
          <Pressable
            className="rounded-t-3xl bg-white px-6 pb-10 pt-5"
            onPress={(event) => event.stopPropagation()}
          >
            {role === 'customer' ? (
              <Pressable
                onPress={handleViewProfile}
                className="flex-row items-center gap-3 py-3.5"
              >
                <Ionicons name="person-outline" size={20} color="#26242A" />
                <Text className="text-[15px] font-semibold text-[#26242A]">
                  View profile
                </Text>
              </Pressable>
            ) : null}
            <Pressable
              onPress={() => {
                setMenuVisible(false);
                setReportModalVisible(true);
              }}
              className="flex-row items-center gap-3 py-3.5"
            >
              <Ionicons name="flag-outline" size={20} color="#E5484D" />
              <Text className="text-[15px] font-semibold text-[#E5484D]">
                Report user
              </Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>

      <Modal
        visible={reportModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setReportModalVisible(false)}
      >
        <Pressable
          className="flex-1 justify-end bg-black/40"
          onPress={() => setReportModalVisible(false)}
        >
          <Pressable
            className="rounded-t-3xl bg-white px-6 pb-10 pt-5"
            onPress={(event) => event.stopPropagation()}
          >
            <Text className="mb-2 text-center text-base font-bold text-[#26242A]">
              Report {otherParty?.fullName ?? 'this user'}
            </Text>
            <Text className="mb-2 text-center text-[13px] text-[#817F80]">
              Select a reason
            </Text>
            {REPORT_REASONS.map((reason) => (
              <Pressable
                key={reason}
                onPress={() => handleSubmitReport(reason)}
                disabled={createReportMutation.isPending}
                className="flex-row items-center justify-between rounded-xl px-3 py-3.5"
              >
                <Text className="text-[15px] text-[#26242A]">{reason}</Text>
                {createReportMutation.isPending ? (
                  <ActivityIndicator size="small" color="#4B2E46" />
                ) : (
                  <Ionicons name="chevron-forward" size={16} color="#C9C1BB" />
                )}
              </Pressable>
            ))}
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

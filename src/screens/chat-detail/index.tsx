import Ionicons from '@expo/vector-icons/Ionicons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EmptyState } from '@/components/empty-state';
import { ErrorState } from '@/components/error-state';
import { ScreenHeader } from '@/components/screen-header';
import { DetailSkeleton, ListSkeleton } from '@/components/skeleton';
import { useChatSocket } from '@/hooks/common/use-chat-socket';
import { useHideTabBar } from '@/hooks/common/use-hide-tab-bar';
import { useBooking } from '@/hooks/services/bookings';
import { useMessages } from '@/hooks/services/chat';
import type { Message } from '@/interfaces/chat';
import { formatTimeLabel, getErrorMessage } from '@/lib/utils';
import { useAuthStore } from '@/store/auth';

function MessageBubble({
  message,
  isMine,
}: {
  message: Message;
  isMine: boolean;
}) {
  return (
    <View
      className={`max-w-[80%] gap-1 rounded-[18px] p-3 ${
        isMine
          ? 'self-end bg-[#4B2E46]'
          : 'self-start border border-[#ECE7E0] bg-white'
      }`}
    >
      <Text className={`text-[15px] ${isMine ? 'text-[#F7EFE4]' : 'text-[#26242A]'}`}>
        {message.content}
      </Text>
      <Text
        className={`text-[12px] ${isMine ? 'text-[#E8DDE5]' : 'text-[#817F80]'}`}
      >
        {formatTimeLabel(message.createdAt)}
        {isMine && message.readAt ? ' · Seen' : ''}
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
  const {
    data: messages,
    isLoading: isLoadingMessages,
    isError: isMessagesError,
    error: messagesError,
    refetch: refetchMessages,
  } = useMessages(id);
  const { sendMessage } = useChatSocket(id);

  const [text, setText] = useState('');
  const listRef = useRef<FlatList<Message>>(null);

  const notificationsHref =
    role === 'provider' ? '/profile/notifications' : '/home/notifications';

  function handleSend() {
    const trimmed = text.trim();
    if (!trimmed) return;
    sendMessage(trimmed);
    setText('');
  }

  if (isBookingError) {
    return (
      <View className="flex-1 bg-white">
        <SafeAreaView className="flex-1" edges={['top', 'bottom']}>
          <View className="flex-1 px-6">
            <ErrorState
              message={getErrorMessage(bookingError)}
              onRetry={refetchBooking}
            />
          </View>
        </SafeAreaView>
      </View>
    );
  }

  if (isLoadingBooking || !booking) {
    return (
      <View className="flex-1 bg-white">
        <SafeAreaView className="flex-1" edges={['top', 'bottom']}>
          <View className="flex-1 px-6">
            <DetailSkeleton />
          </View>
        </SafeAreaView>
      </View>
    );
  }

  const otherParty = role === 'customer' ? booking.provider : booking.customer;
  const myUserId =
    role === 'customer' ? booking.customer?.userId : booking.provider?.userId;

  return (
    <View className="flex-1 bg-white">
      <SafeAreaView className="flex-1" edges={['top', 'bottom']}>
        <View className="flex-1 px-6">
          <ScreenHeader
            title={otherParty?.fullName ?? 'Chat'}
            notificationsHref={notificationsHref}
            onBack={() => router.back()}
          />

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
                onContentSizeChange={() =>
                  listRef.current?.scrollToEnd({ animated: true })
                }
                ListEmptyComponent={
                  <EmptyState message="No messages yet. Say hello!" />
                }
                renderItem={({ item }) => (
                  <MessageBubble
                    message={item}
                    isMine={item.senderId === myUserId}
                  />
                )}
              />
            )}

            <View className="flex-row items-end gap-2 py-3">
              <TextInput
                placeholder="Type a message"
                placeholderTextColor="#A8A39B"
                value={text}
                onChangeText={setText}
                multiline
                className="max-h-[100px] flex-1 rounded-[16px] border border-[#ECE7E0] bg-white px-4 py-3 text-[15px] text-[#26242A]"
                style={{ outlineWidth: 0 }}
              />
              <Pressable
                onPress={handleSend}
                hitSlop={4}
                className="h-[52px] w-[52px] items-center justify-center rounded-full bg-[#4B2E46] active:bg-[#3C2438]"
              >
                <Ionicons name="send" size={20} color="#F7EFE4" />
              </Pressable>
            </View>
          </KeyboardAvoidingView>
        </View>
      </SafeAreaView>
    </View>
  );
}

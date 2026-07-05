import { useLocalSearchParams, useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EmptyState } from '@/components/empty-state';
import { ErrorState } from '@/components/error-state';
import { DetailSkeleton, ListSkeleton } from '@/components/skeleton';
import { ThemedText } from '@/components/themed-text';
import { ThemedTextInput } from '@/components/themed-text-input';
import { ThemedView } from '@/components/themed-view';
import { useChatSocket } from '@/hooks/common/use-chat-socket';
import { useBooking } from '@/hooks/services/bookings';
import { useMessages } from '@/hooks/services/chat';
import type { Message } from '@/interfaces/chat';
import { formatTimeLabel, getErrorMessage } from '@/lib/utils';
import { useAuthStore } from '@/store/auth';

import { styles } from './index.styles';

function MessageBubble({
  message,
  isMine,
}: {
  message: Message;
  isMine: boolean;
}) {
  return (
    <ThemedView
      type={isMine ? 'backgroundSelected' : 'backgroundElement'}
      style={[styles.bubble, isMine ? styles.bubbleMine : styles.bubbleTheirs]}
    >
      <ThemedText type="default">{message.content}</ThemedText>
      <ThemedText type="small" themeColor="textSecondary">
        {formatTimeLabel(message.createdAt)}
        {isMine && message.readAt ? ' · Seen' : ''}
      </ThemedText>
    </ThemedView>
  );
}

export function ChatDetailScreen() {
  const router = useRouter();
  const role = useAuthStore((state) => state.role);
  const { id } = useLocalSearchParams<{ id: string }>();

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

  function handleSend() {
    const trimmed = text.trim();
    if (!trimmed) return;
    sendMessage(trimmed);
    setText('');
  }

  if (isBookingError) {
    return (
      <ThemedView style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <ErrorState
            message={getErrorMessage(bookingError)}
            onRetry={refetchBooking}
          />
        </SafeAreaView>
      </ThemedView>
    );
  }

  if (isLoadingBooking || !booking) {
    return (
      <ThemedView style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <DetailSkeleton />
        </SafeAreaView>
      </ThemedView>
    );
  }

  const otherParty = role === 'customer' ? booking.provider : booking.customer;
  const myUserId =
    role === 'customer' ? booking.customer?.userId : booking.provider?.userId;

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <ThemedText type="link">{'< Back'}</ThemedText>
        </Pressable>

        <ThemedText type="title" style={styles.title}>
          {otherParty?.fullName ?? 'Chat'}
        </ThemedText>

        <KeyboardAvoidingView
          style={styles.flexOne}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={80}
        >
          {isLoadingMessages ? (
            <ListSkeleton rows={4} rowHeight={48} />
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
              contentContainerStyle={styles.listContent}
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

          <ThemedView style={styles.inputRow}>
            <ThemedTextInput
              placeholder="Type a message"
              value={text}
              onChangeText={setText}
              style={styles.input}
              multiline
            />
            <Pressable onPress={handleSend}>
              <ThemedView type="backgroundElement" style={styles.sendButton}>
                <ThemedText type="smallBold">Send</ThemedText>
              </ThemedView>
            </Pressable>
          </ThemedView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ThemedView>
  );
}

import { useRouter } from 'expo-router';
import { FlatList, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EmptyState } from '@/components/empty-state';
import { ErrorState } from '@/components/error-state';
import { ListSkeleton } from '@/components/skeleton';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useMyConversations } from '@/hooks/services/chat';
import type { ChatConversationSummary } from '@/interfaces/chat';
import { formatDateTimeLabel, getErrorMessage } from '@/lib/utils';
import { useAuthStore } from '@/store/auth';

import { styles } from './index.styles';

function otherParty(item: ChatConversationSummary, role: string | null) {
  return role === 'customer' ? item.provider : item.customer;
}

export function ChatsListScreen() {
  const router = useRouter();
  const role = useAuthStore((state) => state.role);
  const { data: conversations, isLoading, isError, error, isRefetching, refetch } = useMyConversations();

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ThemedText type="title" style={styles.title}>
          Chats
        </ThemedText>

        {isLoading ? (
          <ListSkeleton />
        ) : isError ? (
          <ErrorState message={getErrorMessage(error)} onRetry={refetch} />
        ) : (
          <FlatList
            data={conversations}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            refreshing={isRefetching}
            onRefresh={refetch}
            ListEmptyComponent={
              <EmptyState message="No conversations yet. Message someone from a confirmed booking." />
            }
            renderItem={({ item }) => {
              const other = otherParty(item, role);
              const lastMessage = item.conversation.messages[0];
              const isUnread = !!lastMessage && lastMessage.senderId === other?.userId && lastMessage.readAt === null;

              return (
                <Pressable
                  onPress={() => router.push({ pathname: '/chats/[id]', params: { id: item.id } })}
                >
                  <ThemedView type="backgroundElement" style={styles.row}>
                    <ThemedText type={isUnread ? 'smallBold' : 'default'}>
                      {other?.fullName ?? 'Sliik user'}
                    </ThemedText>
                    <ThemedText
                      type={isUnread ? 'smallBold' : 'small'}
                      themeColor={isUnread ? undefined : 'textSecondary'}
                      numberOfLines={1}
                    >
                      {lastMessage?.content ?? 'No messages yet'}
                    </ThemedText>
                    <ThemedText type="small" themeColor="textSecondary">
                      {formatDateTimeLabel(item.scheduledAt)}
                    </ThemedText>
                  </ThemedView>
                </Pressable>
              );
            }}
          />
        )}
      </SafeAreaView>
    </ThemedView>
  );
}

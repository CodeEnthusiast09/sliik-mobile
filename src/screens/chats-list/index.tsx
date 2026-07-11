import { useRouter } from 'expo-router';
import { FlatList, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Avatar } from '@/components/avatar';
import { EmptyState } from '@/components/empty-state';
import { ErrorState } from '@/components/error-state';
import { ScreenHeader } from '@/components/screen-header';
import { ListSkeleton } from '@/components/skeleton';
import { useMyConversations } from '@/hooks/services/chat';
import type { ChatConversationSummary } from '@/interfaces/chat';
import { formatDateTimeLabel, getErrorMessage } from '@/lib/utils';
import { useAuthStore } from '@/store/auth';

function otherParty(item: ChatConversationSummary, role: string | null) {
  return role === 'customer' ? item.provider : item.customer;
}

export function ChatsListScreen() {
  const router = useRouter();
  const role = useAuthStore((state) => state.role);
  const {
    data: conversations,
    isLoading,
    isError,
    error,
    isRefetching,
    refetch,
  } = useMyConversations();

  const notificationsHref =
    role === 'provider' ? '/profile/notifications' : '/home/notifications';

  return (
    <View className="flex-1 bg-white">
      <SafeAreaView className="flex-1" edges={['top', 'bottom']}>
        <View className="flex-1 px-6">
          <ScreenHeader notificationsHref={notificationsHref} />

          <Text className="mt-4 font-serif-bold text-[30px] leading-[36px] text-[#26242A]">
            Chats
          </Text>

          {isLoading ? (
            <View className="mt-4">
              <ListSkeleton />
            </View>
          ) : isError ? (
            <ErrorState message={getErrorMessage(error)} onRetry={refetch} />
          ) : (
            <FlatList
              showsVerticalScrollIndicator={false}
              data={conversations}
              keyExtractor={(item) => item.id}
              contentContainerClassName="grow gap-3 pt-4 pb-32"
              refreshing={isRefetching}
              onRefresh={refetch}
              ListEmptyComponent={
                <EmptyState message="No conversations yet. Message someone from a confirmed booking." />
              }
              renderItem={({ item }) => {
                const other = otherParty(item, role);
                const lastMessage = item.conversation.messages[0];
                const isUnread =
                  !!lastMessage &&
                  lastMessage.senderId === other?.userId &&
                  lastMessage.readAt === null;

                return (
                  <Pressable
                    onPress={() =>
                      router.push({
                        pathname: '/chats/[id]',
                        params: { id: item.id },
                      })
                    }
                    className="flex-row items-center gap-3 rounded-[20px] border border-[#ECE7E0] bg-white p-3"
                  >
                    <Avatar
                      uri={other?.avatarUrl}
                      name={other?.fullName ?? '?'}
                      size={56}
                    />

                    <View className="flex-1 gap-1">
                      <Text
                        className={`text-[16px] text-[#26242A] ${isUnread ? 'font-bold' : ''}`}
                      >
                        {other?.fullName ?? 'Sliik user'}
                      </Text>
                      <Text
                        numberOfLines={1}
                        className={`text-[13px] ${isUnread ? 'font-bold text-[#26242A]' : 'text-[#817F80]'}`}
                      >
                        {lastMessage?.content ?? 'No messages yet'}
                      </Text>
                      <Text className="text-[13px] text-[#817F80]">
                        {formatDateTimeLabel(item.scheduledAt)}
                      </Text>
                    </View>
                  </Pressable>
                );
              }}
            />
          )}
        </View>
      </SafeAreaView>
    </View>
  );
}

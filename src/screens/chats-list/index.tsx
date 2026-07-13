import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { FlatList, Pressable, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Avatar } from '@/components/avatar';
import { EmptyState } from '@/components/empty-state';
import { ErrorState } from '@/components/error-state';
import { ScreenHeader } from '@/components/screen-header';
import { ListSkeleton } from '@/components/skeleton';
import { useMyConversations } from '@/hooks/services/chat';
import type { ChatConversationSummary } from '@/interfaces/chat';
import { formatChatTimestampLabel, getErrorMessage } from '@/lib/utils';
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

  const [searchInput, setSearchInput] = useState('');

  const notificationsHref =
    role === 'provider' ? '/profile/notifications' : '/home/notifications';

  const filteredConversations = useMemo(() => {
    const query = searchInput.trim().toLowerCase();
    if (!query) return conversations ?? [];

    return (conversations ?? []).filter((item) => {
      const other = otherParty(item, role);
      const lastMessage = item.conversation.messages[0];
      return (
        other?.fullName?.toLowerCase().includes(query) ||
        lastMessage?.content?.toLowerCase().includes(query)
      );
    });
  }, [conversations, role, searchInput]);

  return (
    <View className="flex-1 bg-white">
      <SafeAreaView className="flex-1" edges={['top', 'bottom']}>
        <View className="flex-1 px-6">
          <ScreenHeader
            title="Chats"
            notificationsHref={notificationsHref}
            showNotifications={false}
          />

          <View className="mt-1 flex-row items-center gap-3 rounded-2xl border border-[#ECE7E0] bg-white px-2.5 py-4">
            <Ionicons name="search-outline" size={18} color="#948F86" />
            <TextInput
              placeholder="Search messages"
              placeholderTextColor="#948F86"
              value={searchInput}
              onChangeText={setSearchInput}
              returnKeyType="search"
              className="flex-1 text-[16px] text-[#26242A]"
              style={{ outlineWidth: 0 }}
            />
            {searchInput ? (
              <Pressable onPress={() => setSearchInput('')} hitSlop={10}>
                <Ionicons name="close-circle" size={18} color="#948F86" />
              </Pressable>
            ) : null}
          </View>

          {isLoading ? (
            <View className="mt-4">
              <ListSkeleton />
            </View>
          ) : isError ? (
            <ErrorState message={getErrorMessage(error)} onRetry={refetch} />
          ) : (
            <FlatList
              showsVerticalScrollIndicator={false}
              data={filteredConversations}
              keyExtractor={(item) => item.id}
              contentContainerClassName="grow gap-3 pt-4 pb-32"
              refreshing={isRefetching}
              onRefresh={refetch}
              ListEmptyComponent={
                <EmptyState
                  message={
                    searchInput
                      ? 'No conversations match your search.'
                      : 'No conversations yet. Message someone from a confirmed booking.'
                  }
                />
              }
              renderItem={({ item }) => {
                const other = otherParty(item, role);
                const lastMessage = item.conversation.messages[0];
                // The list endpoint only ever populates the *other* party's
                // profile (never the current user's own), so "mine" has to
                // be determined by elimination rather than a direct id match.
                const isFromOther =
                  !!lastMessage && lastMessage.senderId === other?.userId;
                const isMine = !!lastMessage && !isFromOther;
                const isUnread = isFromOther && lastMessage?.readAt === null;
                const timestamp = lastMessage
                  ? formatChatTimestampLabel(lastMessage.createdAt)
                  : formatChatTimestampLabel(item.conversation.createdAt);
                const lastMessageText = lastMessage
                  ? lastMessage.type === 'image'
                    ? '📷 Photo'
                    : lastMessage.type === 'audio'
                      ? '🎤 Voice message'
                      : lastMessage.content
                  : '';
                const previewText = lastMessage
                  ? `${isMine ? 'You: ' : ''}${lastMessageText}`
                  : 'No messages yet';

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
                      {item.service?.name ? (
                        <Text
                          className="text-[11px] text-[#A8A39B]"
                          numberOfLines={1}
                        >
                          Re: {item.service.name}
                        </Text>
                      ) : null}
                      <Text
                        numberOfLines={1}
                        className={`text-[13px] ${isUnread ? 'font-bold text-[#26242A]' : 'text-[#817F80]'}`}
                      >
                        {previewText}
                      </Text>
                    </View>

                    <View className="items-end gap-1.5">
                      <Text className="text-[12px] text-[#817F80]">
                        {timestamp}
                      </Text>
                      {isUnread ? (
                        <View className="h-2 w-2 rounded-full bg-[#4B2E46]" />
                      ) : null}
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

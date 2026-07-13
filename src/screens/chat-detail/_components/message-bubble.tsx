import { Message } from "@/interfaces/chat";
import { formatTime12hLabel } from "@/lib/utils";
import { Image } from "expo-image";
import { Pressable, Text } from "react-native";
import { PendingVoiceMessage, VoiceMessagePlayer } from "./voice-message-player";

// Nothing to show for a message the server hasn't confirmed yet - once it
// has, "Sent" holds until the other party actually opens the thread.
function deliveryLabel(isMine: boolean, isDeleted: boolean, message: Message): string {
  if (!isMine || isDeleted) return '';
  if (message.pending) return ' · Sending…';
  return message.readAt ? ' · Seen' : ' · Sent';
}

export const MessageBubble = ({
  message,
  isMine,
  isSelected,
  onPressImage,
  onSelect,
}: {
  message: Message;
  isMine: boolean;
  isSelected?: boolean;
  onPressImage?: (url: string) => void;
  onSelect?: (messageId: string) => void;
}) => {
  const isDeleted = !!message.deletedAt;

  function handleLongPress() {
    if (!isMine || isDeleted || message.pending || !onSelect) return;
    onSelect(message.id);
  }

  return (
    <Pressable
      onLongPress={handleLongPress}
      className={`max-w-[80%] gap-1 rounded-[18px] p-3 ${isMine
        ? 'self-end bg-[#4B2E46]'
        : 'self-start border border-[#ECE7E0] bg-white'
        } ${isSelected ? 'border-2 border-[#E5484D]' : ''}`}
    >
      {isDeleted ? (
        <Text
          className={`text-[14px] italic ${isMine ? 'text-[#E8DDE5]' : 'text-[#948F86]'}`}
        >
          This message was deleted
        </Text>
      ) : (
        <>
          {message.type === 'image' && message.mediaUrl ? (
            <Pressable onPress={() => onPressImage?.(message.mediaUrl!)}>
              <Image
                source={{ uri: message.mediaUrl }}
                style={{ width: 200, height: 200, borderRadius: 12 }}
                contentFit="cover"
              />
            </Pressable>
          ) : null}
          {message.type === 'audio' ? (
            message.mediaUrl ? (
              <VoiceMessagePlayer uri={message.mediaUrl} isMine={isMine} />
            ) : (
              <PendingVoiceMessage isMine={isMine} />
            )
          ) : null}
          {message.content ? (
            <Text className={`text-[15px] ${isMine ? 'text-[#F7EFE4]' : 'text-[#26242A]'}`}>
              {message.content}
            </Text>
          ) : null}
        </>
      )}
      <Text
        className={`text-[12px] ${isMine ? 'text-[#E8DDE5] text-right' : 'text-[#817F80] text-left'}`}
      >
        {formatTime12hLabel(message.createdAt)}
        {deliveryLabel(isMine, isDeleted, message)}
      </Text>
    </Pressable>
  );
}

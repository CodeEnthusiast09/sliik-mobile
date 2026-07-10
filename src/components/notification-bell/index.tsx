import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, Text, View } from 'react-native';

import { useUnreadCount } from '@/hooks/services/notifications';

interface NotificationBellProps {
  onPress: () => void;
}

export function NotificationBell({ onPress }: NotificationBellProps) {
  const { data: unreadCount } = useUnreadCount();

  return (
    <Pressable
      onPress={onPress}
      hitSlop={10}
      className="h-9 w-9 items-center justify-center"
    >
      <Ionicons name="notifications-outline" size={28} color="#4B2E46" />
      {!!unreadCount && (
        <View className="absolute right-[-2px] top-[-2px] h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[#E5484D] px-1">
          <Text className="text-[11px] font-bold text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </Text>
        </View>
      )}
    </Pressable>
  );
}

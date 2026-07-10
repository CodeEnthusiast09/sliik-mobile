import { Image } from 'expo-image';
import { Text, View } from 'react-native';

import { Button } from '@/components/button';

interface EmptyStateProps {
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ message, actionLabel, onAction }: EmptyStateProps) {
  return (
    <View className="items-center gap-4 py-8">
      <Image
        source={require('../../../assets/images/empty-state.webp')}
        style={{ width: 96, height: 120 }}
        contentFit="contain"
      />
      <Text className="text-center text-[14px] text-[#817F80]">{message}</Text>
      {actionLabel && onAction ? (
        <View className="mt-1 w-full max-w-[240px]">
          <Button label={actionLabel} onPress={onAction} />
        </View>
      ) : null}
    </View>
  );
}

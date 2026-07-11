import { Image } from 'expo-image';
import { Pressable, Text, View } from 'react-native';

interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <View className="flex-1 items-center justify-center gap-3 py-8">
      <Image
        source={require('../../../assets/images/error-state.webp')}
        style={{ width: 242, height: 240 }}
        contentFit="contain"
      />
      <Text className="text-center text-[14px] font-bold text-[#E5484D]">{message}</Text>
      {onRetry && (
        <Pressable onPress={onRetry}>
          <Text className="text-[14px] font-bold text-[#4B2E46]">Retry</Text>
        </Pressable>
      )}
    </View>
  );
}

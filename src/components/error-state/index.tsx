import { Image } from 'expo-image';
import { Pressable, Text, View } from 'react-native';

interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <View className="items-center gap-3 py-8">
      <Image
        source={require('../../../assets/images/error-state.png')}
        style={{ width: 96, height: 120 }}
        contentFit="contain"
      />
      <Text className="text-center text-[14px] text-[#E5484D]">{message}</Text>
      {onRetry && (
        <Pressable onPress={onRetry}>
          <Text className="text-[14px] font-bold text-[#4B2E46]">Retry</Text>
        </Pressable>
      )}
    </View>
  );
}

import { type ReactNode } from 'react';
import { ActivityIndicator, Pressable, Text } from 'react-native';

type ButtonVariant = 'primary' | 'social' | 'ghost';

export type ButtonProps = {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  loading?: boolean;
  disabled?: boolean;
  leftIcon?: ReactNode;
};

const CONTAINER: Record<ButtonVariant, string> = {
  primary: 'min-h-[56px] bg-[#4B2E46] active:bg-[#3C2438]',
  social: 'min-h-[54px] bg-white border border-[#ECE7E0] active:bg-[#F4F0EA]',
  ghost: 'min-h-[48px] active:opacity-70',
};

const LABEL: Record<ButtonVariant, string> = {
  primary: 'text-[#F7EFE4] font-medium',
  social: 'text-[#26242A] font-normal',
  ghost: 'text-[#4B2E46] font-medium',
};

const SHADOW = {
  shadowColor: '#000',
  shadowOpacity: 0.08,
  shadowRadius: 12,
  shadowOffset: { width: 0, height: 6 },
  elevation: 3,
};

export function Button({
  label,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  leftIcon,
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={variant === 'ghost' ? undefined : SHADOW}
      className={`flex-row items-center justify-center gap-2 rounded-[28px] px-6 ${CONTAINER[variant]} ${isDisabled ? 'opacity-50' : ''}`}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? '#F7EFE4' : '#4B2E46'} />
      ) : (
        <>
          {leftIcon}
          <Text className={`text-[16px] ${LABEL[variant]}`}>{label}</Text>
        </>
      )}
    </Pressable>
  );
}

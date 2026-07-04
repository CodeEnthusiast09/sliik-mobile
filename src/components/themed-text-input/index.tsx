import { TextInput, type TextInputProps } from 'react-native';

import { useTheme } from '@/hooks/common/use-theme';

export function ThemedTextInput({ style, ...rest }: TextInputProps) {
  const theme = useTheme();

  return (
    <TextInput
      placeholderTextColor={theme.textSecondary}
      style={[{ color: theme.text, borderColor: theme.border }, style]}
      {...rest}
    />
  );
}

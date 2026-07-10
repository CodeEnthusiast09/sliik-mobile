import Ionicons from '@expo/vector-icons/Ionicons';
import { useState } from 'react';
import { Pressable, TextInput, type TextInputProps, View } from 'react-native';

type IoniconName = keyof typeof Ionicons.glyphMap;

export type TextFieldProps = TextInputProps & {
  leftIcon?: IoniconName;
  /** Renders a password field with a show/hide eye toggle. */
  password?: boolean;
  /** Highlights the field in red (validation / auth error). */
  error?: boolean;
};

const SHADOW = {
  shadowColor: '#000',
  shadowOpacity: 0.05,
  shadowRadius: 8,
  shadowOffset: { width: 0, height: 2 },
  elevation: 1,
};

export function TextField({
  leftIcon,
  password = false,
  error = false,
  ...rest
}: TextFieldProps) {
  const [hidden, setHidden] = useState(true);
  const iconColor = error ? '#E5484D' : '#9A968F';

  return (
    <View
      style={SHADOW}
      className={`min-h-[54px] flex-row items-center gap-3 rounded-[14px] border bg-white px-4 ${
        error ? 'border-[#E5484D]' : 'border-[#ECE7E0]'
      }`}
    >
      {leftIcon ? <Ionicons name={leftIcon} size={20} color={iconColor} /> : null}

      <TextInput
        placeholderTextColor="#A8A39B"
        {...rest}
        secureTextEntry={password ? hidden : rest.secureTextEntry}
        className="flex-1 py-4 text-[16px] text-[#26242A]"
      />

      {password ? (
        <Pressable hitSlop={8} onPress={() => setHidden((value) => !value)}>
          <Ionicons
            name={hidden ? 'eye-outline' : 'eye-off-outline'}
            size={20}
            color={iconColor}
          />
        </Pressable>
      ) : null}
    </View>
  );
}

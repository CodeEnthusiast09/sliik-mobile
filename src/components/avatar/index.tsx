import { Image } from 'expo-image';
import { useState } from 'react';
import { Text, View } from 'react-native';

export type AvatarProps = {
  uri: string | null | undefined;
  name: string;
  size?: number;
  shape?: 'circle' | 'square';
};

export function Avatar({
  uri,
  name,
  size = 56,
  shape = 'circle',
}: AvatarProps) {
  const [failed, setFailed] = useState(false);
  const showImage = !!uri && !failed;
  const borderRadius = shape === 'circle' ? size / 2 : size * 0.13;

  return (
    <View
      style={{ width: size, height: size, borderRadius }}
      className="items-center justify-center overflow-hidden bg-[#F3F0EB]"
    >
      {showImage ? (
        <Image
          source={{ uri: uri as string }}
          style={{ width: size, height: size }}
          contentFit="cover"
          onError={() => setFailed(true)}
        />
      ) : (
        <Text
          style={{ fontSize: size * 0.32 }}
          className="font-bold text-[#4B2E46]"
        >
          {name.charAt(0).toUpperCase()}
        </Text>
      )}
    </View>
  );
}

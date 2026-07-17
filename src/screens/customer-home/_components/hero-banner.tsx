import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, Text, View } from 'react-native';

export function HeroBanner({ onPressBookNow }: { onPressBookNow: () => void }) {
  return (
    <View className="h-[168px] overflow-hidden rounded-[24px] bg-[#2A2226]">
      <Image
        source={require('../../../../assets/images/home-hero.png')}
        style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: '52%' }}
        contentFit="cover"
      />
      <LinearGradient
        colors={['#2A2226', '#2A2226', 'transparent']}
        locations={[0, 0.55, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
      />
      <View className="flex-1 justify-center gap-2 p-5" style={{ maxWidth: '65%' }}>
        <Text className="font-serif-bold text-[17px] leading-[21px] text-white">
          Book beauty & grooming, your way
        </Text>
        <Text className="text-[12px] text-[#E7E1DC]">
          Nigeria&apos;s finest beauty & grooming booking marketplace.
        </Text>
        <Pressable
          onPress={onPressBookNow}
          className="mt-1 self-start rounded-full bg-[#F7EFE4] px-4 py-2"
        >
          <Text className="text-[13px] font-bold text-[#4B2E46]">Book now</Text>
        </Pressable>
      </View>
    </View>
  );
}

import { useRouter } from 'expo-router';
import { Pressable, Text, View } from 'react-native';

export type DealsOffersTabsProps = {
  active: 'deals' | 'offers';
};

const TAB_SHADOW = {
  shadowColor: '#000',
  shadowOpacity: 0.06,
  shadowRadius: 6,
  shadowOffset: { width: 0, height: 2 },
  elevation: 1,
};

export function DealsOffersTabs({ active }: DealsOffersTabsProps) {
  const router = useRouter();

  return (
    <View className="mt-2 flex-row rounded-full bg-[#F3F0EB] p-1">
      <Pressable
        onPress={() => {
          if (active !== 'deals') router.replace('/deals');
        }}
        style={active === 'deals' ? TAB_SHADOW : undefined}
        className={`flex-1 items-center rounded-full py-2.5 ${active === 'deals' ? 'bg-white' : ''}`}
      >
        <Text
          className={`text-[13px] font-bold ${active === 'deals' ? 'text-[#26242A]' : 'text-[#948F86]'}`}
        >
          Sliik Deals
        </Text>
      </Pressable>

      <Pressable
        onPress={() => {
          if (active !== 'offers') router.replace('/offers');
        }}
        style={active === 'offers' ? TAB_SHADOW : undefined}
        className={`flex-1 items-center rounded-full py-2.5 ${active === 'offers' ? 'bg-white' : ''}`}
      >
        <Text
          className={`text-[13px] font-bold ${active === 'offers' ? 'text-[#26242A]' : 'text-[#948F86]'}`}
        >
          My Offers
        </Text>
      </Pressable>
    </View>
  );
}

import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, Text, View, type LayoutChangeEvent } from 'react-native';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

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

const PADDING = 4;
const ANIM_MS = 220;

export function DealsOffersTabs({ active }: DealsOffersTabsProps) {
  const router = useRouter();
  const [localActive, setLocalActive] = useState(active);
  const [thumbWidth, setThumbWidth] = useState(0);
  const translateX = useSharedValue(0);

  // Deals and Offers screens stay mounted when navigating between them, so a
  // stale instance can be revealed with localActive pointing at the tab we
  // animated *toward* before leaving. Re-sync with the route's truth on every
  // focus and snap the thumb without animating.
  useFocusEffect(
    useCallback(() => {
      setLocalActive(active);
      if (thumbWidth > 0) {
        translateX.value = active === 'deals' ? 0 : thumbWidth;
      }
    }, [active, thumbWidth, translateX]),
  );

  function handleLayout(event: LayoutChangeEvent) {
    const width = (event.nativeEvent.layout.width - PADDING * 2) / 2;
    setThumbWidth(width);
    translateX.value = localActive === 'deals' ? 0 : width;
  }

  // Deals and Offers are separate routes - navigate only once the slide has
  // actually played, so the tap is visibly answered on the screen you're
  // still on instead of jumping straight to the other route.
  function handlePress(target: 'deals' | 'offers') {
    if (target === localActive) return;

    if (thumbWidth === 0) {
      router.replace(target === 'deals' ? '/deals' : '/offers');
      return;
    }

    setLocalActive(target);
    translateX.value = withTiming(
      target === 'deals' ? 0 : thumbWidth,
      { duration: ANIM_MS },
      (finished) => {
        if (finished) {
          runOnJS(router.replace)(target === 'deals' ? '/deals' : '/offers');
        }
      },
    );
  }

  const thumbStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <View
      className="mt-2 flex-row rounded-full bg-[#F3F0EB] p-1"
      onLayout={handleLayout}
    >
      {thumbWidth > 0 ? (
        <Animated.View
          style={[
            TAB_SHADOW,
            {
              position: 'absolute',
              top: PADDING,
              bottom: PADDING,
              left: PADDING,
              width: thumbWidth,
              borderRadius: 9999,
              backgroundColor: '#FFFFFF',
            },
            thumbStyle,
          ]}
        />
      ) : null}

      <Pressable
        onPress={() => handlePress('deals')}
        className="flex-1 items-center rounded-full py-2.5"
      >
        <Text
          className={`text-[13px] font-bold ${localActive === 'deals' ? 'text-[#26242A]' : 'text-[#948F86]'}`}
        >
          Sliik Deals
        </Text>
      </Pressable>

      <Pressable
        onPress={() => handlePress('offers')}
        className="flex-1 items-center rounded-full py-2.5"
      >
        <Text
          className={`text-[13px] font-bold ${localActive === 'offers' ? 'text-[#26242A]' : 'text-[#948F86]'}`}
        >
          My Offers
        </Text>
      </Pressable>
    </View>
  );
}

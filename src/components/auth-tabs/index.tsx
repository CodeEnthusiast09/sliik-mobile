import { useEffect, useRef, useState } from 'react';
import { Pressable, Text, View, type LayoutChangeEvent } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import type { AuthMode } from '@/interfaces/auth';

export type AuthTabsProps = {
  active: AuthMode;
  onChange: (target: AuthMode) => void;
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

// Sign up and Sign in now live on the same persisted route (mode is a query
// param, switched via router.setParams rather than navigation) - so `active`
// is a real, changing prop, not a value fixed at mount. The thumb tracks it
// directly via effect instead of owning any navigation/animation-then-navigate
// logic itself.
export function AuthTabs({ active, onChange }: AuthTabsProps) {
  const [thumbWidth, setThumbWidth] = useState(0);
  const translateX = useSharedValue(0);
  const hasMounted = useRef(false);

  function handleLayout(event: LayoutChangeEvent) {
    const width = (event.nativeEvent.layout.width - PADDING * 2) / 2;
    setThumbWidth(width);
  }

  useEffect(() => {
    if (thumbWidth === 0) return;
    const target = active === 'signup' ? 0 : thumbWidth;
    if (hasMounted.current) {
      translateX.value = withTiming(target, { duration: ANIM_MS });
    } else {
      translateX.value = target;
      hasMounted.current = true;
    }
  }, [active, thumbWidth, translateX]);

  function handlePress(target: AuthMode) {
    if (target === active) return;
    onChange(target);
  }

  const thumbStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <View
      className="flex-row rounded-full bg-[#EFEAE1] p-1"
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
        onPress={() => handlePress('signup')}
        className="flex-1 items-center rounded-full py-2.5"
      >
        <Text
          className={`text-[14px] font-bold ${active === 'signup' ? 'text-[#26242A]' : 'text-[#948F86]'}`}
        >
          Sign up
        </Text>
      </Pressable>

      <Pressable
        onPress={() => handlePress('signin')}
        className="flex-1 items-center rounded-full py-2.5"
      >
        <Text
          className={`text-[14px] font-bold ${active === 'signin' ? 'text-[#26242A]' : 'text-[#948F86]'}`}
        >
          Sign in
        </Text>
      </Pressable>
    </View>
  );
}

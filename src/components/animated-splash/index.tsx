import { Image } from 'expo-image';
import { useEffect } from 'react';
import { View, useWindowDimensions } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

import { SliikMark } from '@/components/sliik-mark';

const MARK_ANIM_MS = 900;
const TEXT_DELAY_MS = 700;
const TEXT_ANIM_MS = 550;
const SUBTEXT_DELAY_MS = TEXT_DELAY_MS + TEXT_ANIM_MS + 150;
const SUBTEXT_ANIM_MS = 600;
const HOLD_MS = 500;

export type AnimatedSplashScreenProps = {
  onAnimationEnd: () => void;
};

export function AnimatedSplashScreen({
  onAnimationEnd,
}: AnimatedSplashScreenProps) {
  const { height } = useWindowDimensions();
  const markHeight = height * 0.11;

  const markOpacity = useSharedValue(0);
  const markScale = useSharedValue(0.5);
  const textOpacity = useSharedValue(0);
  const textTranslateX = useSharedValue(-markHeight * 0.3);
  const subtextOpacity = useSharedValue(0);
  const subtextTranslateY = useSharedValue(16);

  function holdThenEnd() {
    setTimeout(onAnimationEnd, HOLD_MS);
  }

  useEffect(() => {
    markOpacity.value = withTiming(1, {
      duration: MARK_ANIM_MS,
      easing: Easing.out(Easing.cubic),
    });
    markScale.value = withTiming(1, {
      duration: MARK_ANIM_MS,
      easing: Easing.out(Easing.back(1.4)),
    });

    textOpacity.value = withDelay(
      TEXT_DELAY_MS,
      withTiming(1, { duration: TEXT_ANIM_MS }),
    );
    textTranslateX.value = withDelay(
      TEXT_DELAY_MS,
      withTiming(0, {
        duration: TEXT_ANIM_MS,
        easing: Easing.out(Easing.cubic),
      }),
    );

    subtextOpacity.value = withDelay(
      SUBTEXT_DELAY_MS,
      withTiming(1, { duration: SUBTEXT_ANIM_MS }),
    );
    subtextTranslateY.value = withDelay(
      SUBTEXT_DELAY_MS,
      withTiming(
        0,
        { duration: SUBTEXT_ANIM_MS, easing: Easing.out(Easing.cubic) },
        (finished) => {
          if (finished) {
            scheduleOnRN(holdThenEnd);
          }
        },
      ),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const markAnimatedStyle = useAnimatedStyle(() => ({
    opacity: markOpacity.value,
    transform: [{ scale: markScale.value }],
  }));

  const textAnimatedStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
    transform: [{ translateX: textTranslateX.value }],
  }));

  const subtextAnimatedStyle = useAnimatedStyle(() => ({
    opacity: subtextOpacity.value,
    transform: [{ translateY: subtextTranslateY.value }],
  }));

  return (
    <View className="flex-1">
      <Image
        source={require('../../../assets/images/splash-bg.png')}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
        contentFit="cover"
      />
      <View className="flex-1 items-center justify-center">
        <View className="flex-row items-center justify-center">
          <Animated.View style={markAnimatedStyle}>
            <SliikMark height={markHeight} color="#FFFFFF" />
          </Animated.View>
          <Animated.Text
            style={[
              {
                fontFamily: 'Fraunces_700Bold',
                color: '#FFFFFF',
                fontSize: markHeight * (28 / 30),
                marginLeft: markHeight * (-3 / 30),
              },
              textAnimatedStyle,
            ]}
          >
            liik
          </Animated.Text>
        </View>
        <Animated.Text
          style={[
            {
              fontFamily: 'Fraunces_400Regular',
              color: '#FFFFFF',
              fontSize: markHeight * 0.15,
              marginTop: markHeight * 0.12,
            },
            subtextAnimatedStyle,
          ]}
        >
          Book beauty & grooming, your way
        </Animated.Text>
      </View>
    </View>
  );
}

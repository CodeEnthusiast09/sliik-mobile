import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { Brand, Spacing } from '@/lib/constants';
import { useTheme } from '@/hooks/common/use-theme';
import { type ToastVariant, useToastStore } from '@/store/toast';

const VISIBLE_MS = 2500;
const ANIM_MS = 220;

export function ToastHost() {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const message = useToastStore((state) => state.message);
  const variant = useToastStore((state) => state.variant);
  const token = useToastStore((state) => state.token);
  const hide = useToastStore((state) => state.hide);

  const opacity = useSharedValue(0);
  const translateY = useSharedValue(-24);

  useEffect(() => {
    if (!message) return;

    opacity.value = withTiming(1, { duration: ANIM_MS });
    translateY.value = withTiming(0, { duration: ANIM_MS });

    const timer = setTimeout(() => {
      opacity.value = withTiming(0, { duration: ANIM_MS });
      translateY.value = withTiming(-24, { duration: ANIM_MS }, (finished) => {
        if (finished) runOnJS(hide)();
      });
    }, VISIBLE_MS);

    return () => clearTimeout(timer);
  }, [token, message, hide, opacity, translateY]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  if (!message) return null;

  const { background, text } = resolveColors(
    variant,
    theme.success,
    theme.danger,
    theme.warning,
  );

  return (
    <View
      pointerEvents="none"
      style={[styles.host, { paddingTop: insets.top + Spacing.six }]}
    >
      <Animated.View
        style={[styles.toast, { backgroundColor: background }, animatedStyle]}
      >
        <ThemedText type="smallBold" style={{ color: text }}>
          {message}
        </ThemedText>
      </Animated.View>
    </View>
  );
}

function resolveColors(
  variant: ToastVariant,
  success: string,
  danger: string,
  warning: string,
): { background: string; text: string } {
  switch (variant) {
    case 'success':
      return { background: success, text: '#ffffff' };
    case 'error':
      return { background: danger, text: '#ffffff' };
    case 'warning':
      return { background: warning, text: Brand.charcoal };
    default:
      return { background: Brand.charcoal, text: Brand.cream };
  }
}

const styles = StyleSheet.create({
  host: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    alignItems: 'center',
    paddingHorizontal: Spacing.four,
  },
  toast: {
    borderRadius: 14,
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.four,
    maxWidth: 460,
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
});

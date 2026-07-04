import { useEffect, useState } from 'react';
import { Animated, DimensionValue, StyleSheet, ViewStyle } from 'react-native';

import { Spacing } from '@/lib/constants';
import { useTheme } from '@/hooks/common/use-theme';
import { ThemedView } from '@/components/themed-view';

interface SkeletonProps {
  width?: DimensionValue;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export function Skeleton({ width = '100%', height = 16, borderRadius = 8, style }: SkeletonProps) {
  const theme = useTheme();
  const [opacity] = useState(() => new Animated.Value(0.4));

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.4, duration: 700, useNativeDriver: true }),
      ]),
    );
    animation.start();
    return () => animation.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        { width, height, borderRadius, backgroundColor: theme.backgroundElement, opacity },
        style,
      ]}
    />
  );
}

interface ListSkeletonProps {
  rows?: number;
  rowHeight?: number;
}

export function ListSkeleton({ rows = 6, rowHeight = 64 }: ListSkeletonProps) {
  return (
    <ThemedView style={styles.list}>
      {Array.from({ length: rows }, (_, index) => (
        <Skeleton key={index} height={rowHeight} borderRadius={16} />
      ))}
    </ThemedView>
  );
}

export function DetailSkeleton() {
  return (
    <ThemedView style={styles.detail}>
      <Skeleton width="55%" height={32} borderRadius={8} />
      <Skeleton height={120} borderRadius={16} />
      <Skeleton height={48} borderRadius={16} />
      <Skeleton height={48} borderRadius={16} />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: Spacing.two,
  },
  detail: {
    gap: Spacing.three,
    marginTop: Spacing.three,
  },
});

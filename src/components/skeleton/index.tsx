import { useEffect, useState } from 'react';
import { Animated, DimensionValue, View, ViewStyle } from 'react-native';

interface SkeletonProps {
  width?: DimensionValue;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export function Skeleton({ width = '100%', height = 16, borderRadius = 8, style }: SkeletonProps) {
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
        { width, height, borderRadius, backgroundColor: '#F3F0EB', opacity },
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
    <View className="gap-2">
      {Array.from({ length: rows }, (_, index) => (
        <Skeleton key={index} height={rowHeight} borderRadius={16} />
      ))}
    </View>
  );
}

export function DetailSkeleton() {
  return (
    <View className="mt-6 gap-4">
      <Skeleton width="55%" height={32} borderRadius={8} />
      <Skeleton height={120} borderRadius={16} />
      <Skeleton height={48} borderRadius={16} />
      <Skeleton height={48} borderRadius={16} />
    </View>
  );
}

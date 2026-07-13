import { useState } from 'react';
import { View } from 'react-native';

const BAR_COUNT = 24;
// expo-audio's metering is a dBFS value - roughly -50 (near-silent room
// tone) to 0 (peak) covers normal speech without the bars looking either
// pinned-flat or constantly maxed out.
const MIN_DB = -50;
const MAX_DB = 0;
const RESTING_LEVEL = 0.05;

function normalize(db: number | undefined): number {
  if (db === undefined || !Number.isFinite(db)) return RESTING_LEVEL;
  const clamped = Math.max(MIN_DB, Math.min(MAX_DB, db));
  return (clamped - MIN_DB) / (MAX_DB - MIN_DB);
}

export function RecordingVisualizer({ metering }: { metering?: number }) {
  const [prevMetering, setPrevMetering] = useState(metering);
  const [levels, setLevels] = useState<number[]>(() =>
    Array(BAR_COUNT).fill(RESTING_LEVEL),
  );

  // Adjusting state during render (React's documented pattern for reacting
  // to a prop change) rather than in an effect - the poll interval is fast
  // enough that the extra effect-then-render round trip would visibly lag
  // behind the mic.
  if (metering !== prevMetering) {
    setPrevMetering(metering);
    setLevels((previous) => [...previous.slice(1), normalize(metering)]);
  }

  return (
    <View className="h-6 flex-1 flex-row items-center gap-[2px]">
      {levels.map((level, index) => (
        <View
          key={index}
          className="flex-1 rounded-full bg-[#4B2E46]"
          style={{ height: Math.max(3, level * 24) }}
        />
      ))}
    </View>
  );
}

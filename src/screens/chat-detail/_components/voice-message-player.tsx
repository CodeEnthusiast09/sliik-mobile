import Ionicons from '@expo/vector-icons/Ionicons';
import { useAudioPlayer, useAudioPlayerStatus, type AudioPlayer } from 'expo-audio';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Text, View, type LayoutChangeEvent } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { runOnJS } from 'react-native-reanimated';

const BAR_COUNT = 20;

// Only one voice message should play at a time across the whole thread.
// Tracked as a plain module variable rather than React/Zustand state -
// pausing the previous player doesn't need to re-render this component,
// only the previous bubble's own status hook does (which it already does
// on its own once .pause() fires a status update).
let activePlayer: AudioPlayer | null = null;

function formatDuration(seconds: number): string {
  const total = Math.max(0, Math.round(seconds));
  const mins = Math.floor(total / 60);
  const secs = total % 60;
  return `${mins}:${String(secs).padStart(2, '0')}`;
}

function clamp01(value: number): number {
  return Math.min(Math.max(value, 0), 1);
}

// Fixed, decorative bar heights (0..1) - purely visual now that bars track
// playback position instead of live volume, so they never need to change.
const BAR_HEIGHTS = Array.from({ length: BAR_COUNT }, (_, i) => {
  const wave = Math.sin(i * 1.7) * 0.5 + 0.5;
  return 0.35 + wave * 0.65;
});

export function VoiceMessagePlayer({
  uri,
  isMine,
  onLongPress,
}: {
  uri: string;
  isMine: boolean;
  onLongPress?: () => void;
}) {
  const player = useAudioPlayer(uri);
  const status = useAudioPlayerStatus(player);
  const [rowWidth, setRowWidth] = useState(0);
  // Non-null while the user is actively dragging - overrides the
  // playback-derived fraction so the bars respond instantly instead of
  // waiting on the next player status tick.
  const [dragFraction, setDragFraction] = useState<number | null>(null);

  function handleLayout(event: LayoutChangeEvent) {
    setRowWidth(event.nativeEvent.layout.width);
  }

  // Release this bubble's claim on "the" active player when it unmounts,
  // so a stale reference can't get paused if another bubble reuses the slot.
  useEffect(() => {
    return () => {
      if (activePlayer === player) {
        activePlayer = null;
      }
    };
  }, [player]);

  function handleToggle() {
    if (status.playing) {
      player.pause();
      return;
    }
    if (activePlayer && activePlayer !== player) {
      activePlayer.pause();
    }
    activePlayer = player;
    // Restart from the beginning once playback has run to the end.
    if (status.duration > 0 && status.currentTime >= status.duration) {
      player.seekTo(0);
    }
    player.play();
  }

  function handleSeek(fraction: number) {
    if (status.duration > 0) {
      player.seekTo(fraction * status.duration);
    }
    setDragFraction(null);
  }

  const playedFraction =
    dragFraction ??
    (status.duration > 0 ? status.currentTime / status.duration : 0);

  // A real drag moves past this before ~500ms of holding still would elapse,
  // handing the gesture to Pan; a still hold instead resolves to LongPress -
  // same distinction WhatsApp itself makes between scrubbing and selecting.
  const barLongPress = Gesture.LongPress().onStart(() => {
    if (onLongPress) runOnJS(onLongPress)();
  });
  const barPan = Gesture.Pan()
    .minDistance(0)
    .onUpdate((event) => {
      if (rowWidth <= 0) return;
      runOnJS(setDragFraction)(clamp01(event.x / rowWidth));
    })
    .onEnd((event) => {
      if (rowWidth <= 0) return;
      runOnJS(handleSeek)(clamp01(event.x / rowWidth));
    });
  const barGesture = Gesture.Race(barLongPress, barPan);

  const iconTap = Gesture.Tap().onEnd((_event, success) => {
    if (success) runOnJS(handleToggle)();
  });
  const iconLongPress = Gesture.LongPress().onStart(() => {
    if (onLongPress) runOnJS(onLongPress)();
  });
  const iconGesture = Gesture.Race(iconLongPress, iconTap);

  const iconColor = isMine ? '#F7EFE4' : '#4B2E46';
  // Counts down remaining time once playback has started, otherwise shows
  // the total length - same convention as WhatsApp/iMessage voice notes.
  const displaySeconds =
    status.currentTime > 0
      ? Math.max(status.duration - status.currentTime, 0)
      : status.duration;

  return (
    <View className="flex-row items-center gap-2 py-1" style={{ minWidth: 190 }}>
      <GestureDetector gesture={iconGesture}>
        <View
          className={`h-9 w-9 items-center justify-center rounded-full ${isMine ? 'bg-white/15' : 'bg-[#4B2E4614]'}`}
        >
          <Ionicons
            name={status.playing ? 'pause' : 'play'}
            size={16}
            color={iconColor}
          />
        </View>
      </GestureDetector>
      <GestureDetector gesture={barGesture}>
        <View
          onLayout={handleLayout}
          className="h-6 flex-1 flex-row items-center gap-[2px]"
        >
          {BAR_HEIGHTS.map((barHeight, index) => {
            const isPlayed = index / BAR_COUNT < playedFraction;
            return (
              <View
                key={index}
                className="flex-1 rounded-full"
                style={{
                  height: Math.max(3, barHeight * 24),
                  backgroundColor: isMine ? '#F7EFE4' : '#4B2E46',
                  opacity: isPlayed ? (isMine ? 0.85 : 0.7) : (isMine ? 0.35 : 0.3),
                }}
              />
            );
          })}
        </View>
      </GestureDetector>
      <Text className={`text-[13px] ${isMine ? 'text-[#F7EFE4]' : 'text-[#26242A]'}`}>
        {formatDuration(displaySeconds)}
      </Text>
    </View>
  );
}

// Shown in place of VoiceMessagePlayer while a recording is still uploading
// (no mediaUrl yet) - same shape, resting bars, no play button since there's
// nothing playable yet.
export function PendingVoiceMessage({ isMine }: { isMine: boolean }) {
  const barColor = isMine ? '#F7EFE4' : '#4B2E46';

  return (
    <View className="flex-row items-center gap-2 py-1" style={{ minWidth: 190 }}>
      <View
        className={`h-9 w-9 items-center justify-center rounded-full ${isMine ? 'bg-white/15' : 'bg-[#4B2E4614]'}`}
      >
        <ActivityIndicator size="small" color={isMine ? '#F7EFE4' : '#4B2E46'} />
      </View>
      <View className="h-6 flex-1 flex-row items-center gap-[2px]">
        {BAR_HEIGHTS.map((barHeight, index) => (
          <View
            key={index}
            className="flex-1 rounded-full"
            style={{
              height: Math.max(3, barHeight * 24),
              backgroundColor: barColor,
              opacity: isMine ? 0.35 : 0.3,
            }}
          />
        ))}
      </View>
    </View>
  );
}

import Ionicons from '@expo/vector-icons/Ionicons';
import {
  requestRecordingPermissionsAsync,
  useAudioPlayer,
  useAudioPlayerStatus,
  useAudioSampleListener,
  type AudioPlayer,
  type AudioSample,
} from 'expo-audio';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';

const BAR_COUNT = 20;
const RESTING_LEVEL = 0.12;

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

// Root-mean-square of the frame amplitudes (-1..1) as a single 0..1 level
// for this sample tick - a standard, cheap loudness estimate.
function amplitudeOf(sample: AudioSample): number {
  const frames = sample.channels[0]?.frames ?? [];
  if (frames.length === 0) return 0;
  const sumSquares = frames.reduce((sum, frame) => sum + frame * frame, 0);
  return Math.sqrt(sumSquares / frames.length);
}

export function VoiceMessagePlayer({
  uri,
  isMine,
}: {
  uri: string;
  isMine: boolean;
}) {
  const player = useAudioPlayer(uri);
  const status = useAudioPlayerStatus(player);
  const [levels, setLevels] = useState<number[]>(() =>
    Array(BAR_COUNT).fill(RESTING_LEVEL),
  );
  // Audio sampling needs RECORD_AUDIO permission on Android even though
  // this is playback, not recording - request it best-effort. Playback
  // itself still works without it, the bars just stay at rest.
  const [samplingAllowed, setSamplingAllowed] = useState(false);

  useEffect(() => {
    requestRecordingPermissionsAsync()
      .then(({ granted }) => setSamplingAllowed(granted))
      .catch(() => setSamplingAllowed(false));
  }, []);

  useAudioSampleListener(player, (sample) => {
    if (!samplingAllowed) return;
    setLevels((previous) => [...previous.slice(1), amplitudeOf(sample)]);
  });

  // Release this bubble's claim on "the" active player when it unmounts,
  // so a stale reference can't get paused if another bubble reuses the slot.
  useEffect(() => {
    return () => {
      if (activePlayer === player) {
        activePlayer = null;
      }
    };
  }, [player]);

  // Adjusting state during render (React's documented pattern for reacting
  // to a prop/status change) rather than in an effect - resets the bars to
  // rest the moment playback stops instead of one render later.
  const [prevPlaying, setPrevPlaying] = useState(status.playing);
  if (status.playing !== prevPlaying) {
    setPrevPlaying(status.playing);
    if (!status.playing) {
      setLevels(Array(BAR_COUNT).fill(RESTING_LEVEL));
    }
  }

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

  const iconColor = isMine ? '#F7EFE4' : '#4B2E46';
  const barColor = isMine ? '#F7EFE4' : '#4B2E46';
  // Counts down remaining time once playback has started, otherwise shows
  // the total length - same convention as WhatsApp/iMessage voice notes.
  const displaySeconds =
    status.currentTime > 0
      ? Math.max(status.duration - status.currentTime, 0)
      : status.duration;

  return (
    <Pressable
      onPress={handleToggle}
      className="flex-row items-center gap-2 py-1"
      style={{ minWidth: 190 }}
    >
      <View
        className={`h-9 w-9 items-center justify-center rounded-full ${isMine ? 'bg-white/15' : 'bg-[#4B2E4614]'}`}
      >
        <Ionicons
          name={status.playing ? 'pause' : 'play'}
          size={16}
          color={iconColor}
        />
      </View>
      <View className="h-6 flex-1 flex-row items-center gap-[2px]">
        {levels.map((level, index) => (
          <View
            key={index}
            className="flex-1 rounded-full"
            style={{
              height: Math.max(3, level * 24),
              backgroundColor: barColor,
              opacity: isMine ? 0.85 : 0.7,
            }}
          />
        ))}
      </View>
      <Text className={`text-[13px] ${isMine ? 'text-[#F7EFE4]' : 'text-[#26242A]'}`}>
        {formatDuration(displaySeconds)}
      </Text>
    </Pressable>
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
        {Array.from({ length: BAR_COUNT }).map((_, index) => (
          <View
            key={index}
            className="flex-1 rounded-full"
            style={{
              height: RESTING_LEVEL * 24,
              backgroundColor: barColor,
              opacity: isMine ? 0.5 : 0.4,
            }}
          />
        ))}
      </View>
    </View>
  );
}

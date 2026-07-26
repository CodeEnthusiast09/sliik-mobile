import Ionicons from '@expo/vector-icons/Ionicons';
import { Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';

const CANCEL_THRESHOLD_X = -80;
const LOCK_THRESHOLD_Y = -80;

// Press-and-hold voice recorder, WhatsApp-style: recording starts on
// touch-down (onStart), and the gesture resolves one of three ways on
// release - drag left past the threshold cancels, drag up past the
// threshold locks (recording keeps going hands-free), otherwise releasing
// stops and sends immediately.
export function RecordButton({
  onStart,
  onCancel,
  onLock,
  onSend,
}: {
  onStart: () => void;
  onCancel: () => void;
  onLock: () => void;
  onSend: () => void;
}) {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  // Drives hint visibility - the slide-to-cancel text and lock chevron
  // should only show while a touch is actually down, not at rest.
  const isPressed = useSharedValue(0);
  // Guard onEnd once the drag has already resolved to a lock or a cancel -
  // both trigger immediately on crossing their threshold (mid-drag, not on
  // release), so releasing afterwards shouldn't also send it. Without this,
  // dragging past the cancel zone and back before lifting would still send.
  const isLocked = useSharedValue(false);
  const isCancelled = useSharedValue(false);

  const panGesture = Gesture.Pan()
    .minDistance(0)
    .onBegin(() => {
      translateX.value = 0;
      translateY.value = 0;
      isLocked.value = false;
      isCancelled.value = false;
      isPressed.value = 1;
      runOnJS(onStart)();
    })
    .onUpdate((event) => {
      if (isLocked.value || isCancelled.value) return;
      // Only the cancel (left) and lock (up) directions matter here - clamp
      // out right/down movement so the hints don't fight the drag.
      translateX.value = Math.min(event.translationX, 0);
      translateY.value = Math.min(event.translationY, 0);
      if (translateY.value <= LOCK_THRESHOLD_Y) {
        isLocked.value = true;
        runOnJS(onLock)();
        return;
      }
      if (translateX.value <= CANCEL_THRESHOLD_X) {
        isCancelled.value = true;
        runOnJS(onCancel)();
      }
    })
    .onEnd(() => {
      if (isLocked.value || isCancelled.value) return;
      runOnJS(onSend)();
    })
    .onFinalize(() => {
      isPressed.value = 0;
      // Snap back immediately on release (cancel or send) instead of
      // leaving the button visually offset until the next press's onBegin
      // resets it - onBegin only fires again once a new gesture starts.
      if (!isLocked.value) {
        translateX.value = 0;
        translateY.value = 0;
      }
    });

  const cancelHintStyle = useAnimatedStyle(() => ({
    opacity: isPressed.value * interpolate(translateX.value, [CANCEL_THRESHOLD_X, 0], [0, 1]),
    transform: [{ translateX: translateX.value }],
  }));

  const lockHintStyle = useAnimatedStyle(() => ({
    opacity: isPressed.value * interpolate(translateY.value, [LOCK_THRESHOLD_Y, 0], [0, 1]),
    transform: [{ translateY: Math.max(translateY.value, LOCK_THRESHOLD_Y) }],
  }));

  const buttonStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
    ],
  }));

  return (
    <View style={{ height: 24, width: 24, alignItems: 'center', justifyContent: 'center' }}>
      <Animated.View
        pointerEvents="none"
        style={[
          {
            position: 'absolute',
            right: 32,
            top: 2,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 4,
            zIndex: 20,
          },
          cancelHintStyle,
        ]}
      >
        <Ionicons name="chevron-back" size={14} color="#948F86" />
        <Text className="text-[13px] text-[#948F86]">Slide to cancel</Text>
      </Animated.View>

      <Animated.View
        pointerEvents="none"
        style={[
          { position: 'absolute', bottom: 36, zIndex: 20 },
          lockHintStyle,
        ]}
      >
        <View className="h-9 w-9 items-center justify-center rounded-full border border-[#ECE7E0] bg-white">
          <Ionicons name="lock-closed-outline" size={16} color="#4B2E46" />
        </View>
      </Animated.View>

      <GestureDetector gesture={panGesture}>
        <Animated.View style={[{ height: 24, width: 24, alignItems: 'center', justifyContent: 'center' }, buttonStyle]}>
          <Ionicons name="mic-outline" size={20} color="#4B2E46" />
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

import Ionicons from '@expo/vector-icons/Ionicons';
import { Image } from 'expo-image';
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import type { ImagePickerAsset } from 'expo-image-picker';
import { useState } from 'react';
import { ActivityIndicator, Modal, Platform, Pressable, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle, useSharedValue } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { getErrorMessage } from '@/lib/utils';
import { showToast } from '@/store/toast';

// Square crop viewport - matches the 200x200 square an image message
// actually renders at in the chat bubble (message-bubble.tsx).
const VIEWPORT = 300;

type WorkingImage = {
  uri: string;
  width: number;
  height: number;
};

function clamp(value: number, min: number, max: number): number {
  'worklet';
  return Math.min(Math.max(value, min), max);
}

async function rotateImage(image: WorkingImage): Promise<WorkingImage> {
  const rendered = await ImageManipulator.manipulate(image.uri).rotate(90).renderAsync();
  const result = await rendered.saveAsync({ format: SaveFormat.JPEG, compress: 0.9 });
  return { uri: result.uri, width: result.width, height: result.height };
}

async function cropImage(
  image: WorkingImage,
  crop: { originX: number; originY: number; width: number; height: number },
): Promise<WorkingImage> {
  const rendered = await ImageManipulator.manipulate(image.uri).crop(crop).renderAsync();
  const result = await rendered.saveAsync({ format: SaveFormat.JPEG, compress: 0.9 });
  return { uri: result.uri, width: result.width, height: result.height };
}

// expo-image-manipulator hands back a plain uri (a blob: url on web), never
// a File - but uploadImage() reads asset.file directly on web instead of
// fetching asset.uri itself, so a rotated/cropped image needs converting
// back into a real File before it can be sent through the existing upload
// path unchanged.
async function toImagePickerAsset(
  image: WorkingImage,
  original: ImagePickerAsset,
): Promise<ImagePickerAsset> {
  if (Platform.OS !== 'web') {
    return { ...original, uri: image.uri, width: image.width, height: image.height };
  }
  const response = await fetch(image.uri);
  const blob = await response.blob();
  const file = new File([blob], original.fileName ?? 'photo.jpg', {
    type: blob.type || 'image/jpeg',
  });
  return {
    ...original,
    uri: image.uri,
    width: image.width,
    height: image.height,
    file,
  };
}

export function ImagePreviewModal({
  asset,
  onCancel,
  onSend,
}: {
  asset: ImagePickerAsset | null;
  onCancel: () => void;
  onSend: (asset: ImagePickerAsset) => void;
}) {
  // Parent remounts this component (via a `key` on the asset) whenever a new
  // photo is picked, so a lazy initializer here is enough to seed state from
  // the asset - no effect needed to "reset on prop change".
  const [working, setWorking] = useState<WorkingImage | null>(() =>
    asset ? { uri: asset.uri, width: asset.width, height: asset.height } : null,
  );
  const [mode, setMode] = useState<'preview' | 'crop'>('preview');
  const [isBusy, setIsBusy] = useState(false);

  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const savedTranslateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const savedTranslateY = useSharedValue(0);

  function resetCropTransform() {
    scale.value = 1;
    savedScale.value = 1;
    translateX.value = 0;
    savedTranslateX.value = 0;
    translateY.value = 0;
    savedTranslateY.value = 0;
  }

  const imgW = working?.width ?? 1;
  const imgH = working?.height ?? 1;
  const baseScale = VIEWPORT / Math.min(imgW, imgH);

  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      const dispW = imgW * baseScale * scale.value;
      const dispH = imgH * baseScale * scale.value;
      const maxX = Math.max((dispW - VIEWPORT) / 2, 0);
      const maxY = Math.max((dispH - VIEWPORT) / 2, 0);
      translateX.value = clamp(savedTranslateX.value + event.translationX, -maxX, maxX);
      translateY.value = clamp(savedTranslateY.value + event.translationY, -maxY, maxY);
    })
    .onEnd(() => {
      savedTranslateX.value = translateX.value;
      savedTranslateY.value = translateY.value;
    });

  const pinchGesture = Gesture.Pinch()
    .onUpdate((event) => {
      scale.value = clamp(savedScale.value * event.scale, 1, 4);
    })
    .onEnd(() => {
      savedScale.value = scale.value;
    });

  const cropGesture = Gesture.Simultaneous(panGesture, pinchGesture);

  const imageAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  async function handleRotate() {
    if (!working) return;
    setIsBusy(true);
    try {
      setWorking(await rotateImage(working));
      resetCropTransform();
    } catch (err) {
      showToast(getErrorMessage(err), 'error');
    } finally {
      setIsBusy(false);
    }
  }

  async function handleConfirmCrop() {
    if (!working) return;
    const factor = baseScale * scale.value;
    const dispW = imgW * factor;
    const dispH = imgH * factor;
    const originXDisplayed = dispW / 2 - translateX.value - VIEWPORT / 2;
    const originYDisplayed = dispH / 2 - translateY.value - VIEWPORT / 2;
    const cropSize = VIEWPORT / factor;
    const originX = clamp(originXDisplayed / factor, 0, imgW - cropSize);
    const originY = clamp(originYDisplayed / factor, 0, imgH - cropSize);

    setIsBusy(true);
    try {
      const cropped = await cropImage(working, {
        originX: Math.round(originX),
        originY: Math.round(originY),
        width: Math.round(cropSize),
        height: Math.round(cropSize),
      });
      setWorking(cropped);
      setMode('preview');
      resetCropTransform();
    } catch (err) {
      showToast(getErrorMessage(err), 'error');
    } finally {
      setIsBusy(false);
    }
  }

  async function handleSend() {
    if (!working || !asset || isBusy) return;
    setIsBusy(true);
    const finalAsset = await toImagePickerAsset(working, asset);
    onSend(finalAsset);
  }

  return (
    <Modal
      visible={asset !== null}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View className="flex-1 bg-black">
        <SafeAreaView className="flex-1">
          {working ? (
            <>
              <Pressable
                onPress={mode === 'crop' ? () => setMode('preview') : onCancel}
                disabled={isBusy}
                hitSlop={10}
                className="absolute left-4 top-4 z-10 h-10 w-10 items-center justify-center rounded-full bg-black/50"
              >
                <Ionicons name="close" size={24} color="#FFFFFF" />
              </Pressable>

              <View className="flex-1 items-center justify-center">
                {mode === 'crop' ? (
                  <View
                    style={{ width: VIEWPORT, height: VIEWPORT, borderRadius: 12, overflow: 'hidden' }}
                  >
                    <GestureDetector gesture={cropGesture}>
                      <Animated.View
                        style={[
                          { width: imgW * baseScale, height: imgH * baseScale },
                          imageAnimatedStyle,
                        ]}
                      >
                        <Image
                          source={{ uri: working.uri }}
                          style={{ width: '100%', height: '100%' }}
                          contentFit="cover"
                        />
                      </Animated.View>
                    </GestureDetector>
                  </View>
                ) : (
                  <Image
                    source={{ uri: working.uri }}
                    style={{ width: '100%', height: '100%' }}
                    contentFit="contain"
                  />
                )}
              </View>

              {isBusy ? (
                <View className="absolute inset-0 items-center justify-center bg-black/30">
                  <ActivityIndicator size="large" color="#FFFFFF" />
                </View>
              ) : null}

              <View className="flex-row items-center justify-between px-6 pb-6">
                {mode === 'crop' ? (
                  <>
                    <View className="h-11 w-11" />
                    <Text className="text-[13px] text-white/70">
                      Pinch to zoom, drag to reposition
                    </Text>
                    <Pressable
                      onPress={handleConfirmCrop}
                      disabled={isBusy}
                      className="h-11 w-11 items-center justify-center rounded-full bg-[#4B2E46]"
                    >
                      <Ionicons name="checkmark" size={22} color="#F7EFE4" />
                    </Pressable>
                  </>
                ) : (
                  <>
                    <Pressable
                      onPress={handleRotate}
                      disabled={isBusy}
                      hitSlop={8}
                      className="h-11 w-11 items-center justify-center rounded-full bg-white/15"
                    >
                      <Ionicons name="reload-outline" size={20} color="#FFFFFF" />
                    </Pressable>
                    <Pressable
                      onPress={() => setMode('crop')}
                      disabled={isBusy}
                      hitSlop={8}
                      className="h-11 w-11 items-center justify-center rounded-full bg-white/15"
                    >
                      <Ionicons name="crop-outline" size={20} color="#FFFFFF" />
                    </Pressable>
                    <Pressable
                      onPress={handleSend}
                      disabled={isBusy}
                      className="h-14 w-14 items-center justify-center rounded-full bg-[#4B2E46]"
                    >
                      <Ionicons name="send" size={22} color="#F7EFE4" />
                    </Pressable>
                  </>
                )}
              </View>
            </>
          ) : null}
        </SafeAreaView>
      </View>
    </Modal>
  );
}

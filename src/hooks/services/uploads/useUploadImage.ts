import type { ImagePickerAsset } from 'expo-image-picker';
import { useMutation } from '@tanstack/react-query';

import { uploadImage } from '@/services/uploads';

export function useUploadImage() {
  return useMutation({
    mutationFn: (asset: ImagePickerAsset) => uploadImage(asset),
  });
}

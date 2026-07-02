import type { ImagePickerAsset } from 'expo-image-picker';
import { Platform } from 'react-native';

import type { ApiResponse } from '@/interfaces/api-response';

import { apiClient } from './api-client';

export async function uploadImage(asset: ImagePickerAsset) {
  const formData = new FormData();

  // On web, expo-image-picker returns a real File object we can append directly.
  // On native, it only gives a local file:// uri, so a {uri, name, type} descriptor
  // is what React Native's FormData/multipart implementation expects instead.
  if (Platform.OS === 'web' && asset.file) {
    formData.append('file', asset.file);
  } else {
    formData.append(
      'file',
      {
        uri: asset.uri,
        name: asset.fileName ?? 'upload.jpg',
        type: asset.mimeType ?? 'image/jpeg',
      } as unknown as Blob,
    );
  }

  const { data } = await apiClient.post<ApiResponse<{ url: string }>>(
    '/uploads/image',
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } },
  );
  return data;
}

import { useMutation } from '@tanstack/react-query';

import { uploadAudio } from '@/services/uploads';

export function useUploadAudio() {
  return useMutation({
    mutationFn: (uri: string) => uploadAudio(uri),
  });
}

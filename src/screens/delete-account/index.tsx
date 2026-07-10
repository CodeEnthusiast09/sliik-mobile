import { Ionicons } from '@expo/vector-icons';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { TextField } from '@/components/text-field';
import { useDeleteAccount } from '@/hooks/services/users';
import { getErrorMessage } from '@/lib/utils';
import { unregisterPushToken } from '@/services/notifications';
import { useAuthStore } from '@/store/auth';
import { usePushTokenStore } from '@/store/push-token';
import { showToast } from '@/store/toast';

export function DeleteAccountScreen() {
  const router = useRouter();
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const queryClient = useQueryClient();
  const mutation = useDeleteAccount();

  const [password, setPassword] = useState('');

  function handleDelete() {
    mutation.mutate(password || undefined, {
      onSuccess: async () => {
        const pushToken = usePushTokenStore.getState().token;
        if (pushToken) {
          await unregisterPushToken(pushToken).catch(() => {});
        }
        clearAuth();
        queryClient.clear();
        showToast('Your account has been deleted.', 'success');
        router.replace('/login');
      },
      onError: (error) => showToast(getErrorMessage(error), 'error'),
    });
  }

  return (
    <View className="flex-1 bg-[#FBF8F3]">
      <SafeAreaView className="flex-1" edges={['top', 'bottom']}>
        <KeyboardAvoidingView
          className="flex-1"
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView
            contentContainerClassName="grow px-6 pb-6"
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <Pressable
              onPress={() => router.back()}
              hitSlop={8}
              className="-ml-2 mt-1 h-10 w-10 items-center justify-center"
            >
              <Ionicons name="arrow-back" size={26} color="#4B2E46" />
            </Pressable>

            <View className="mt-6 h-16 w-16 items-center justify-center self-center rounded-full bg-[#FBE7E7]">
              <Ionicons name="warning-outline" size={30} color="#E5484D" />
            </View>

            <Text className="mt-5 text-center font-serif-regular text-[30px] leading-[36px] text-[#26242A]">
              Delete account
            </Text>
            <Text className="mt-2.5 text-center text-[15px] leading-[22px] text-[#817F80]">
              This permanently deletes your account and removes your profile. It
              can&apos;t be undone. Cancel any active bookings, offers, or deals
              first.
            </Text>

            <View className="mt-8">
              <TextField
                leftIcon="lock-closed-outline"
                placeholder="Enter your password"
                value={password}
                onChangeText={setPassword}
                password
              />
              <Text className="mt-2 px-1 text-[12px] text-[#817F80]">
                Signed up with Google or Apple? Leave this blank.
              </Text>
            </View>

            <Pressable
              onPress={handleDelete}
              disabled={mutation.isPending}
              className={`mt-8 min-h-[56px] flex-row items-center justify-center rounded-[28px] bg-[#E5484D] px-6 active:bg-[#C93B40] ${
                mutation.isPending ? 'opacity-50' : ''
              }`}
            >
              {mutation.isPending ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text className="text-[16px] font-medium text-white">
                  Permanently delete
                </Text>
              )}
            </Pressable>

            <Pressable
              onPress={() => router.back()}
              className="mt-4 items-center py-2"
            >
              <Text className="text-[14px] font-bold text-[#4B2E46]">
                Cancel
              </Text>
            </Pressable>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

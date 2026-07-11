import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/button';
import { EmptyState } from '@/components/empty-state';
import { ErrorState } from '@/components/error-state';
import { ScreenHeader } from '@/components/screen-header';
import { DetailSkeleton } from '@/components/skeleton';
import { useHideTabBar } from '@/hooks/common/use-hide-tab-bar';
import {
  useBanks,
  useCreatePayoutAccount,
  usePayoutAccount,
  useResolveAccountName,
} from '@/hooks/services/payouts';
import type { Bank } from '@/interfaces/provider';
import { getErrorMessage } from '@/lib/utils';
import { createPayoutAccountSchema } from '@/validations/payout';

export function ProviderPayoutScreen() {
  const router = useRouter();

  useHideTabBar();

  const {
    data: payoutAccount,
    isLoading: isLoadingAccount,
    isError: isAccountError,
    error: accountError,
    refetch: refetchAccount,
  } = usePayoutAccount();
  const {
    data: banks,
    isLoading: isLoadingBanks,
    isError: isBanksError,
    error: banksError,
    refetch: refetchBanks,
  } = useBanks();
  const createPayoutAccountMutation = useCreatePayoutAccount();

  const [search, setSearch] = useState('');
  const [selectedBank, setSelectedBank] = useState<Bank | null>(null);
  const [accountNumber, setAccountNumber] = useState('');
  const [fieldError, setFieldError] = useState<string | null>(null);

  const {
    data: resolvedAccount,
    isFetching: isResolvingAccount,
    isError: isResolveError,
  } = useResolveAccountName(selectedBank?.code, accountNumber);

  const filteredBanks = useMemo(() => {
    if (!banks) return [];
    if (!search) return banks;
    return banks.filter((bank) =>
      bank.name.toLowerCase().includes(search.toLowerCase()),
    );
  }, [banks, search]);

  function handleSubmit() {
    setFieldError(null);

    const result = createPayoutAccountSchema.safeParse({
      bankCode: selectedBank?.code ?? '',
      accountNumber,
    });

    if (!result.success) {
      setFieldError(result.error.issues[0]?.message ?? 'Invalid input');
      return;
    }

    createPayoutAccountMutation.mutate(result.data, {
      onSuccess: () => router.back(),
    });
  }

  const serverError = createPayoutAccountMutation.isError
    ? getErrorMessage(createPayoutAccountMutation.error)
    : null;

  if (isAccountError) {
    return (
      <View className="flex-1 bg-white">
        <SafeAreaView className="flex-1" edges={['top', 'bottom']}>
          <View className="flex-1 px-6">
            <ErrorState
              message={getErrorMessage(accountError)}
              onRetry={refetchAccount}
            />
          </View>
        </SafeAreaView>
      </View>
    );
  }

  if (isLoadingAccount) {
    return (
      <View className="flex-1 bg-white">
        <SafeAreaView className="flex-1" edges={['top', 'bottom']}>
          <View className="flex-1 px-6">
            <DetailSkeleton />
          </View>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      <SafeAreaView className="flex-1" edges={['top', 'bottom']}>
        <View className="flex-1 px-6">
          <ScreenHeader
            title="Payout details"
            notificationsHref="/profile/notifications"
            onBack={() => router.back()}
          />

          {payoutAccount ? (
            <View className="mt-4 gap-1 rounded-[20px] border border-[#ECE7E0] bg-white p-4">
              <Text className="font-serif-bold text-[15px] text-[#26242A]">
                {payoutAccount.accountName}
              </Text>
              <Text className="text-[13px] text-[#817F80]">
                {payoutAccount.accountNumber}
              </Text>
              <Text className="text-[13px] text-[#817F80]">
                {payoutAccount.verified ? 'Verified' : 'Pending verification'}
              </Text>
            </View>
          ) : (
            <>
              <Text className="mt-4 text-[13px] text-[#817F80]">
                Set up your payout account to start receiving bookings.
              </Text>

              {selectedBank ? (
                <Pressable
                  onPress={() => setSelectedBank(null)}
                  className="mt-3 flex-row items-center justify-between rounded-[20px] border border-[#ECE7E0] bg-white p-4"
                >
                  <Text className="text-[15px] text-[#26242A]">
                    {selectedBank.name}
                  </Text>
                  <Text className="text-[13px] text-[#817F80]">Change</Text>
                </Pressable>
              ) : (
                <>
                  <TextInput
                    placeholder="Search for your bank"
                    placeholderTextColor="#A8A39B"
                    value={search}
                    onChangeText={setSearch}
                    className="mt-3 rounded-[16px] border border-[#ECE7E0] bg-white px-4 py-3.5 text-[15px] text-[#26242A]"
                    style={{ outlineWidth: 0 }}
                  />
                  {isLoadingBanks ? (
                    <ActivityIndicator className="mt-4" color="#4B2E46" />
                  ) : isBanksError ? (
                    <ErrorState
                      message={getErrorMessage(banksError)}
                      onRetry={refetchBanks}
                    />
                  ) : (
                    <FlatList
                      showsVerticalScrollIndicator={false}
                      data={filteredBanks}
                      keyExtractor={(bank) => `${bank.code}-${bank.name}`}
                      style={{ maxHeight: 280 }}
                      className="mt-2"
                      ListEmptyComponent={
                        <EmptyState message="No banks found." />
                      }
                      renderItem={({ item }) => (
                        <Pressable
                          onPress={() => setSelectedBank(item)}
                          className="border-b border-[#ECE7E0] py-3"
                        >
                          <Text className="text-[15px] text-[#26242A]">
                            {item.name}
                          </Text>
                        </Pressable>
                      )}
                    />
                  )}
                </>
              )}

              {selectedBank ? (
                <TextInput
                  placeholder="Account number"
                  placeholderTextColor="#A8A39B"
                  value={accountNumber}
                  onChangeText={setAccountNumber}
                  keyboardType="number-pad"
                  className="mt-3 rounded-[16px] border border-[#ECE7E0] bg-white px-4 py-3.5 text-[15px] text-[#26242A]"
                  style={{ outlineWidth: 0 }}
                />
              ) : null}

              {accountNumber.length === 10 && isResolvingAccount ? (
                <View className="mt-3 flex-row items-center gap-2">
                  <ActivityIndicator size="small" color="#4B2E46" />
                  <Text className="text-[13px] text-[#817F80]">
                    Checking account…
                  </Text>
                </View>
              ) : null}

              {resolvedAccount?.accountName ? (
                <View className="mt-3 gap-1 rounded-[20px] border border-[#2F9E44] bg-white p-4">
                  <View className="flex-row items-center gap-2">
                    <Ionicons name="checkmark-circle" size={18} color="#2F9E44" />
                    <Text className="text-[13px] font-bold text-[#2F9E44]">
                      Account verified
                    </Text>
                  </View>
                  <Text className="font-serif-bold text-[15px] text-[#26242A]">
                    {resolvedAccount.accountName}
                  </Text>
                </View>
              ) : null}

              {isResolveError ? (
                <Text className="mt-3 text-[13px] text-[#E5484D]">
                  Could not resolve this account - check the number and bank.
                </Text>
              ) : null}

              {(fieldError ?? serverError) ? (
                <Text className="mt-3 text-[13px] text-[#E5484D]">
                  {fieldError ?? serverError}
                </Text>
              ) : null}

              {selectedBank ? (
                <View className="mt-4">
                  <Button
                    label={
                      createPayoutAccountMutation.isPending
                        ? 'Setting up…'
                        : 'Set up payouts'
                    }
                    onPress={handleSubmit}
                    loading={createPayoutAccountMutation.isPending}
                    disabled={!resolvedAccount?.accountName}
                  />
                </View>
              ) : null}
            </>
          )}
        </View>
      </SafeAreaView>
    </View>
  );
}

import Ionicons from '@expo/vector-icons/Ionicons';
import { zodResolver } from '@hookform/resolvers/zod';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { ActivityIndicator, FlatList, Pressable, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { z } from 'zod';

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
import { firstFormError, getErrorMessage } from '@/lib/utils';
import { createPayoutAccountSchema } from '@/validations/payout';

type PayoutFormValues = z.infer<typeof createPayoutAccountSchema>;

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

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<PayoutFormValues>({
    resolver: zodResolver(createPayoutAccountSchema),
    defaultValues: { bankCode: '', bankName: '', accountNumber: '' },
  });

  const [search, setSearch] = useState('');

  const bankCode = useWatch({ control, name: 'bankCode' });
  const accountNumber = useWatch({ control, name: 'accountNumber' });
  const selectedBank = banks?.find((bank) => bank.code === bankCode);

  const {
    data: resolvedAccount,
    isFetching: isResolvingAccount,
    isError: isResolveError,
  } = useResolveAccountName(bankCode || undefined, accountNumber);

  const filteredBanks = useMemo(() => {
    if (!banks) return [];
    if (!search) return banks;
    return banks.filter((bank) =>
      bank.name.toLowerCase().includes(search.toLowerCase()),
    );
  }, [banks, search]);

  function onValid(data: PayoutFormValues) {
    createPayoutAccountMutation.mutate(data, {
      onSuccess: () => router.back(),
    });
  }

  const serverError = createPayoutAccountMutation.isError
    ? getErrorMessage(createPayoutAccountMutation.error)
    : null;
  const formError = firstFormError(errors);

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
            showNotifications={false}
          />

          {payoutAccount ? (
            <View className="mt-4 gap-3">
              <View className="gap-1 rounded-[20px] border border-[#2F9E44] bg-white p-4">
                <View className="flex-row items-center gap-2">
                  <Ionicons name="checkmark-circle" size={18} color="#2F9E44" />
                  <Text className="text-[13px] font-bold text-[#2F9E44]">
                    Account verified
                  </Text>
                </View>
                <Text className="text-[13px] text-[#817F80]">
                  Your account details are valid and ready to receive payouts.
                </Text>
              </View>

              <View className="rounded-[20px] border border-[#ECE7E0] bg-white">
                <View className="flex-row items-center justify-between px-4 py-3.5">
                  <Text className="text-[13px] text-[#817F80]">Bank</Text>
                  <Text className="text-[15px] font-semibold text-[#26242A]">
                    {payoutAccount.bankName ?? '—'}
                  </Text>
                </View>
                <View className="h-px bg-[#ECE7E0]" />
                <View className="flex-row items-center justify-between px-4 py-3.5">
                  <Text className="text-[13px] text-[#817F80]">
                    Account number
                  </Text>
                  <Text className="text-[15px] font-semibold text-[#26242A]">
                    {payoutAccount.accountNumber}
                  </Text>
                </View>
                <View className="h-px bg-[#ECE7E0]" />
                <View className="flex-row items-center justify-between px-4 py-3.5">
                  <Text className="text-[13px] text-[#817F80]">
                    Account name
                  </Text>
                  <Text className="text-[15px] font-semibold text-[#26242A]">
                    {payoutAccount.accountName}
                  </Text>
                </View>
              </View>
            </View>
          ) : (
            <>
              <Text className="mt-4 text-[13px] text-[#817F80]">
                Set up your bank details to receive payouts securely via
                Paystack.
              </Text>

              <View className="mt-3 flex-row items-center justify-between rounded-[16px] border border-[#ECE7E0] bg-white px-4 py-3.5">
                <View className="flex-row items-center gap-2">
                  <Image
                    source={require('../../../assets/images/paystack-icon.png')}
                    style={{ width: 20, height: 20 }}
                    contentFit="contain"
                  />
                  <Text className="text-[15px] font-bold text-[#26242A]">
                    Paystack
                  </Text>
                </View>
                <View className="flex-row items-center gap-1">
                  <Ionicons name="checkmark-circle" size={14} color="#2F9E44" />
                  <Text className="text-[12px] font-bold text-[#2F9E44]">
                    Secure
                  </Text>
                </View>
              </View>

              <Text className="mt-4 text-xs text-[#948F86]">Select bank</Text>
              {selectedBank ? (
                <Pressable
                  onPress={() => {
                    setValue('bankCode', '');
                    setValue('bankName', '');
                  }}
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
                          onPress={() => {
                            setValue('bankCode', item.code);
                            setValue('bankName', item.name);
                          }}
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
                <>
                  <Text className="mt-4 text-xs text-[#948F86]">
                    Account number
                  </Text>
                  <TextInput
                    placeholder="Account number"
                    placeholderTextColor="#A8A39B"
                    value={accountNumber}
                    onChangeText={(text) => setValue('accountNumber', text)}
                    keyboardType="number-pad"
                    className="mt-1 rounded-[16px] border border-[#ECE7E0] bg-white px-4 py-3.5 text-[15px] text-[#26242A]"
                    style={{ outlineWidth: 0 }}
                  />
                </>
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
                <>
                  <Text className="mt-4 text-xs text-[#948F86]">
                    Account name
                  </Text>
                  <View className="mt-1 rounded-[16px] border border-[#ECE7E0] bg-white px-4 py-3.5">
                    <Text className="text-[15px] text-[#26242A]">
                      {resolvedAccount.accountName}
                    </Text>
                  </View>

                  <View className="mt-3 gap-1 rounded-[20px] border border-[#2F9E44] bg-white p-4">
                    <View className="flex-row items-center gap-2">
                      <Ionicons
                        name="checkmark-circle"
                        size={18}
                        color="#2F9E44"
                      />
                      <Text className="text-[13px] font-bold text-[#2F9E44]">
                        Account verified
                      </Text>
                    </View>
                    <Text className="text-[13px] text-[#817F80]">
                      Your account details are valid and ready to receive
                      payouts.
                    </Text>
                  </View>
                </>
              ) : null}

              {isResolveError ? (
                <Text className="mt-3 text-[13px] text-[#E5484D]">
                  Could not resolve this account - check the number and bank.
                </Text>
              ) : null}

              {(formError ?? serverError) ? (
                <Text className="mt-3 text-[13px] text-[#E5484D]">
                  {formError ?? serverError}
                </Text>
              ) : null}

              {selectedBank ? (
                <View className="mt-4">
                  <Button
                    label={
                      createPayoutAccountMutation.isPending
                        ? 'Saving…'
                        : 'Save and continue'
                    }
                    onPress={handleSubmit(onValid)}
                    loading={createPayoutAccountMutation.isPending}
                    disabled={!resolvedAccount?.accountName}
                  />
                  <View className="mt-2 flex-row items-center justify-center gap-1">
                    <Ionicons name="lock-closed" size={12} color="#817F80" />
                    <Text className="text-[12px] text-[#817F80]">
                      Your data is protected with bank-level security.
                    </Text>
                  </View>
                </View>
              ) : null}
            </>
          )}
        </View>
      </SafeAreaView>
    </View>
  );
}

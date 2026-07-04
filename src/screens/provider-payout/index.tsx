import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EmptyState } from '@/components/empty-state';
import { ErrorState } from '@/components/error-state';
import { DetailSkeleton } from '@/components/skeleton';
import { ThemedText } from '@/components/themed-text';
import { ThemedTextInput } from '@/components/themed-text-input';
import { ThemedView } from '@/components/themed-view';
import { useTheme } from '@/hooks/common/use-theme';
import { useBanks, useCreatePayoutAccount, usePayoutAccount } from '@/hooks/services/payouts';
import type { Bank } from '@/interfaces/provider';
import { getErrorMessage } from '@/lib/utils';
import { createPayoutAccountSchema } from '@/validations/payout';

import { styles } from './index.styles';

export function ProviderPayoutScreen() {
  const router = useRouter();
  const theme = useTheme();

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

  const filteredBanks = useMemo(() => {
    if (!banks) return [];
    if (!search) return banks;
    return banks.filter((bank) => bank.name.toLowerCase().includes(search.toLowerCase()));
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
      <ThemedView style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <ErrorState message={getErrorMessage(accountError)} onRetry={refetchAccount} />
        </SafeAreaView>
      </ThemedView>
    );
  }

  if (isLoadingAccount) {
    return (
      <ThemedView style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <DetailSkeleton />
        </SafeAreaView>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <ThemedText type="link">{'< Back'}</ThemedText>
        </Pressable>

        <ThemedText type="title" style={styles.title}>
          Payout details
        </ThemedText>

        {payoutAccount ? (
          <ThemedView type="backgroundElement" style={styles.summaryCard}>
            <ThemedText type="default">{payoutAccount.accountName}</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              {payoutAccount.accountNumber}
            </ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              {payoutAccount.verified ? 'Verified' : 'Pending verification'}
            </ThemedText>
          </ThemedView>
        ) : (
          <>
            <ThemedText type="small" themeColor="textSecondary" style={styles.hint}>
              Set up your payout account to start receiving bookings.
            </ThemedText>

            {selectedBank ? (
              <Pressable onPress={() => setSelectedBank(null)} style={styles.selectedBank}>
                <ThemedView type="backgroundElement" style={styles.rowContent}>
                  <ThemedText type="default">{selectedBank.name}</ThemedText>
                  <ThemedText type="small" themeColor="textSecondary">
                    Change
                  </ThemedText>
                </ThemedView>
              </Pressable>
            ) : (
              <>
                <ThemedTextInput
                  placeholder="Search for your bank"
                  value={search}
                  onChangeText={setSearch}
                  style={styles.input}
                />
                {isLoadingBanks ? (
                  <ActivityIndicator />
                ) : isBanksError ? (
                  <ErrorState message={getErrorMessage(banksError)} onRetry={refetchBanks} />
                ) : (
                  <FlatList
                    data={filteredBanks}
                    keyExtractor={(bank) => `${bank.code}-${bank.name}`}
                    style={styles.bankList}
                    ListEmptyComponent={<EmptyState message="No banks found." />}
                    renderItem={({ item }) => (
                      <Pressable
                        onPress={() => setSelectedBank(item)}
                        style={[styles.bankRow, { borderBottomColor: theme.border }]}
                      >
                        <ThemedText type="default">{item.name}</ThemedText>
                      </Pressable>
                    )}
                  />
                )}
              </>
            )}

            {selectedBank && (
              <ThemedTextInput
                placeholder="Account number"
                value={accountNumber}
                onChangeText={setAccountNumber}
                style={styles.input}
                keyboardType="number-pad"
              />
            )}

            {(fieldError ?? serverError) && (
              <ThemedText type="small" themeColor="danger">
                {fieldError ?? serverError}
              </ThemedText>
            )}

            {selectedBank && (
              <Pressable onPress={handleSubmit} disabled={createPayoutAccountMutation.isPending}>
                <ThemedView type="backgroundElement" style={styles.submitButton}>
                  <ThemedText type="smallBold">
                    {createPayoutAccountMutation.isPending ? 'Setting up...' : 'Set up payouts'}
                  </ThemedText>
                </ThemedView>
              </Pressable>
            )}
          </>
        )}
      </SafeAreaView>
    </ThemedView>
  );
}

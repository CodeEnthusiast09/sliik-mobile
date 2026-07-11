import { useFocusEffect, useNavigation } from 'expo-router';
import { useCallback } from 'react';

import { TAB_BAR_STYLE } from '@/lib/constants';

// The floating tab bar is only for a tab's own root screen (Home, Bookings,
// Deals, Chats, Account/Profile) - every drill-down screen underneath one
// (detail views, forms, sub-lists) hides it while focused and restores the
// exact original style (not `undefined`, which falls back to React
// Navigation's plain default bar) once it isn't.
export function useHideTabBar() {
  const navigation = useNavigation();

  useFocusEffect(
    useCallback(() => {
      navigation.getParent()?.setOptions({ tabBarStyle: { display: 'none' } });
      return () => {
        navigation.getParent()?.setOptions({ tabBarStyle: TAB_BAR_STYLE });
      };
    }, [navigation]),
  );
}

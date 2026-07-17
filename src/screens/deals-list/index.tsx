import { useAuthStore } from '@/store/auth';

import { CustomerDealsFeed } from './_components/customer-deals-feed';
import { ProviderDealsList } from './_components/provider-deals-list';

export function DealsListScreen() {
  const role = useAuthStore((state) => state.role);
  const notificationsHref =
    role === 'provider' ? '/profile/notifications' : '/home/notifications';

  return role === 'provider' ? (
    <ProviderDealsList notificationsHref={notificationsHref} />
  ) : (
    <CustomerDealsFeed notificationsHref={notificationsHref} />
  );
}

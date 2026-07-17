import { useAuthStore } from '@/store/auth';

import { CustomerOffersList } from './_components/customer-offers-list';
import { ProviderOffersFeed } from './_components/provider-offers-feed';

export function OffersListScreen() {
  const role = useAuthStore((state) => state.role);
  const notificationsHref =
    role === 'provider' ? '/profile/notifications' : '/home/notifications';

  return role === 'provider' ? (
    <ProviderOffersFeed notificationsHref={notificationsHref} />
  ) : (
    <CustomerOffersList notificationsHref={notificationsHref} />
  );
}

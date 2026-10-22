import { NativeTabs } from 'expo-router/native-tabs';
import { useTranslation } from 'react-i18next';
import { useUnistyles } from 'react-native-unistyles';

import { useCart } from '@/features/cart';

const TABS = [
  {
    name: 'index',
    label: 'tabs.shop',
    sf: { default: 'bag', selected: 'bag.fill' },
    md: 'storefront',
  },
  {
    name: 'cart',
    label: 'tabs.cart',
    sf: { default: 'cart', selected: 'cart.fill' },
    md: 'shopping_cart',
  },
  {
    name: 'orders',
    label: 'tabs.orders',
    sf: { default: 'shippingbox', selected: 'shippingbox.fill' },
    md: 'receipt_long',
  },
  {
    name: 'settings',
    label: 'tabs.settings',
    sf: { default: 'gearshape', selected: 'gearshape.fill' },
    md: 'settings',
  },
] as const;

export default function TabsLayout() {
  const { t } = useTranslation();
  const { theme } = useUnistyles();
  const { totals } = useCart();

  return (
    <NativeTabs tintColor={theme.colors.primary} badgeBackgroundColor={theme.colors.accent}>
      {TABS.map((tab) => (
        <NativeTabs.Trigger
          key={tab.name}
          name={tab.name}
          contentStyle={{ backgroundColor: theme.colors.background }}
        >
          <NativeTabs.Trigger.Icon sf={tab.sf} md={tab.md} />
          <NativeTabs.Trigger.Label>{t(tab.label)}</NativeTabs.Trigger.Label>
          {tab.name === 'cart' && totals.itemCount > 0 && (
            <NativeTabs.Trigger.Badge>{String(totals.itemCount)}</NativeTabs.Trigger.Badge>
          )}
        </NativeTabs.Trigger>
      ))}
    </NativeTabs>
  );
}

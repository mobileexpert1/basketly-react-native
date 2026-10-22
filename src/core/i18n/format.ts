import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { localeFor, type Language } from './i18n';

const moneyFormats = new Map<string, Intl.NumberFormat>();

export function formatMoney(amountMinor: number, currency: string, locale: string) {
  const key = `${locale}|${currency}`;
  let format = moneyFormats.get(key);
  if (!format) {
    format = new Intl.NumberFormat(locale, { style: 'currency', currency });
    moneyFormats.set(key, format);
  }
  return format.format(amountMinor / 100);
}

export function useFormat() {
  const { i18n } = useTranslation();
  const locale = localeFor(i18n.language as Language);
  return useMemo(() => {
    const date = new Intl.DateTimeFormat(locale, { dateStyle: 'medium' });
    const time = new Intl.DateTimeFormat(locale, { timeStyle: 'short' });
    return {
      locale,
      money: (amountMinor: number, currency: string) => formatMoney(amountMinor, currency, locale),
      date: (timestamp: number) => date.format(timestamp),
      time: (timestamp: number) => time.format(timestamp),
    };
  }, [locale]);
}

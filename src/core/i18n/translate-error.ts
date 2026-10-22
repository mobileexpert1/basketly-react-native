import type { TFunction } from 'i18next';

import { isApiError } from '../api/errors';

export function translateValidation(t: TFunction, message: string | undefined) {
  if (!message) return undefined;
  return message.startsWith('validation.')
    ? t(message as 'validation.required')
    : t('validation.required');
}

export function translateError(t: TFunction, error: unknown) {
  if (isApiError(error) && (error.kind === 'network' || error.kind === 'timeout')) {
    return t('errors.network');
  }
  return t('errors.generic');
}

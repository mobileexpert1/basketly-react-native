import { requireOptionalNativeModule } from 'expo';

interface PrivacyScreenModule {
  setEnabled(enabled: boolean): Promise<void>;
}

const native = requireOptionalNativeModule<PrivacyScreenModule>('PrivacyScreen');

export function setPrivacyScreenEnabled(enabled: boolean): Promise<void> {
  return native?.setEnabled(enabled) ?? Promise.resolve();
}

import { UnistylesRuntime } from 'react-native-unistyles';

export type ThemePreference = 'system' | 'light' | 'dark';

export function applyThemePreference(preference: ThemePreference) {
  if (preference === 'system') {
    UnistylesRuntime.setAdaptiveThemes(true);
    return;
  }
  UnistylesRuntime.setAdaptiveThemes(false);
  UnistylesRuntime.setTheme(preference);
}

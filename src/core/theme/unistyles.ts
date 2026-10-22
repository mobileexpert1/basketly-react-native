import { StyleSheet } from 'react-native-unistyles';

import { darkTheme, lightTheme } from './tokens';

const themes = { light: lightTheme, dark: darkTheme };
const breakpoints = { xs: 0, md: 600 };

type AppThemes = typeof themes;
type AppBreakpoints = typeof breakpoints;

declare module 'react-native-unistyles' {
  export interface UnistylesThemes extends AppThemes {}
  export interface UnistylesBreakpoints extends AppBreakpoints {}
}

StyleSheet.configure({
  themes,
  breakpoints,
  settings: { adaptiveThemes: true },
});

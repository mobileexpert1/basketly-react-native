const space = (multiplier: number) => multiplier * 4;

const radius = { sm: 8, md: 14, lg: 22, xl: 28, pill: 999 } as const;

const typography = {
  display: { fontSize: 30, lineHeight: 36, fontWeight: '700', letterSpacing: -0.6 },
  title: { fontSize: 22, lineHeight: 28, fontWeight: '700', letterSpacing: -0.3 },
  heading: { fontSize: 17, lineHeight: 22, fontWeight: '600' },
  body: { fontSize: 15, lineHeight: 21, fontWeight: '400' },
  label: { fontSize: 13, lineHeight: 18, fontWeight: '600', letterSpacing: 0.1 },
  caption: { fontSize: 12, lineHeight: 16, fontWeight: '500' },
} as const;

const shared = { space, radius, typography };

export const lightTheme = {
  ...shared,
  colors: {
    background: '#F6F3EE',
    surface: '#FFFFFF',
    surfaceMuted: '#EEEAE3',
    text: '#1C1B19',
    textMuted: '#6E6A62',
    border: '#E2DDD4',
    primary: '#1F4D3F',
    onPrimary: '#FFFFFF',
    accent: '#C4673A',
    success: '#2F7A4F',
    warning: '#A86A12',
    danger: '#B3372D',
    overlay: 'rgba(20, 18, 15, 0.45)',
  },
};

export const darkTheme: typeof lightTheme = {
  ...shared,
  colors: {
    background: '#121412',
    surface: '#1C1F1C',
    surfaceMuted: '#262A26',
    text: '#F2EFE9',
    textMuted: '#A29E95',
    border: '#2F332F',
    primary: '#8FD1B3',
    onPrimary: '#0E2A20',
    accent: '#E89065',
    success: '#7BC79A',
    warning: '#E3B25E',
    danger: '#F08A80',
    overlay: 'rgba(0, 0, 0, 0.6)',
  },
};

export type AppTheme = typeof lightTheme;

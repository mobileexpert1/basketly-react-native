const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');
const prettierRecommended = require('eslint-plugin-prettier/recommended');

module.exports = defineConfig([
  expoConfig,
  prettierRecommended,
  {
    ignores: [
      '.expo/*',
      'dist/*',
      'ios/*',
      'android/*',
      'coverage/*',
      'src/core/db/migrations/*',
      'expo-env.d.ts',
    ],
  },
  {
    rules: {
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'import/no-cycle': 'error',
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@/features/*/data/*', '@/features/*/ui/*'],
              message: 'Import a feature through its public index, not its internals.',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['src/features/*/domain/**'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['react', 'react-native', 'expo-*', '@/core/*', '../data/*', '../ui/*'],
              message: 'Domain code stays framework-free.',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['src/core/theme/unistyles.ts'],
    rules: { '@typescript-eslint/no-empty-object-type': 'off' },
  },
  {
    files: ['src/di/**', '**/*.test.ts', '**/*.test.tsx', 'test/**'],
    rules: { 'no-restricted-imports': 'off' },
  },
  {
    files: ['test/**'],
    rules: { '@typescript-eslint/no-require-imports': 'off' },
  },
]);

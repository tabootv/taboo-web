import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';
import sonarjs from 'eslint-plugin-sonarjs';

export default defineConfig([
  // Inherit Next.js TypeScript config for proper parsing
  ...nextVitals,
  ...nextTs,

  // Add SonarJS recommended rules
  sonarjs.configs.recommended,

  // Project-specific SonarJS configuration
  {
    files: ['**/*.{ts,tsx,js,jsx}'],
    rules: {
      // Core rules with strict thresholds to match IDE
      'sonarjs/cognitive-complexity': ['error', 15],

      // Optional chaining and null safety
      'sonarjs/no-redundant-optional': 'error', // Detect unnecessary optional chaining
      'sonarjs/null-dereference': 'error', // Detect potential null/undefined access

      // Code complexity and structure
      'sonarjs/no-duplicate-string': ['error', { threshold: 3 }],
      'sonarjs/no-identical-functions': 'error',
      'sonarjs/no-collapsible-if': 'error',
      'sonarjs/no-redundant-jump': 'error',
      'sonarjs/no-unused-collection': 'error',
      'sonarjs/prefer-immediate-return': 'error',
      'sonarjs/prefer-single-boolean-return': 'error',
      'sonarjs/no-nested-conditional': 'error', // Reduce nested ternaries
      'sonarjs/no-gratuitous-expressions': 'error', // Detect always true/false

      // Disable rules that conflict with Next.js/React patterns or are too noisy
      'sonarjs/no-misused-promises': 'off', // Conflicts with async Server Components
      'sonarjs/jsx-no-leaked-render': 'off', // Too many false positives with && patterns

      // Disable standard ESLint/Next rules for this config (we only care about Sonar rules)
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      'react-hooks/exhaustive-deps': 'off',
      '@next/next/no-img-element': 'off',
    },
  },

  // Global ignores
  globalIgnores([
    '.next/**',
    'out/**',
    'build/**',
    'dist/**',
    'coverage/**',
    'next-env.d.ts',
    '**/*.d.ts',
    'scripts/**',
    'codemods/**',
    'node_modules/**',
  ]),
]);

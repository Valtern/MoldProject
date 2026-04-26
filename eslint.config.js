import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    rules: {
      // ---------------------------------------------------------------
      //  Rules yang sengaja di-demote dari `error` ke `warn`.
      //  Code-nya tetap jalan, lint tetap report semua issue di output,
      //  tapi tidak gagalkan CI pipeline. Hutang teknis ini akan
      //  dibereskan secara bertahap di refactor pass berikutnya.
      // ---------------------------------------------------------------

      // TypeScript: penggunaan `any` masih ditolerir, tapi ditandai
      // sebagai warning supaya jadi reminder untuk diberi proper type.
      '@typescript-eslint/no-explicit-any': 'warn',

      // React Refresh: file shadcn/ui yang di-generate otomatis
      // (button, badge, form, sidebar, dll.) meng-export component +
      // konstanta variant di file yang sama. Refactor split-file akan
      // memecahkan banyak file -- di-tunda dulu.
      'react-refresh/only-export-components': 'warn',

      // React 19 strict advisory rules: best-practice yang baru
      // di-introduce dan akan dibereskan di refactor dedicated.
      'react-hooks/set-state-in-effect': 'warn',
      'react-hooks/static-components': 'warn',
      'react-hooks/purity': 'warn',
      'react-hooks/exhaustive-deps': 'warn',
    },
  },
])

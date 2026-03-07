import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';

export default [
  {
    ignores: ['dist', 'node_modules', 'coverage', 'build', 'scripts'],
  },
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        // React
        React: 'readonly',
        JSX: 'readonly',

        // Browser APIs
        window: 'readonly',
        document: 'readonly',
        navigator: 'readonly',
        fetch: 'readonly',
        console: 'readonly',
        setTimeout: 'readonly',
        setInterval: 'readonly',
        clearTimeout: 'readonly',
        clearInterval: 'readonly',
        localStorage: 'readonly',
        sessionStorage: 'readonly',
        requestAnimationFrame: 'readonly',
        cancelAnimationFrame: 'readonly',
        AbortController: 'readonly',
        Headers: 'readonly',
        RequestInit: 'readonly',
        Response: 'readonly',
        Request: 'readonly',

        // Browser Types (used in TypeScript)
        HTMLElement: 'readonly',
        HTMLButtonElement: 'readonly',
        HTMLInputElement: 'readonly',
        HTMLSelectElement: 'readonly',
        HTMLTextAreaElement: 'readonly',
        HTMLImageElement: 'readonly',
        HTMLDivElement: 'readonly',
        HTMLAnchorElement: 'readonly',
        HTMLFormElement: 'readonly',
        KeyboardEvent: 'readonly',
        MouseEvent: 'readonly',
        Node: 'readonly',
        NodeListOf: 'readonly',
        DOMRect: 'readonly',
        Event: 'readonly',
        IntersectionObserver: 'readonly',
        IntersectionObserverEntry: 'readonly',
        MutationObserver: 'readonly',
        ResizeObserver: 'readonly',
        customElements: 'readonly',
        NodeJS: 'readonly',
        File: 'readonly',
        Blob: 'readonly',
        URL: 'readonly',
        alert: 'readonly',
        crypto: 'readonly',
        XMLHttpRequest: 'readonly',
        HeadersInit: 'readonly',
        DOMException: 'readonly',
        TouchEvent: 'readonly',
        XMLSerializer: 'readonly',
        Image: 'readonly',
        FileList: 'readonly',
        SVGSVGElement: 'readonly',
        FrameRequestCallback: 'readonly',
        IntersectionObserverCallback: 'readonly',
        IntersectionObserverInit: 'readonly',
        FormDataEntryValue: 'readonly',
        // Node.js globals
        atob: 'readonly',
        btoa: 'readonly',
        URLSearchParams: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        performance: 'readonly',
        process: 'readonly',
        Buffer: 'readonly',
        CSS: 'readonly',
        getComputedStyle: 'readonly',
        ImageData: 'readonly',
      },
      parser: tseslint.parser,
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    plugins: {
      react,
      'react-hooks': reactHooks,
      '@typescript-eslint': tseslint.plugin,
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
    rules: {
      // JavaScript rules
      ...js.configs.recommended.rules,

      // TypeScript rules
      ...tseslint.configs.recommended.rules,

      // React rules
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'warn',
      'react/no-unescaped-entities': 'warn',
      'react/display-name': 'warn',

      // React Hooks rules (disabled due to flat config compatibility issues)
      // These can be checked manually or with pre-commit hooks
      // 'react-hooks/rules-of-hooks': 'error',
      // 'react-hooks/exhaustive-deps': 'warn',

      // General rules
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'no-debugger': 'warn',
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-non-null-assertion': 'warn',

      // Best practices
      'no-var': 'error',
      'prefer-const': 'error',
      'prefer-arrow-callback': 'warn',
      eqeqeq: ['error', 'always'],
      'no-implicit-coercion': 'warn',
    },
  },
  {
    files: ['src/**/*.tsx'],
    rules: {
      'react/prop-types': 'off', // Use TypeScript for prop validation
    },
  },
  {
    files: [
      'src/**/*.test.ts',
      'src/**/*.test.tsx',
      'src/__tests__/**/*.ts',
      'src/__tests__/**/*.tsx',
    ],
    languageOptions: {
      globals: {
        // Browser APIs
        window: 'readonly',
        document: 'readonly',
        navigator: 'readonly',
        HTMLElement: 'readonly',
        HTMLInputElement: 'readonly',
        NodeListOf: 'readonly',
        Event: 'readonly',
        customElements: 'readonly',

        // Node.js / Vitest globals
        global: 'readonly',
        describe: 'readonly',
        it: 'readonly',
        test: 'readonly',
        expect: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        before: 'readonly',
        after: 'readonly',
        vi: 'readonly',
      },
    },
    rules: {
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-explicit-any': 'off', // Common in tests
      '@typescript-eslint/no-non-null-assertion': 'off', // Idiomatic in test assertions
    },
  },
];

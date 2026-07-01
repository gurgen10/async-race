import globals from 'globals';
import reactPlugin from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';
import { FlatCompat } from '@eslint/eslintrc';
import { fileURLToPath } from 'url';
import path from 'path';
import eslintConfigPrettier from 'eslint-config-prettier';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const compat = new FlatCompat({ baseDirectory: __dirname });

export default tseslint.config(
  { ignores: ['dist'] },

  // Full Airbnb style guide — JS + React + jsx-a11y + import rules.
  // The native react jsx-runtime config below overrides the React-JSX-transform rules.
  ...compat.extends('airbnb'),

  // eslint-plugin-react@7 still calls context.getFilename() (removed in ESLint v10)
  // in the jsx-filename-extension rule. Disable it globally — TypeScript's compiler
  // options already own file-extension enforcement in a .tsx project.
  { rules: { 'react/jsx-filename-extension': 'off' } },

  // React plugin — native flat config (ESLint v10 compatible)
  // jsx-runtime preset suits React 17+ new JSX transform
  reactPlugin.configs.flat['jsx-runtime'],

  // TypeScript-ESLint strict rules with type-aware linting
  ...tseslint.configs.strictTypeChecked,

  // eslint.config.js itself isn't part of the tsconfig project, so it can't
  // be linted with type information — fall back to non-type-aware TS rules
  { files: ['**/*.js'], ...tseslint.configs.disableTypeChecked },

  // React hooks and fast-refresh plugins
  reactHooks.configs.flat.recommended,
  reactRefresh.configs.vite,

  // Applies to every linted file (app code and tooling config alike)
  {
    settings: {
      // Pin version so the plugin doesn't try context.getFilename() for detection
      react: { version: '19.2' },
      // Teach eslint-plugin-import how to resolve TypeScript paths
      'import/resolver': {
        typescript: {
          project: ['./tsconfig.app.json', './tsconfig.node.json'],
          noWarnOnMultipleProjects: true,
        },
        node: true,
      },
    },
  },

  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      globals: globals.browser,
      parserOptions: {
        project: ['./tsconfig.app.json', './tsconfig.node.json'],
        tsconfigRootDir: __dirname,
      },
    },
    rules: {
      // ── Function size ──────────────────────────────────────────────────────
      'max-lines-per-function': [
        'error',
        {
          max: 40,
          skipBlankLines: true,
          skipComments: true,
          IIFEs: true,
        },
      ],

      // ── Magic numbers — TypeScript-aware rule replaces the base one ────────
      'no-magic-numbers': 'off',
      '@typescript-eslint/no-magic-numbers': [
        'error',
        {
          ignore: [-1, 0, 1],
          ignoreArrayIndexes: true,
          ignoreDefaultValues: true,
          ignoreClassFieldInitialValues: true,
          ignoreEnums: true,
          ignoreNumericLiteralTypes: true,
          ignoreReadonlyClassProperties: true,
          enforceConst: true,
        },
      ],

      // ── Windows: CRLF line endings are acceptable in this environment ────────
      'linebreak-style': 'off',

      // ── Allow void operator as a statement to discard promises ────────────
      // Pairs with @typescript-eslint/no-floating-promises which requires all
      // promises to be handled; void is the idiomatic way to opt-out.
      'no-void': ['error', { allowAsStatement: true }],

      // ── Redux Toolkit uses Immer: reducers must mutate the draft directly.
      // Ref objects passed between custom hooks are mutated via `.current`
      // by design (React's escape hatch for mutable state) ──────────────────
      'no-param-reassign': [
        'error',
        {
          props: true,
          ignorePropertyModificationsFor: ['state', 'rafRef', 'drivenRef', 'resumeProgressRef'],
        },
      ],

      // ── JSX event handlers are often async; void return is fine there ──────
      '@typescript-eslint/no-misused-promises': [
        'error',
        { checksVoidReturn: { attributes: false } },
      ],

      // ── Numbers in template literals are standard (translateX, ms, etc.) ──
      '@typescript-eslint/restrict-template-expressions': ['error', { allowNumber: true }],

      // ── TypeScript validates these at compile time ─────────────────────────
      'react/prop-types': 'off',
      'react/require-default-props': 'off',

      // ── TypeScript handles undefined-variable detection ────────────────────
      'no-undef': 'off',

      // ── Use TS-aware replacement for no-use-before-define ─────────────────
      'no-use-before-define': 'off',
      '@typescript-eslint/no-use-before-define': [
        'error',
        { functions: false, classes: true, variables: true },
      ],

      // ── TypeScript projects don't need file extensions on imports ──────────
      'import/extensions': ['error', 'ignorePackages', { ts: 'never', tsx: 'never' }],

      // ── Named exports are fine alongside or instead of default exports ─────
      'import/prefer-default-export': 'off',

      // ── Allow void in generic type arguments (e.g. fetchApi<void>) ─────────
      // The rule's primary purpose is to prevent void in function-param types;
      // using it as a generic type hint (return ignored) is semantically valid.
      '@typescript-eslint/no-invalid-void-type': ['error', { allowInGenericTypeArguments: true }],
    },
  },

  // Node-side tooling config — not part of the app bundle, so devDependency
  // imports and the CommonJS-style __dirname idiom are expected here.
  {
    files: ['eslint.config.js', 'vite.config.ts'],
    rules: {
      'no-underscore-dangle': ['error', { allow: ['__filename', '__dirname'] }],
      'import/no-extraneous-dependencies': ['error', { devDependencies: true }],
    },
  },

  // Disable all ESLint rules that conflict with Prettier's formatting.
  // Must be last so it overrides any formatting rules enabled above.
  eslintConfigPrettier,
);

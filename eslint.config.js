import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import jsxA11y from "eslint-plugin-jsx-a11y";
import prettier from "eslint-config-prettier";

export default tseslint.config(
  { ignores: ["dist"] },
  {
    files: ["**/*.{ts,tsx}"],
    extends: [
      js.configs.recommended,
      ...tseslint.configs.recommended,
      reactRefresh.configs.vite,
      jsxA11y.flatConfigs.recommended,
      prettier, // keep last: turns off rules Prettier owns
    ],
    plugins: { "react-hooks": reactHooks },
    languageOptions: {
      ecmaVersion: 2022,
      globals: globals.browser,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      // Scaffold phase: stub fields/params aren't read yet, and the solver
      // generators have no `yield` until implemented. Warn, don't fail.
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "require-yield": "warn",
    },
  },
  {
    // Views are View-lifecycle adapters that export a class, not just
    // components — react-refresh's component-only rule doesn't apply.
    files: ["src/gui/views/**"],
    rules: { "react-refresh/only-export-components": "off" },
  },
);

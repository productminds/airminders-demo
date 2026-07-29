import js from "@eslint/js"
import react from "eslint-plugin-react"
import reactHooks from "eslint-plugin-react-hooks"
import jsxA11y from "eslint-plugin-jsx-a11y"
import prettier from "eslint-plugin-prettier"
import prettierConfig from "eslint-config-prettier"
import globals from "globals"

export default [
  { ignores: ["dist", "node_modules"] },
  js.configs.recommended,
  react.configs.flat.recommended,
  react.configs.flat["jsx-runtime"],
  jsxA11y.flatConfigs.recommended,
  prettierConfig,
  {
    files: ["**/*.{js,jsx}"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: { ...globals.browser, ...globals.node },
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
    },
    settings: {
      react: { version: "detect" },
    },
    plugins: {
      "react-hooks": reactHooks,
      prettier,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "prettier/prettier": "warn",
      "react/prop-types": "error",
    },
  },
  {
    // Vendored shadcn/ui primitives: generated wrappers around Radix that
    // forward arbitrary DOM/Radix props, not hand-authored app components.
    files: ["src/components/ui/**/*.jsx"],
    rules: {
      "react/prop-types": "off",
      // Content is always forwarded via {...props}/children, not literal —
      // the linter can't see through the spread.
      "jsx-a11y/heading-has-content": "off",
    },
  },
]

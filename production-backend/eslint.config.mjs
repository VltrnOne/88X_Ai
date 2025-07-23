import globals from "globals";
import js from "@eslint/js";

export default [
  {
    ignores: ["node_modules/**", "*.bak", "*.bak2"],
  },
  {
    files: ["**/*.js"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      globals: {
        ...globals.node,
        ...globals.es2022
      }
    },
    rules: {
      ...js.configs.recommended.rules,
      "no-unused-vars": "warn",
      "no-console": "off", // Allow console.log for debugging
      "prefer-const": "error",
      "no-var": "error",
      "no-undef": "error",
      "no-unreachable": "error"
    }
  }
];
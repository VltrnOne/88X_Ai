import globals from "globals";
import js from "@eslint/js";

export default [
  {
    ignores: ["node_modules/**"],
  },
  {
    files: ["**/*.js"],
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: "commonjs",
      globals: {
        ...globals.node
      }
    },
    rules: {
        ...js.configs.recommended.rules,
        "no-unused-vars": "warn"
    }
  }
];
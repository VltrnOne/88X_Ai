import globals from "globals";
import js from "@eslint/js";

export default [
  // Rule set for our application's .js files
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
  },
  // Instruction to ignore the config file itself
  {
    ignores: ["eslint.config.mjs"],
  }
];
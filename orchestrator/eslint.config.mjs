// ~/vltrn-system/orchestrator/.eslintrc.cjs
module.exports = {
  env: {
    node: true,
    es2021: true,
    browser: false,
  },
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  extends: ['eslint:recommended'],
  rules: {
    'no-unused-vars': 'warn',
  },
};

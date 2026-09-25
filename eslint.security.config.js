const security = require("eslint-plugin-security");

module.exports = [
  {
    ignores: ["node_modules/**", "coverage/**", "tests/**"],
  },
  security.configs.recommended,
  {
    files: ["src/**/*.js", "scripts/**/*.js"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "commonjs",
      globals: {
        console: "readonly",
        process: "readonly",
        require: "readonly",
        module: "readonly",
        fetch: "readonly",
        AbortController: "readonly",
        setTimeout: "readonly",
        clearTimeout: "readonly",
        performance: "readonly",
      },
    },
  },
];

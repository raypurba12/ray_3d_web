module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:react-hooks/recommended",
    "eslint-config-prettier",
  ],
  ignorePatterns: [
    "dist",
    "node_modules",
    "api",
    ".eslintrc.cjs",
    "*.config.cjs",
  ],
  parser: "@typescript-eslint/parser",
  plugins: ["react-refresh"],
  settings: {
    react: {
      version: "detect",
    },
  },
  rules: {
    // Sections intentionally export HOC-wrapped components; fast refresh is a
    // dev-only nicety, not a correctness rule for this project.
    "react-refresh/only-export-components": "off",
    "@typescript-eslint/ban-ts-comment": "off",
    "@typescript-eslint/no-explicit-any": "off",
  },
};

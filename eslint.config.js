// Minimal ESLint config for CI - only parse checking, no rules
export default [
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    languageOptions: {
      parser: await import("@typescript-eslint/parser"),
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
  },
  {
    ignores: [
      "node_modules/**",
      "android/**",
      "ios/**",
      ".expo/**",
      "coverage/**",
      "build/**",
      "dist/**",
    ],
  },
];

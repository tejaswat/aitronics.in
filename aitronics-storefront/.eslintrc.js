module.exports = {
  extends: ["next/core-web-vitals"],
  rules: {
    "@next/next/no-html-link-for-pages": "off",
  },
  overrides: [
    {
      files: ["src/**"],
      rules: {
        "@next/next/no-page-custom-font": "off",
        "@next/next/no-duplicate-head": "off",
        "@next/next/no-before-interactive-script-outside-document": "off",
        "@next/next/no-styled-jsx-in-document": "off",
        "@next/next/no-typos": "off",
      },
    },
  ],
};

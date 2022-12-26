module.exports = {
  root: true,

  env: {
    es6: true,
    node: true,
  },
  parserOptions: {
    // Required for certain syntax usages
    "ecmaVersion": 2020,
  },
  // eslint-disable-next-line no-sparse-arrays
  extends: [
    "eslint:recommended",
    "google",
  ],
  rules: {
    quotes: ["error", "double"],
  },
};

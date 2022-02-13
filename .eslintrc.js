module.exports = {
  root: true,
  extends: ["@fnando/codestyle/javascript", "@fnando/codestyle/typescript"],
  overrides: [
    {
      files: ["**/*.{js,ts}"],
      rules: {
        "@fnando/consistent-import/consistent-import": "off",
        "no-use-before-define": "off",
      },
    },

    {
      files: ["src/cli/**/*.ts"],
      rules: {
        "no-console": "off",
        "@typescript-eslint/no-var-requires": "off",
      },
    },
  ],
};

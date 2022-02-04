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
  ],
};

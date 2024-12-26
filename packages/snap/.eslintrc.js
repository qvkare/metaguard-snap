module.exports = {
  extends: ['../../.eslintrc.js'],

  parserOptions: {
    tsconfigRootDir: __dirname,
  },

  rules: {
    'import/no-extraneous-dependencies': 'off',
  },
};

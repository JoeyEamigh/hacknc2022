module.exports = {
  bracketSpacing: true,
  tabWidth: 2,
  useTabs: false,
  jsxBracketSameLine: true,
  singleQuote: true,
  trailingComma: 'all',
  arrowParens: 'avoid',
  semi: true,
  overrides: [
    {
      files: ['*.ts', '*.js', '*.tsx', '*.jsx'],
      options: {
        printWidth: 120,
      },
    },
    {
      files: ['*.html'],
      options: {
        printWidth: 100,
      },
    },
  ],
};

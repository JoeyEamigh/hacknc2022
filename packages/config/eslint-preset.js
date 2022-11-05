module.exports = {
  extends: ['next', 'prettier'],
  settings: {
    next: {
      rootDir: ['apps/*/', 'packages/*/'],
    },
  },
  rules: {
    'react/jsx-no-comment-textnodes': 'off',
    'react-hooks/exhaustive-deps': 'off',
    'no-debugger': 'warn',
  },
};

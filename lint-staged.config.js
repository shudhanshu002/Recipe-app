module.exports = {
  'Frontend/**/*.{js,jsx}': (filenames) => {
    const files = filenames.map((f) => `"${f}"`).join(' ');
    return `npm run lint:fix --prefix Frontend -- ${files}`;
  },

  'Backend/**/*.js': (filenames) => {
    const files = filenames.map((f) => `"${f}"`).join(' ');
    return `npm run lint:fix --prefix Backend -- ${files}`;
  },

  '**/*.{json,md,css,html}': 'prettier --write',
};

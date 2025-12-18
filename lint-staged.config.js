module.exports = {
  // 1. Frontend: Use npm run with prefix (Safe for Windows)
  'Frontend/**/*.{js,jsx}': (filenames) => {
    // Quote files to handle spaces in paths
    const files = filenames.map((f) => `"${f}"`).join(' ');
    return `npm run lint:fix --prefix Frontend -- ${files}`;
  },

  // 2. Backend: Use npm run with prefix
  'Backend/**/*.js': (filenames) => {
    const files = filenames.map((f) => `"${f}"`).join(' ');
    return `npm run lint:fix --prefix Backend -- ${files}`;
  },

  // 3. Formatting
  '**/*.{json,md,css,html}': 'prettier --write',
};

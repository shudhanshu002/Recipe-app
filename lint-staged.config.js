const path = require('path');

module.exports = {
  // 1. Frontend: Force relative paths
  'Frontend/**/*.{js,jsx}': (filenames) => {
    const cwd = process.cwd();
    const relativeFiles = filenames.map((f) => {
      // Turn "C:/Users/.../Frontend/src/file.js" into "src/file.js"
      return `"${path.relative(path.join(cwd, 'Frontend'), f).split(path.sep).join('/')}"`;
    });
    return `cd Frontend && npx eslint --fix ${relativeFiles.join(' ')}`;
  },

  // 2. Backend: Force relative paths
  'Backend/**/*.js': (filenames) => {
    const cwd = process.cwd();
    const relativeFiles = filenames.map((f) => {
      // Turn "C:/Users/.../Backend/index.js" into "index.js"
      return `"${path.relative(path.join(cwd, 'Backend'), f).split(path.sep).join('/')}"`;
    });
    return `cd Backend && npx eslint --fix ${relativeFiles.join(' ')}`;
  },

  // 3. Formatting (runs from root, so absolute paths are fine here)
  '**/*.{json,md,css,html}': 'prettier --write',
};

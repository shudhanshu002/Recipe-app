const fs = require('fs');
const path = require('path');

const folders = ['Frontend', 'Backend'];

folders.forEach((folder) => {
  const packagePath = path.join(process.cwd(), folder, 'package.json');

  if (fs.existsSync(packagePath)) {
    try {
      const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf8'));

      // Initialize scripts if they don't exist
      if (!pkg.scripts) pkg.scripts = {};

      // Add the missing script
      pkg.scripts['lint:fix'] = 'eslint --fix';

      // Write back to file
      fs.writeFileSync(packagePath, JSON.stringify(pkg, null, 2));
      console.log(`✅ Fixed ${folder}/package.json`);
    } catch (e) {
      console.error(`❌ Error reading ${folder}/package.json:`, e.message);
    }
  } else {
    console.error(`❌ Could not find ${packagePath}`);
  }
});

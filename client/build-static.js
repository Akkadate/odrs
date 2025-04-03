const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('Building static version of the document request app...');

// Step 1: Create temporary index.js file
const tmpIndexPath = path.join(__dirname, 'src', 'index.tmp.js');
const staticIndexPath = path.join(__dirname, 'src', 'index-static.js');
const originalIndexPath = path.join(__dirname, 'src', 'index.js');

// Backup original index.js
console.log('Backing up original index.js...');
fs.copyFileSync(originalIndexPath, originalIndexPath + '.bak');

// Copy static index to main index
console.log('Replacing index.js with static version...');
fs.copyFileSync(staticIndexPath, originalIndexPath);

try {
  // Step 2: Run the build process
  console.log('Building React app...');
  execSync('npm run build', { stdio: 'inherit' });
  
  console.log('✓ Static build completed successfully!');
  console.log('The built app is available in the build/ directory');
  console.log('To run it with the static server, use:');
  console.log('  node server-static-5003.js');
} catch (error) {
  console.error('Error during build:', error);
} finally {
  // Step 3: Restore original index.js
  console.log('Restoring original index.js...');
  fs.copyFileSync(originalIndexPath + '.bak', originalIndexPath);
  fs.unlinkSync(originalIndexPath + '.bak');
}
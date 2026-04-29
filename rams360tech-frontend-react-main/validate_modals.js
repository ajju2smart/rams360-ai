const fs = require('fs');
const path = require('path');

const files = [
  'src/components/ProjectList/EditprojectDetails.js',
  'src/components/ProjectList/ProjectDetails.js',
  'src/components/ProjectList/Projectpermission.js',
  'src/components/PBS/index.js',
  'src/components/HeaderNavBar/index.js',
  'src/components/HeaderNavBar/EditRBDConfiguration.js'
];

files.forEach(file => {
  const fullPath = path.join(process.cwd(), file);
  if (!fs.existsSync(fullPath)) {
    console.log(`❌ Missing: ${file}`);
    return;
  }
  const content = fs.readFileSync(fullPath, 'utf8');
  const openModals = (content.match(/<Modal[\s>]/g) || []).length;
  const closeModals = (content.match(/<\/Modal>/g) || []).length;
  const openCards = (content.match(/<Card[\s>]/g) || []).length;
  const closeCards = (content.match(/<\/Card>/g) || []).length;

  if (openModals !== closeModals) {
    console.log(`❌ FAILED: ${file} - Modal mismatch (${openModals} open vs ${closeModals} close)`);
  } else if (openCards !== closeCards) {
      console.log(`❌ FAILED: ${file} - Card mismatch (${openCards} open vs ${closeCards} close)`);
  } else {
    console.log(`✅ PASSED: ${file} (${openModals} Modals, ${openCards} Cards)`);
  }
});

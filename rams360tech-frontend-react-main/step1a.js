const fs = require('fs');
const files = [
  'components/ProjectList/index.js',
  'components/User/index.js',
  'components/Company/CompanyAdmin.js',
  'components/Company/index.js',
  'components/PBS/index.js',
  'components/HeaderNavBar/EditRBDConfiguration.js',
  'components/PMMRA/index.js',
  'components/SparePartsAnalysis/index.js',
  'components/Safety/index.js',
  'components/FMECA/index.js',
  'components/MTTRPrediction/index.js',
  'components/FTA/index.js',
  'components/Libraries/SeparateLibrary.js',
  'components/Enquiries/index.js',
];
let allOk = true;
files.forEach(f => {
  try {
    const c = fs.readFileSync('src/' + f, 'utf8');
    const opens  = (c.match(/<Modal[\s>]/g)  || []).length;
    const closes = (c.match(/<\/Modal>/g)    || []).length;
    const rams   = (c.match(/rams-modal/g)   || []).length;
    const status = opens === closes ? '✅' : '❌ MISMATCH';
    console.log(`${status} ${f.padEnd(55)} opens=${opens} closes=${closes} rams-modal=${rams}`);
    if (opens !== closes) allOk = false;
  } catch (e) {
    console.log('❌ MISSING ' + f);
  }
});
console.log('');
console.log(allOk ? '✅ ALL MODAL TAGS BALANCED' : '❌ FIX MISMATCHES BEFORE BUILD');

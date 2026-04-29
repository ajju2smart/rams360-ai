const fs = require('fs');
const base = 'src/components/';
const files = [
  'FMECA/index.js',
  'Safety/index.js',
  'MTTRPrediction/index.js',
  'PMMRA/index.js',
  'SparePartsAnalysis/index.js',
  'FTA/index.js',
  'FTA/EventsReportModal.jsx',
];
files.forEach(f => {
  const c = fs.readFileSync(base + f, 'utf8');
  const opens = (c.match(/<Modal[\s>]/g) || []).length;
  const closes = (c.match(/<\/Modal>/g) || []).length;
  console.log((opens === closes ? '✅' : '❌') + ' ' + f + ' — ' + opens + '/' + closes);
});

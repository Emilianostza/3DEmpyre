const fs = require('fs');
const path = require('path');

['en', 'de', 'es', 'ru'].forEach((lang) => {
  const tsContent = fs.readFileSync(
    path.join(__dirname, '..', 'src/locales', lang + '.ts'),
    'utf8'
  );
  const match = tsContent.match(/=\s*(\{[\s\S]*\})\s*;\s*(?:export default|$)/);
  if (!match) {
    console.error('Failed to parse', lang);
    return;
  }

  const obj = new Function('return ' + match[1])();

  const outDir = path.join(__dirname, '..', 'public/locales', lang);
  fs.mkdirSync(outDir, { recursive: true });
  const jsonPath = path.join(outDir, 'translation.json');
  fs.writeFileSync(jsonPath, JSON.stringify(obj, null, 2));
  console.log(lang + ': ' + Object.keys(obj).length + ' keys -> ' + jsonPath);
});

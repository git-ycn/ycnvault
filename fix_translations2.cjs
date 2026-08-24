const fs = require('fs');
let content = fs.readFileSync('src/translations.ts', 'utf8');
content = content.replace(/Verify & Download ➔/g, "Verify & Download");
content = content.replace(/Vérifier et Télécharger ➔/g, "Vérifier et Télécharger");
fs.writeFileSync('src/translations.ts', content);

/* Génère comparateur_partage.html : identique à comparateur.html mais avec le JS obfusqué. */
const fs = require('fs');
const JO = require('javascript-obfuscator');

const SRC = 'comparateur.html';
const OUT = 'comparateur_partage.html';

let html = fs.readFileSync(SRC, 'utf8');

// Récupère TOUS les blocs <script>...</script> et cible le dernier (notre code applicatif).
const re = /<script>([\s\S]*?)<\/script>/g;
let m, last = null;
while ((m = re.exec(html)) !== null) last = m;
if (!last) { console.error('Aucun bloc <script> inline trouvé.'); process.exit(1); }

const originalBlock = last[0];
const jsCode = last[1];

const result = JO.obfuscate(jsCode, {
  compact: true,
  controlFlowFlattening: false,   // évite de ralentir les boucles sur 800+ lignes
  deadCodeInjection: false,
  debugProtection: false,
  disableConsoleOutput: false,
  identifierNamesGenerator: 'hexadecimal',
  renameGlobals: true,
  selfDefending: false,
  simplify: true,
  splitStrings: true,
  splitStringsChunkLength: 8,
  stringArray: true,
  stringArrayEncoding: ['base64'],
  stringArrayThreshold: 0.8,
  transformObjectKeys: false,     // sûr : ne touche pas aux clés d'objets/DOM
  unicodeEscapeSequence: false
});

const obf = result.getObfuscatedCode();
const newBlock = '<script>\n' + obf + '\n</script>';
html = html.replace(originalBlock, newBlock);

// Petit bandeau discret en tête de fichier
html = html.replace('<!DOCTYPE html>',
  '<!-- Comparateur SFMEA vs RWB — Developed by Hasnae Maazouz. Code minifié/obfusqué. -->\n<!DOCTYPE html>');

fs.writeFileSync(OUT, html, 'utf8');
console.log('OK -> ' + OUT + '  (' + Math.round(fs.statSync(OUT).size/1024) + ' Ko, JS obfusqué : ' + Math.round(obf.length/1024) + ' Ko)');

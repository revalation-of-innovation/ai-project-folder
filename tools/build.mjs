// Bundles index.html + css + js + content into single files:
//   dist/comet-quest.html  standalone page (open it anywhere, works offline except fonts)
//   dist/artifact.html     the same page without the document skeleton, for claude.ai artifacts
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');
let html = read('index.html');

html = html.replace(/<link rel="stylesheet" href="(css\/[^"]+)">/g, (m, href) => '<style>\n' + read(href) + '\n</style>');
html = html.replace(/<script src="([^"]+)"><\/script>\n?/g, (m, src) => '<script>\n/* ' + src + ' */\n' + read(src).replace(/<\/script/gi, '<\\/script') + '\n</script>\n');

fs.mkdirSync(path.join(root, 'dist'), { recursive: true });
fs.writeFileSync(path.join(root, 'dist/comet-quest.html'), html);

// artifact fragment: head contents (minus charset/viewport) + body contents
const head = html.match(/<head>([\s\S]*?)<\/head>/)[1]
  .replace(/<meta charset[^>]*>\n?/, '')
  .replace(/<meta name="viewport"[^>]*>\n?/, '');
const body = html.match(/<body>([\s\S]*?)<\/body>/)[1];
fs.writeFileSync(path.join(root, 'dist/artifact.html'), head.trim() + '\n' + body.trim() + '\n');

const kb = (p) => (fs.statSync(path.join(root, p)).size / 1024).toFixed(0) + ' KB';
console.log('dist/comet-quest.html', kb('dist/comet-quest.html'));
console.log('dist/artifact.html', kb('dist/artifact.html'));

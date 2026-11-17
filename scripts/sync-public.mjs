// dist is the public source of truth. Mirror only known website assets.
import { copyFileSync, cpSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
for (const name of ['index.html','privacy.html','styles.css','app.js','demo.js','service.js','motion.js','art-motion.js','lab.js','lab-core.js','lab.css','icon.svg']) {
  copyFileSync(path.join(root,'dist',name),path.join(root,name));
}
for (const name of ['vendor','fonts','assets','services','work']) {
  const source = path.join(root,'dist',name);
  if (existsSync(source)) cpSync(source,path.join(root,name),{recursive:true});
}
console.log('Updated public mirrors, service pages, project pages and assets from dist.');

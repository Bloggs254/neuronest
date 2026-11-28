// dist is the public source of truth. Mirror only known website assets.
import { copyFileSync, cpSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
for (const name of ['index.html','privacy.html','404.html','robots.txt','sitemap.xml','styles.css','app.js','demo.js','service.js','motion.js','art-motion.js','lab.js','lab-core.js','lab.css','stockroom.js','stockroom-core.js','stockroom-storage.js','feedback.js','feedback-core.js','icon.svg']) {
  copyFileSync(path.join(root,'dist',name),path.join(root,name));
}
for (const name of ['vendor','fonts','assets','services','work','guides']) {
  const source = path.join(root,'dist',name);
  if (existsSync(source)) cpSync(source,path.join(root,name),{recursive:true});
}
console.log('Updated public mirrors, service, project, guide and SEO assets from dist.');

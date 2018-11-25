const fs = require('fs');
const path = require('path');

let [, , ...templates] = process.argv;
const src = path.resolve(__dirname, 'common-config');
const packagesPath = path.resolve(__dirname, '../packages');
const allTemplates = (fs.readdirSync(src) as string[])
  .filter(f => !['.DS_Store'].includes(f));


if (!templates.length) templates = allTemplates;
if (!templates.length) throw new Error('No template files provided');

(fs.readdirSync(packagesPath) as string[])
  .map(p => path.join(packagesPath, p))
  .filter(p => fs.statSync(p).isDirectory())
  .forEach(p => {
    templates.forEach(t => {
      const _src = path.join(src, t);
      console.log('Copying', path.relative(src, _src), 'to', path.resolve(p, t));
      fs.copyFileSync(_src, path.resolve(p, t));
    });
  });

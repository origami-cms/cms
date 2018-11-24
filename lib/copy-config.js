const fs = require('fs');
const path = require('path');

const [,, ...templates] = process.argv;
if (!templates.length) throw new Error('No template files provided');



const packagesPath = path.resolve(__dirname, '../packages');
fs.readdirSync(packagesPath)
    .map(p => path.join(packagesPath, p))
    .filter(p => fs.statSync(p).isDirectory())
    .forEach(p => {
        templates.forEach(t => {
            const src = path.resolve(__dirname, 'common-config', t);
            console.log('Copying', src, 'to', path.resolve(p, t));
            fs.copyFileSync(src, path.resolve(p, t));
        });
    });

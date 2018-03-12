const fs = require('fs');
const path = require('path');
const {promisify} = require('util');

const fsStat = promisify(fs.stat);
const fsReadFile = promisify(fs.readFile);

module.exports = async() => {
    const p = path.resolve(process.cwd(), '.origami');
    if (!(await fsStat(p)).isFile()) return false;

    const data = (await fsReadFile(p)).toString();

    try {
        return JSON.parse(data);
    } catch (e) {
        throw new Error('Could not parse Origami file');
    }
}

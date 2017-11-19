const fs = require('fs');
const path = require('path');
module.exports = () => {
    const width = 40;
    console.log(
        fs.readFileSync(path.resolve(__dirname, './crane.txt')).toString()
            .magenta
    );
    const logo = 'ORIGAMI CMS'.split('').join(' ');
    const spacer = ' '.repeat((width - logo.length) / 2);
    console.log(`${spacer}${logo}${spacer}`.magenta, '\n'.repeat(5));
};

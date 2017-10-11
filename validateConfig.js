const path = require('path');
const {requireKeys} = require('origami-core-lib');

const err = e => {
    throw new Error(e.red);
};

module.exports = config => {
    try {
        requireKeys([
            'store'
        ], config);
    } catch (e) {
        err(`Origami: Missing '${e.key}' setting`);
    }


    // ---------------------------------------------------------- Validate store
    const store = `origami-store-${config.store.type}`;
    try {
        require(path.resolve(process.cwd(), 'node_modules', store));
    } catch (e) {
        if (e.name == 'Error') err(
            `Origami: Could not find store plugin '${store}'. Try running 'yarn install ${store}'`
        );
        else throw e;
    }
};

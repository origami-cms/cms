const path = require('path');
require('colors');
const Server = require('origami-core-server');
const {symbols} = require('origami-core-lib');
const validateConfig = require('./validateConfig');

const s = symbols([
    // Props
    'config',
    'server',
    'store',

    // Methods
    'setup',
    'setupStore',
    'setupServer'
]);

const handleErr = err => {
    const testOrigami = /^(Origami.+:)(.+)/;
    if (testOrigami.test(err.message)) {
        const [, type, message] = testOrigami.exec(err.message);
        console.error('❌', type.yellow, message.red);
    } else console.log(err.stack.red);

    process.exit();
};

process.on('unhandledRejection', handleErr);
process.on('uncaughtException', handleErr);

module.exports = class Origami {
    constructor(config) {
        validateConfig(config);
        this[s.config] = config;

        this[s.setup]();
    }


    async [s.setup]() {
        await this[s.setupStore]();
        await this[s.setupServer]();
    }


    async [s.setupStore]() {
        const c = this[s.config];

        const Store = require(path.resolve(
            process.cwd(),
            'node_modules',
            `origami-store-${c.store.type}`
        ));

        const store = this[s.store] = new Store(c.store);
        await store.connect();
        console.log(`Origami: Connected to store ${c.store.type}`);
    }


    async [s.setupServer]() {
        this[s.server] = await new Server(
            this[s.config].server,
            this[s.store]
        );
    }
};

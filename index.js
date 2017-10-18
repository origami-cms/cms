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
    'admin',

    // Methods
    'setup',
    'setupStore',
    'setupAdmin',
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
        const defaults = {
            'admin': 'zen'
        };
        this[s.config] = {...defaults, ...config};

        this[s.setup]();
    }


    async [s.setup]() {
        await this[s.setupStore]();
        await this[s.setupAdmin]();
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
        console.log('✅ Origami: Connected to store'.magenta, c.store.type.cyan);
    }

    [s.setupAdmin]() {
        const {admin} = this[s.config];
        this[s.admin] = require(path.resolve(
            process.cwd(),
            'node_modules',
            `origami-admin-${admin}`
        ));
        console.log('✅ Origami: Using admin interface'.magenta, admin.cyan);
    }


    async [s.setupServer]() {
        this[s.server] = await new Server(
            this[s.config].server,
            this[s.store],
            this[s.admin]
        );
    }
};

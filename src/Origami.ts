import path from 'path';
import 'colors';
import Server, {Route} from 'origami-core-server';
import {Origami, success, error, config} from 'origami-core-lib';

const bird = require('origami-bird');


const handleErr = (err: Error) => {
    const testOrigami = /^(Origami.+:)(.+)/;
    const res = testOrigami.exec(err.message);
    if (res && res.length >= 3) {
        const [, type, message] = res;
        console.error('❌', type.yellow, message.red);
    } else if (err.stack) console.log(err.stack.red);

    process.exit();
};


process.on('unhandledRejection', handleErr);
process.on('uncaughtException', handleErr);

export default class OrigamiRunner {
    server: Server | null = null;

    private _readyFuncs: Function[] = [];
    private _config: Origami.Config | null = null;
    private _store: object | null = null;
    private _admin: Function | null = null;

    constructor(config: Origami.Config) {
        this._init(config);
    }

    async _init(c: Origami.Config) {
        const origamiFile = (await config.read()) || {};
        const defaults = {
            'admin': 'zen'
        };

        const combined = {...defaults, ...origamiFile, ...c};
        config.validate(combined);
        this._config = combined;


        this._setup();

        bird();
    }

    async _setup() {
        await this._setupStore();
        await this._setupAdmin();
        await this._setupServer();
        this._readyFuncs.forEach(f => f());
    }


    async _setupStore() {
        if (!this._config) return error('Not initialised');
        const c = this._config;

        const Store = require(path.resolve(
            process.cwd(),
            'node_modules',
            `origami-store-${c.store.type}`
        ));

        const store = this._store = new Store(c.store);
        await store.connect();
        success('', 'Connected to store', c.store.type.cyan);
    }

    _setupAdmin() {
        if (!this._config) return error('Not initialised');

        const { admin } = this._config;
        this._admin = require(path.resolve(
            process.cwd(),
            'node_modules',
            `origami-admin-${admin}`
        ));
        success('', 'Using admin interface', admin.cyan);
    }


    async _setupServer() {
        if (!this._config || !this._store || !this._admin) return error('Not initialised');
        this.server = await new Server(
            this._config.server,
            this._store,
            this._admin
        );
    }


    ready(func: Function) {
        this._readyFuncs.push(func);
    }
};

import 'colors';
import {config, error, Origami, requireLib, success, warn} from 'origami-core-lib';
import Server from 'origami-core-server';
import defaultPlugins from './defaultPlugins';
import path from 'path';

const bird = require('origami-bird');

interface AnyError extends Error {
    errno?: string;
};

const handleErr = (err: AnyError) => {
    if (err.errno === 'EADDRINUSE') {
        error('Server', 'That port is already in use!');
    } else {
        console.log(err);
        error(err);
    }
    console.log('Exiting'.gray);


    process.exit();
};


process.on('unhandledRejection', handleErr);
process.on('uncaughtException', handleErr);

export default class OrigamiInstance {
    server: Server | null = null;

    private _readyFuncs: Function[] = [];
    private _config: Origami.Config | null = null;
    private _store: object | null = null;
    private _admin: Function | null = null;
    private _ready: boolean = false;


    constructor(config: Origami.Config) {
        this._init(config);
    }


    ready(func: Function) {
        if (this._ready) func();
        else this._readyFuncs.push(func);
    }


    private async _init(c: Origami.Config) {
        const origamiFile = (await config.read()) || {};

        const combined = {...origamiFile, ...c};
        config.validate(combined);
        this._config = combined;


        this._setup();

        if (process.env.LOG_VERBOSE) bird();
    }


    private async _setup() {
        await this._setupStore();
        await this._setupAdmin();
        await this._setupServer();

        this._ready = true;
        this._readyFuncs.forEach(f => f());
    }


    private async _setupStore() {
        if (!this._config) return error('Not initialized');
        const c = this._config;
        if (!c.store) return warn('CMS: Store is disabled. I hope you know what you\'re doing...');

        const store = await requireLib(c.store.type, __dirname, `origami-store-`);

        const s = this._store = new store(c.store);
        await s.connect();
        success('CMS: Connected to store', c.store.type.cyan);
    }


    private async _setupAdmin() {
        if (!this._config) return error('Not initialized');
        if (!this._store || !this._config.admin) return;

        let {admin} = this._config;
        if (admin === true) admin = 'zen';

        this._admin = await requireLib(admin, __dirname, `origami-admin-`);
        success('CMS: Using admin interface', admin.cyan);
    }


    private async _setupServer() {
        if (!this._config) return error('Not initialized');
        const s = this.server = await new Server(
            this._config.server,
            this._store
        );

        if (this._store && this._admin) this._admin!(this.server, {});

        // Setup the default and user defined plugins for the server
        const plugins = {...defaultPlugins, ...this._config.plugins};
        await Promise.all(
            config.setupPlugins({plugins}, this.server, path.resolve(__dirname, '../'))
        );

        // Setup the apps for the server
        if (this._config.apps) config.setupApps(this._config, this.server);

        // Setup the resources for the server API
        if (this._config.resources) config.setupResources(this._config, this.server);

        // Setup the controllers for the server API
        if (this._config.controllers) config.setupControllers(this._config, this.server);

        // Serve the app
        await s.serve();
    }
}

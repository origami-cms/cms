"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("colors");
const origami_core_lib_1 = require("origami-core-lib");
const origami_core_server_1 = __importDefault(require("origami-core-server"));
const defaultPlugins_1 = __importDefault(require("./defaultPlugins"));
const path_1 = __importDefault(require("path"));
const bird = require('origami-bird');
;
const handleErr = (err) => {
    if (err.errno === 'EADDRINUSE') {
        origami_core_lib_1.error('Server', 'That port is already in use!');
    }
    else {
        console.log(err);
        origami_core_lib_1.error(err);
    }
    console.log('Exiting'.gray);
    process.exit();
};
process.on('unhandledRejection', handleErr);
process.on('uncaughtException', handleErr);
class OrigamiInstance {
    constructor(config) {
        this.server = null;
        this._readyFuncs = [];
        this._config = null;
        this._store = null;
        this._admin = null;
        this._ready = false;
        this._init(config);
    }
    ready(func) {
        if (this._ready)
            func();
        else
            this._readyFuncs.push(func);
    }
    async _init(c) {
        const origamiFile = (await origami_core_lib_1.config.read()) || {};
        const combined = Object.assign({}, origamiFile, c);
        origami_core_lib_1.config.validate(combined);
        this._config = combined;
        this._setup();
        if (process.env.LOG_VERBOSE)
            bird();
    }
    async _setup() {
        await this._setupStore();
        await this._setupAdmin();
        await this._setupServer();
        this._ready = true;
        this._readyFuncs.forEach(f => f());
    }
    async _setupStore() {
        if (!this._config)
            return origami_core_lib_1.error('Not initialized');
        const c = this._config;
        if (!c.store)
            return origami_core_lib_1.warn('CMS: Store is disabled. I hope you know what you\'re doing...');
        const store = await origami_core_lib_1.requireLib(c.store.type, __dirname, `origami-store-`);
        const s = this._store = new store(c.store);
        await s.connect();
        origami_core_lib_1.success('CMS: Connected to store', c.store.type.cyan);
    }
    async _setupAdmin() {
        if (!this._config)
            return origami_core_lib_1.error('Not initialized');
        if (!this._store || !this._config.admin)
            return;
        let { admin } = this._config;
        if (admin === true)
            admin = 'zen';
        this._admin = await origami_core_lib_1.requireLib(admin, __dirname, `origami-admin-`);
        origami_core_lib_1.success('CMS: Using admin interface', admin.cyan);
    }
    async _setupServer() {
        if (!this._config)
            return origami_core_lib_1.error('Not initialized');
        const s = this.server = await new origami_core_server_1.default(this._config.server, this._store);
        if (this._store && this._admin)
            this._admin(this.server, {});
        // Setup the default and user defined plugins for the server
        const plugins = Object.assign({}, defaultPlugins_1.default, this._config.plugins);
        await Promise.all(
        // @ts-ignore
        origami_core_lib_1.config.setupPlugins({ plugins }, this.server, path_1.default.resolve(__dirname, '../')));
        // Setup the apps for the server
        if (this._config.apps)
            origami_core_lib_1.config.setupApps(this._config, this.server);
        // Setup the resources for the server API
        if (this._config.resources)
            origami_core_lib_1.config.setupResources(this._config, this.server);
        // Setup the controllers for the server API
        if (this._config.controllers)
            origami_core_lib_1.config.setupControllers(this._config, this.server);
        // Serve the app
        await s.serve();
    }
}
exports.default = OrigamiInstance;

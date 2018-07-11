"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("colors");
const origami_core_lib_1 = require("origami-core-lib");
const origami_core_server_1 = __importDefault(require("origami-core-server"));
const path_1 = __importDefault(require("path"));
const bird = require('origami-bird');
const handleErr = (err) => {
    console.log(err);
    origami_core_lib_1.error(err);
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
        const defaults = {
            admin: 'zen'
        };
        const combined = Object.assign({}, defaults, origamiFile, c);
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
            return origami_core_lib_1.error('Not initialised');
        const c = this._config;
        const store = await origami_core_lib_1.requireLib(c.store.type, __dirname, `origami-store-`);
        const s = this._store = new store(c.store);
        await s.connect();
        origami_core_lib_1.success('', 'Connected to store', c.store.type.cyan);
    }
    async _setupAdmin() {
        if (!this._config)
            return origami_core_lib_1.error('Not initialized');
        const { admin } = this._config;
        this._admin = await origami_core_lib_1.requireLib(admin, __dirname, `origami-admin-`);
        origami_core_lib_1.success('', 'Using admin interface', admin.cyan);
    }
    async _setupServer() {
        if (!this._config || !this._store || !this._admin)
            return origami_core_lib_1.error('Not initialized');
        const s = this.server = await new origami_core_server_1.default(this._config.server, this._store);
        this._admin(this.server, {});
        // Setup the plugins for the server
        if (this._config.plugins) {
            Object.entries(this._config.plugins).forEach(([name, settings]) => {
                s.plugin(name, settings);
            });
        }
        // Setup the apps for the server
        if (this._config.apps) {
            Object.entries(this._config.apps).forEach(([name, settings]) => {
                s.application(name, settings);
            });
        }
        // Setup the resources for the server API
        if (this._config.resources) {
            Object.entries(this._config.resources).forEach(([name, r]) => {
                // r is a string to the model
                if (typeof r === 'string') {
                    const model = require(path_1.default.resolve(process.cwd(), r));
                    const auth = true;
                    s.resource(name, { model, auth });
                    // r is a config object
                }
                else if (r instanceof Object) {
                    const model = require(path_1.default.resolve(process.cwd(), r.model));
                    const auth = r.auth;
                    s.resource(name, { model, auth });
                }
            });
        }
        // Setup the controllers for the server API
        if (this._config.controllers) {
            Object.entries(this._config.controllers).forEach(async ([_path, c]) => {
                let config = {
                    prefix: ''
                };
                if (typeof c === 'string') {
                    config.prefix = c;
                }
                else if (c instanceof Object) {
                    config = Object.assign({}, config, c);
                }
                const route = new origami_core_lib_1.Route(config.prefix);
                const inc = await route.include(path_1.default.resolve(process.cwd(), _path), config.prefix, true);
                s.useRouter(route);
            });
        }
        // Serve the app
        s.serve();
    }
}
exports.default = OrigamiInstance;

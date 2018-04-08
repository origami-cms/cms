"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
require("colors");
const origami_core_server_1 = __importDefault(require("origami-core-server"));
const origami_core_lib_1 = require("origami-core-lib");
const bird = require('origami-bird');
const handleErr = (err) => {
    const testOrigami = /^(Origami.+:)(.+)/;
    const res = testOrigami.exec(err.message);
    if (res && res.length >= 3) {
        const [, type, message] = res;
        console.error('❌', type.yellow, message.red);
    }
    else if (err.stack)
        console.log(err.stack.red);
    process.exit();
};
process.on('unhandledRejection', handleErr);
process.on('uncaughtException', handleErr);
class OrigamiRunner {
    constructor(config) {
        this.server = null;
        this._readyFuncs = [];
        this._config = null;
        this._store = null;
        this._admin = null;
        this._init(config);
    }
    async _init(c) {
        const origamiFile = (await origami_core_lib_1.config.read()) || {};
        const defaults = {
            'admin': 'zen'
        };
        const combined = Object.assign({}, defaults, origamiFile, c);
        origami_core_lib_1.config.validate(combined);
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
        if (!this._config)
            return origami_core_lib_1.error('Not initialised');
        const c = this._config;
        const Store = require(path_1.default.resolve(process.cwd(), 'node_modules', `origami-store-${c.store.type}`));
        const store = this._store = new Store(c.store);
        await store.connect();
        origami_core_lib_1.success('', 'Connected to store', c.store.type.cyan);
    }
    _setupAdmin() {
        if (!this._config)
            return origami_core_lib_1.error('Not initialised');
        const { admin } = this._config;
        this._admin = require(path_1.default.resolve(process.cwd(), 'node_modules', `origami-admin-${admin}`));
        origami_core_lib_1.success('', 'Using admin interface', admin.cyan);
    }
    async _setupServer() {
        if (!this._config || !this._store || !this._admin)
            return origami_core_lib_1.error('Not initialised');
        this.server = await new origami_core_server_1.default(this._config.server, this._store, this._admin);
    }
    ready(func) {
        this._readyFuncs.push(func);
    }
}
exports.default = OrigamiRunner;
;

import 'colors';
import { config, error, Origami, requireLib, Route, success } from 'origami-core-lib';
import Server from 'origami-core-server';
import path from 'path';

const bird = require('origami-bird');


const handleErr = (err: Error) => {
    console.log(err);

    error(err);
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
        const defaults = {
            admin: 'zen'
        };

        const combined = {...defaults, ...origamiFile, ...c};
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
        if (!this._config) return error('Not initialised');
        const c = this._config;

        const store = await requireLib(c.store.type, __dirname, `origami-store-`);

        const s = this._store = new store(c.store);
        await s.connect();
        success('', 'Connected to store', c.store.type.cyan);
    }


    private async _setupAdmin() {
        if (!this._config) return error('Not initialized');

        const {admin} = this._config;
        this._admin = await requireLib(admin, __dirname, `origami-admin-`);
        success('', 'Using admin interface', admin.cyan);
    }


    private async _setupServer() {
        if (!this._config || !this._store || !this._admin) return error('Not initialized');
        const s = this.server = await new Server(
            this._config.server,
            this._store
        );

        this._admin(this.server, {});

        // Setup the plugins for the server
        if (this._config.plugins) {
            Object.entries(this._config.plugins).forEach(([name, settings]) => {
                s.plugin(name, settings);
            });
        }

        // Setup the resources for the server API
        if (this._config.resources) {
            Object.entries(this._config.resources).forEach(([name, r]) => {
                // r is a string to the model
                if (typeof r === 'string') {
                    const model = require(path.resolve(process.cwd(), r));
                    const auth = true;
                    s.resource(name, { model, auth });

                    // r is a config object
                } else if (r instanceof Object) {
                    const model = require(path.resolve(process.cwd(), r.model));
                    const auth = r.auth;
                    s.resource(name, { model, auth });
                }
            });
        }

        // Setup the controllers for the server API
        if (this._config.controllers) {
            Object.entries(this._config.controllers).forEach(async([_path, c]) => {
                let config: Origami.ConfigController = {
                    prefix: ''
                };

                if (typeof c === 'string') {
                    config.prefix = c;
                } else if (c instanceof Object) {
                    config = {
                        ...config,
                        ...c
                    };
                }

                const route = new Route(config.prefix);

                const inc = await route.include(path.resolve(process.cwd(), _path), config.prefix, true);

                s.useRouter(route);
            });
        }

        // Serve the app
        s.serve();
    }
}

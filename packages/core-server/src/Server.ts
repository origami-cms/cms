import { colors, error, info, Origami, requireLib, Route, RouterListItem, success, wrapMiddleware } from '@origami/core-lib';
import bodyParser from 'body-parser';
// @ts-ignore
import corser from 'corser';
// tslint:disable-next-line match-default-export-name
import express, { Application, RequestHandler, Router } from 'express';
import fileUpload from 'express-fileupload';
// @ts-ignore
import staticGzip from 'express-static-gzip';
import { stat } from 'fs';
import helmet from 'helmet';
import { Http2Server } from 'http2';
import ip from 'ip';
import path from 'path';
import { check as checkPort } from 'tcp-port-used';
import { promisify } from 'util';
import * as err from './errors';
import { App } from './lib/app';
import { Resource, ResourceOptions } from './lib/Resource/Resource';
import { content } from './middleware/content';
import { error as mwErrors } from './middleware/errors';
import { format as mwFormat } from './middleware/format';
import { runScripts } from './scripts/runScripts';
const statAsync = promisify(stat);

type positionRouters = {
  [K in Origami.Server.Position]: Router
};

interface NamedMiddleware {
  [name: string]: Origami.Server.RequestHandler;
}

const DEFAULT_PORT = '8080';
const DEFAULT_STATIC = 'public';

export { lib } from './lib';
export * from './lib/app';


export class Server {
  public app: Application;
  public store?: any;
  public apps: { [name: string]: App.App } = {};
  public plugins: { [name: string]: boolean | object } = {};
  public resources: { [name: string]: Resource } = {};

  private _positionRouters: positionRouters;
  private _options: Origami.ConfigServer;
  private _server?: Http2Server;
  private _namedMiddleware: NamedMiddleware = {};


  constructor(
    options?: Origami.ConfigServer,
    store?: any
  ) {
    this.app = express();
    this.store = store;

    // Assign these to a singleton class so they can be use across the server
    this._options = {
      ...{
        port: parseInt(process.env.PORT || DEFAULT_PORT),
        ln: 'enUS',
        secret: 'secret',
      }, ...options
    };

    // Special override for PORT in the environment variable
    if (process.env.PORT) { this._options.port = parseInt(process.env.PORT); }


    // Different positions to run route at
    this._positionRouters = {
      init: express.Router(),

      'pre-store': express.Router(),
      store: express.Router(),
      'post-store': express.Router(),

      'pre-render': express.Router(),
      render: express.Router(),
      'post-render': express.Router(),

      'pre-send': express.Router()
    };


    // Validate the options
    // try {
    //     requireKeys(['secret'], this._options);
    // } catch (e) {
    //     throw new Error(`Origami.Server: Missing '${e.key}' setting`);
    // }

    // tslint:disable-next-line no-floating-promises
    this._setup();


    this.app.set('ln', this._options.ln);
    this.app.set('secret', this._options.secret);
    this.app.set('apps', this.apps);
  }


  // Runs the app
  public async serve() {
    if (await checkPort(this._options.port!)) {
      throw new err.ErrorServerPortInUse(this._options.port!);
    }

    this._server = this.app.listen(this._options.port);
    const IP = ip.address();
    const host = ip.isPrivate(IP) ? 'localhost' : IP;

    info(
      'Server',
      'Is now running at',
      // tslint:disable-next-line no-http-string
      colors.yellow(`http://${host}:${this._options.port!.toString()}`)
    );

    // Run the default scripts
    await runScripts(this);
  }


  public stop() {
    if (this._server) { this._server.close(); }
  }


  // Add the Router's routes in each position to the middleware
  public useRouter(router: Route, requireNamedMiddleware: boolean = true) {
    Object.entries(this._positionRouters).forEach(([p, pr]) => {
      router.routers[p as Origami.Server.Position]
        .forEach(({ handlers, method }: RouterListItem) => {
          // Convert all the named handlers (EG: router.use('auth')) into request handlers
          const mappedNamedHandlers = handlers.map((h) => {
            if (typeof h === 'function') { return h; }
            if (!this._namedMiddleware[h]) {
              if (requireNamedMiddleware) {
                throw new err.ErrorServerUnknownNamedMiddleware(h);
              } else {
                error(`Could not load named middleware ${h}`);
                return false;
              }
            }
            return this._namedMiddleware[h];
          }).filter((h) => h) as Origami.Server.RequestHandler[];

          // Wrap all handlers to catch any async errors
          const errorWrapped = mappedNamedHandlers.map(wrapMiddleware);

          const _path = router.url || '';
          const m = method.toLowerCase() as keyof Router;
          (pr[m] as Function)(_path, ...errorWrapped);
          success(
            'Server',
            `Successfully connected ${_path} route: `,
            colors.yellow(method.toUpperCase()),
            colors.yellow(_path.toString()));
        });
    });
    router.nested.forEach((_r) => this.useRouter(_r, requireNamedMiddleware));
  }


  public async plugin(
    name: string,
    settings: boolean | object = true,
    p: string = process.cwd()
  ): Promise<boolean> {
    if (Boolean(settings)) {
      success('Server', 'Successfully initialized plugin', colors.yellow(name));
      let plugin;

      try {
        plugin = await requireLib(name, p, ['@origami/plugin-', 'origami-plugin-']);

      } catch (e) {
        throw new err.ErrorServerUnknownPlugin(name);
      }

      if (typeof plugin !== 'function') {
        // Allow for importing es6 modules with require (usually experted from typescript)
        if (plugin && typeof plugin.default === 'function') {
          plugin = plugin.default;
        } else { throw new err.ErrorServerPluginNotFunction(name); }
      }

      await plugin(this, settings);

      this.plugins[name] = settings;

      return true;
    }

    return false;
  }


  public async application(name: string, settings: boolean | object = true) {
    if (Boolean(settings)) {
      const app = new App.App(name, this, settings);
      await app.setup();

      success('Server', 'Successfully initialized application', colors.yellow(name));
      return app;
    } else { return Promise.resolve(false); }
  }


  public resource(name: string, options: ResourceOptions) {
    if (!this.store) { throw new err.ErrorServerStoreNotConfigured(); }
    const r = new Resource(name, this.store, options);
    this.useRouter(r.router);
    this.resources[name] = r;
    success('Server', 'Successfully initialized resource', colors.yellow(name));
    return r;
  }


  public namedMiddleware(name: string, handler: Origami.Server.RequestHandler) {
    if (this._namedMiddleware[name]) { throw new err.ErrorServerExistingNamedMiddleware(name); }
    this._namedMiddleware[name] = handler;
  }


  public getNamedMiddleware(
    name?: string | RegExp
  ): Origami.Server.RequestHandler | NamedMiddleware | false {

    if (!name) { return { ...this._namedMiddleware }; }

    // Filter out the middleware by the regex name
    if (name instanceof RegExp) {
      return Object.entries(this._namedMiddleware)
        .filter(([key]) => name.test(key))
        .reduce((_mw, [key, obj]) => {
          _mw[key] = obj;
          return _mw;
        }, {} as NamedMiddleware);
    }

    const mw = this._namedMiddleware[name];
    return mw || false;
  }


  // Return a list of all middleware in the position routers that match the path
  // (exposes Express Layers and their 'handle')
  public getMiddlewareForPath(p: string): Function[] {
    const mw = Object.values(this._positionRouters).reduce((_mw, r) => {
      _mw.push(
        ...r.stack
          .filter((layer) => layer.match(p))
          .map((layer) => {
            if (layer.route) { return layer.route.stack; } else { return layer.handler; }
          }) as Function[]
      );
      return _mw;
    }, [] as Function[]);
    return [].concat.apply([], mw);
  }


  // Wrapper for staticGzip
  public static(p: string, prefix?: string) {
    const r = new Route(prefix || '/');
    // r.use(express.static(path));
    r.use(staticGzip(p));
    this.useRouter(r);
  }


  // Registers all the middleware and serves the app
  private async _setup() {
    // Setup the store
    if (this.store) { this.app.set('store', this.store); }


    this.app.use(fileUpload());
    this.app.use(helmet({
      frameguard: {
        action: 'allow-from',
        domain: '*'
      }
    }));
    this.app.use(corser.create());


    await this._setupStatic();

    // Setup the middleware
    await this._setupMiddleware();
  }


  private async _setupMiddleware() {
    this.app.use(content as RequestHandler);

    this._position('init');

    this.app.use(bodyParser.urlencoded({
      extended: true
    }));
    this.app.use(bodyParser.json());


    // PRE-STORE position
    this._position('pre-store');
    this._position('store');
    this._position('post-store');


    // PRE-RENDER position
    this._position('pre-render');
    this._position('render');
    this._position('post-render');


    // Wrap for friendly errors
    this.app.use(mwErrors);


    // PRE-SEND position
    this._position('pre-send');
    this.app.use(mwFormat());
  }


  private async _setupStatic() {
    if (this._options.static === false) { return; }

    if (this._options.static === undefined || this._options.static === true) {
      try {
        (await statAsync(path.join(process.cwd(), DEFAULT_STATIC))).isDirectory();
        this._options.static = DEFAULT_STATIC;
      } catch { }
    }
    let s = this._options.static as string | string[];


    if (s) {
      if (!(s instanceof Array)) { s = [s]; }
      s.forEach((_s) => this.static(path.resolve(process.cwd(), _s)));
    }
  }


  // Run the middleware for the router position
  private _position(pos: Origami.Server.Position) {
    this.app.use(this._positionRouters[pos]);
  }
}

// tslint:disable no-console no-http-string
import { bird } from '@origami/bird';
import {
  colors, config, error, log, Origami as OrigamiNS, OrigamiError, requireLib, Server, success, warn
} from '@origami/core';
import path from 'path';
// @ts-ignore
import onExit from 'signal-exit';
import { defaultPlugins } from './defaultPlugins';

const URL_ERROR_DOCS = 'http://docs.origami.so/docs/errors';


interface AnyError extends Error {
  errno?: string;
}

const handleErr = (err: AnyError) => {
  let name = err.name;
  const message = err.message;
  const code = (err as any).code
    ? colors.grey(`[${(err as any).code}]`)
    : '';
  let footer = '';

  const padSize = 2;
  const padding = ' '.repeat(padSize);

  let stack = '';
  if (err.stack) {
    stack = `\n${err.stack
      .split('\n')
      .slice(1)
      .map((l) => padding.repeat(2) + l.trim())
      .join('\n')
      }`;
  }

  if (err instanceof OrigamiError) {
    name = `Origami Error: ${err.namespace}.${err.name}`;
    footer += colors.grey.bold(`\n\n\n${padding}📕 Further reading:\n`);
    footer += padding + colors.grey(`Learn more about this error here: ${
      colors.yellow.underline(`${URL_ERROR_DOCS}#${err.code}`)
      }`);

    if (!err.showTrace) stack = '';

  } else name = `Error: ${err.name}`;

  console.log(
    colors.white.bgRed.bold(`\n\n ${name} `),
    code,
    colors.red(`\n\n${padding}${message}`),
    colors.red(stack),
    footer,
    '\n\n'
  );
  error(err);

  process.exit(1);
};

process.on('unhandledRejection', handleErr);
process.on('uncaughtException', handleErr);

export class Origami {
  public server: Server | null = null;

  private _readyFuncs: Function[] = [];
  private _config: OrigamiNS.Config | null = null;
  private _store: object | null = null;
  private _admin: Function | null = null;
  private _ready: boolean = false;


  constructor(conf: OrigamiNS.Config) {
    // tslint:disable no-floating-promises
    this._init(conf);

    onExit((code: string, signal: string) => {
      let msg = 'Exiting';
      if (code) msg += `(${code})`;
      console.log(colors.grey(msg));
    });
  }


  public ready(func: Function) {
    if (this._ready) func();
    else this._readyFuncs.push(func);
  }


  private async _init(c: OrigamiNS.Config) {
    const origamiFile = (await config.read()) || {};

    const combined = { ...origamiFile, ...c };
    // config.validate(combined);
    this._config = combined;


    this._setup();

    bird();
  }


  private async _setup() {
    await this._setupStore();
    await this._setupAdmin();
    await this._setupServer();

    this._ready = true;
    this._readyFuncs.forEach((f) => f());
  }


  private async _setupStore() {
    if (!this._config) {
      error('Not initialized');
      return;
    }

    const c = this._config;
    if (!c.store) {
      warn('Store is disabled. I hope you know what you\'re doing...');
      return;
    }

    const store = await requireLib(
      c.store.type, __dirname, ['@origami/store-', 'origami-store-']
    );

    const s = this._store = new store(c.store);
    await s.connect();
    success('Store', 'Successfully connected to store', colors.yellow(c.store.type));
  }


  private async _setupAdmin() {
    if (!this._config) {
      error('Not initialized');
      return;
    }
    if (!this._store || !this._config.admin) return;

    let { admin } = this._config;
    if (admin === true) admin = 'zen';

    this._admin = await requireLib(admin, __dirname, ['@origami/admin-', 'origami-admin-']);
    log(colors.green('Using admin interface'), colors.blue(admin));
  }


  private async _setupServer() {
    if (!this._config) {
      error('Not initialized');
      return;
    }

    const s = this.server = new Server(
      this._config.server,
      this._store
    );

    if (this._store && this._admin) this._admin(this.server, {});

    // Setup the default and user defined plugins for the server
    const plugins = { ...defaultPlugins, ...this._config.plugins };
    await config.setupPlugins({ plugins }, this.server, path.resolve(__dirname, '../'));

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

import { config, error, Origami, requireLib, resolveLib, Route } from '@origami/core-lib';
// tslint:disable match-default-export-name
import express from 'express';
import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import { Server } from '../../Server';
import * as err from './errors';

const readDir = promisify(fs.readdir);
const stat = promisify(fs.stat);


export namespace App {
  export interface EntryResponse {
    name: string;
    icon: string;
    uriBase: string;
    scripts: string[];
  }

  // tslint:disable-next-line
  export class App {
    public manifest?: Origami.AppManifest;
    public entry: EntryResponse | false = false;
    public router?: Route;

    private _prefix = '/api/v1/apps/';
    private _dir?: string;

    constructor(
      public name: string,
      public server: Server,
      public settings?: boolean | object
    ) {
    }

    get appName() {
      if (!this.manifest) { return false; }
      return this.manifest.name.replace(/\s/g, '-').toLowerCase();
    }

    get api() {
      if (!this.appName) { return false; }
      return this._prefix + this.appName;
    }

    get icon() {
      if (!this.manifest || !this._dir) { return false; }
      const icon = this.manifest.icon || 'icon.svg';
      return path.resolve(this._dir, icon);
    }


    public async setup() {
      await this._loadManifest();

      // Attempt to register the app on the Server
      this._registerApp();


      // Create the main router for the app
      this.router = new Route(this.api as string);


      // Initialize the app router (/api/v1/apps/:appName)
      this.server.useRouter(
        this._setupFileRouter() as Route,
        false
      );

      await this._setupAppModels();
      await this._setupAppRoutes();
      await this._setupAppResources();
    }


    /**
     * Load the app's manifest file, and throw error if there is none
     */
    private async _loadManifest() {
      const location = [`${this.name}/origami.app`, process.cwd(), 'origami-app-'];

      let manifest: Origami.AppManifest;
      try {
        manifest = await requireLib.apply(this, location);
      } catch (e) {
        throw new err.ErrorAppManifestLoad(this.name);
      }

      if (!manifest.name) { throw new err.ErrorAppManifestPropertyMissing(this.name, 'name'); }

      this._dir = path.dirname(await resolveLib.apply(this, location) as string);

      this.manifest = manifest;

      if (!manifest.icon) {
        throw new err.ErrorAppManifestPropertyMissing(this.appName as string, 'icon');
      }
      if (typeof manifest.icon !== 'string') {
        throw new err.ErrorAppManifestIconInvalid(this.appName as string);
      }


      this.entry = this._convertManifestToEntry();

      return manifest;
    }


    /**
     * Register the app in the Server and throws error if namespace is taken
     */
    private _registerApp(): void {
      const name = this.appName as string;

      if (!this.manifest || !name) {
        error(new Error(`App ${this.name}'s manifest is not loaded`));
      }

      // If it's already registered, throw an error
      if (this.server.apps[name]) {
        error(new Error(`Application ${name} is already registered`));
      }

      this.server.apps[name] = this;
    }


    /**
     * Generate MW for serving files and app manifest
     */
    private _setupFileRouter() {
      if (!this.router) { throw new Error('App is not setup'); }
      if (!this.manifest || !this._dir) {
        error(new Error(`App ${this.name}'s manifest is not loaded`));
        return;
      }


      // Entry or entry element
      this.router.route('/entry').get('auth', async (req, res, next) => {

        let element;
        let file = 'index.html';

        if (this.manifest!.admin) {
          element = this.manifest!.admin!.entryElement;
          if (this.manifest!.admin!.entry) { file = this.manifest!.admin!.entry!; }
        }

        if (element) { return res.send(`<${element}></${element}>`); }

        const entryPath = path.resolve(this._dir!, file);

        try {
          if ((await stat(entryPath)).isFile()) {
            res.sendFile(entryPath);
            return;
          }
        } catch (e) {
          next();
          return;
        }

        next();
      });


      // Serve these directories from the root of the app
      ['public']
        .map((dir) => path.resolve(this._dir as string, dir))
        .filter(async (dir) => {
          try {
            return (await stat(dir)).isDirectory();
          } catch {
            return false;
          }
        })
        .forEach((dir) => this.router!
          .route(`/${dir.split('/').pop()}`)
          // TODO: convert to gzip serve
          // @ts-ignore Is a valid request handler
          .use(express.static(dir))
        );


      // Setup basic route for retrieving the manifest
      // EG: GET /api/v1/apps/:appName
      this.router.get('auth', (req, res, next) => {
        if (this.entry) { res.locals.content.set(this.entry); }
        next();
      });


      // App icon serving
      const icon = this.icon;
      if (icon) {
        this.router.route('/icon').use(
          // @ts-ignore Is a valid request handler
          express.static(icon)
        );
      }

      return this.router;
    }


    private async _setupAppModels() {
      if (!this.server.store) { return; }
      return this._loadFilesInAppDir('models', (f, model) => {
        this.server.store.model(f, model);
      });
    }


    /**
     * Loads all the routes in appDir/routes and runs the function with the app settings
     */
    private async _setupAppRoutes() {
      return this._loadFilesInAppDir('routes', (f, route) => {
        if (typeof route !== 'function') {
          error(new Error(
            `App ${this.name} has route '${f}' that does not export a function`
          ));
          return;
        }
        route(this.server, this.settings);
      });
    }


    private async _setupAppResources() {
      if (this.manifest!.resources && this.server.store) {
        return config.setupResources(
          // @ts-ignore
          { resources: this.manifest!.resources },
          this.server,
          this._dir
        );
      }
    }


    /**
     * Run a function over each file in the app's subdirectory (route, model, etc)
     */
    private async _loadFilesInAppDir(
      type: 'routes' | 'models',
      func: (f: string, m: any) => void,
      filetype: string = 'js'
    ) {

      const fp = path.join(this._dir as string, type);
      let files;

      // Load the filtered files with the given filetype
      try {
        files = (await readDir(fp))
          .filter((f) => f.endsWith(`.${filetype}`))
          .map((f) => path.join(fp, f));
        // No folder
      } catch { return false; }

      try {
        // Run a function over each file and return the map
        files.forEach((f) => func(
          path.basename(f).slice(0, (filetype.length + 1) * -1),
          require(f)
        ));
        return;

      } catch (e) {
        error(`Error in loading app '${this.name}' ${type}`, e);
      }
    }

    private _convertManifestToEntry() {
      const m = this.manifest;
      if (!m) { return false; }

      const returning: EntryResponse = {
        name: m.name,
        icon: `${this.api}/icon`,
        uriBase: m.name,
        scripts: []
      };

      const a = m.admin;
      if (a) {
        if (a.uriBase) { returning.uriBase = a.uriBase; }
        if (a.entryScripts) { returning.scripts = a.entryScripts; }
      }

      return returning;
    }
  }

}

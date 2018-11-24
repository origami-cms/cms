import dot from 'dot-object';
import dotenv from 'dotenv';
import { readFile, stat, writeFile } from 'fs';
import path from 'path';
import { promisify } from 'util';
import { error } from '.';
import { OrigamiError } from './OrigamiError';
import { Route } from './Route';
import { Origami } from './types/Origami';

const fsReadFile = promisify(readFile);
const fsWriteFile = promisify(writeFile);
const fsStat = promisify(stat);


const CONFIG_FILE = (): string => path.resolve(process.env.CLI_CWD || './', '.origami');


export class ErrorResourceNotFound extends OrigamiError {
  constructor(name: string, resource: string) {
    super(
      'Resource',
      'NotFound',
      `Resource '${name}' could not be found at '${resource}`
    );
  }
}


export namespace config {

  /**
   * Injects origami_x_y environment variables into a Origami.config and replaces
   * aliased keys in objects (eg: {'/path/to/plugin.js:myPlugin': true})
   * @returns Object of origami environment variables
   */
  export const env = (
    obj: Partial<Origami.Config> = {}
  ): Partial<Origami.Config> => {
    dotenv.config({
      path: path.join(process.env.CLI_CWD || process.cwd(), '.env')
    });

    // A map of aliased files to their alias
    // EG: '/path/to/plugin.js:myPlugin' => {'myplugin': '/path/to/plugin.js'}
    const aliases = {
      plugins: {} as { [key: string]: any }
    };

    // Replace all aliased local paths (eg: '/path/to/plugin:withAlias') to the aliases
    // Also removes the aliases from the object keys
    if (obj.plugins) {
      Object.entries(obj.plugins).forEach(([plugin, options]) => {
        // If plugin is a file not a module...
        const res = /^(\.{0,2}?\/.*):([\w-]+)$/.exec(plugin);
        if (res) {
          obj.plugins![res[1]] = options;
          aliases.plugins[res[2].toLowerCase()] = res[1];
          delete obj.plugins![plugin];
        }
      });
    }

    // Inject process environment variables into config
    Object.entries(process.env)
      // Find only env variables prefixed with 'origami'
      .filter(([key, value]) => /^origami_.*$/.test(key.toLowerCase()))

      // Replace '_' with '.' and remove 'origami_'
      .map(([key, value]) => [
        key.toLowerCase()
          // Replace _ with .
          .replace(/_/g, '.')
          // Remove preceding 'origami.'
          .split('.').slice(1).join('.'),
        value
      ])

      .forEach(([key, value]) => {
        let _key = key;
        let _obj: Partial<Origami.Config> | boolean = obj;
        // If the variable is a plugin setting that is contained in aliases
        // Then update the config via the filename not the alias
        const res = /plugins\.([\w-]+)/.exec(key!);
        if (res && aliases.plugins[res[1]]) {
          _key = key!.split('.').slice(2).join('.');
          _obj = obj.plugins![aliases.plugins[res[1]]];
        }

        // Try set the key, however current value may be a boolean or undefined
        // meaning that deeper keys may throw error. If that's the case,
        // then set the value to an empty object, and try again
        dot.str(_key as string, value, _obj);
      });

    return obj;
  };


  /**
   * Attempt to load the .origami file at the current directory. Overwrites with any ENV variables
   * @returns The Origami file as json, or false if it cannot be
   * found or loaded correctly
   */
  export const read = async (
    fileOrDirectory?: string
  ): Promise<Origami.Config | false> => {
    // If there is no file provided, load the .origami file in the current dir
    let file = path.join(process.env.CLI_CWD || process.cwd(), '.origami');

    if (fileOrDirectory) {
      let stats;
      try {
        stats = await fsStat(fileOrDirectory);
      } catch {
        return false;
      }
      if (stats.isFile()) file = fileOrDirectory;

      // If a directory is passed, attempt to load the .origami file in the directory
      // If that's not a file return false
      if (stats.isDirectory()) {
        const joined = path.join(fileOrDirectory, '.origami');
        let fileStats;
        try {
          fileStats = await fsStat(joined);
        } catch (e) {
          return false;
        }
        if (fileStats.isFile()) {
          process.env.CLI_CWD = fileOrDirectory;
          process.chdir(fileOrDirectory);
          file = path.join(process.cwd(), '.origami');
        }
      }
    }

    let c = {} as Origami.Config;
    let fileString;
    try {
      fileString = (await fsReadFile(file)).toString();
    } catch {
      // No .origami file
      return false;
    }
    try {
      c = JSON.parse(fileString);
    } catch (e) {
      error('Error parsing .origami file');
      throw e;
    }

    c = env(c) as Origami.Config;

    return c;
  };


  /**
   * Override/write the .origami file
   * @param file JSON config for Origami app to override
   */
  export const write = async (file: Partial<Origami.Config>): Promise<void> => {
    const TAB_SIZE = 4;
    return fsWriteFile(
      CONFIG_FILE(),
      JSON.stringify(file, null, TAB_SIZE)
    );
  };


  // export const validate = (config: Origami.Config) => {
  //     try {
  //         // requireKeys([
  //         //     'store'
  //         // ], config);
  //     } catch (e) {
  //         return error(new Error(`Origami: Missing '${e.key}' setting`));
  //     }


  // ------------------------------------------------------ Validate store
  // const store = `origami-store-${config.store.type}`;
  // try {
  //     require(path.resolve(process.cwd(), 'node_modules', store, 'package.json'));
  // } catch (e) {
  //     if (e.name === 'Error') {

  //         return error(
  //                 new Error(
  //                     `Origami: Could not find store plugin '${
  // store}'. Try running 'yarn install ${store}'`
  //                 )
  //             );
  //     }

  //     return error(e);
  // }
  // };


  // Setup the plugins for the server
  export const setupPlugins = async (
    conf: Partial<Origami.Config>,
    server: any,
    context: string = process.cwd()
  ): Promise<boolean | boolean[]> => {
    if (!conf.plugins) return Promise.resolve(false);
    return Promise.all(
      Object.entries(conf.plugins).map(async ([name, settings]) =>
        server.plugin(name, settings, context)
      )
    );
  };


  // Setup the apps for the server
  export const setupApps = async (
    conf: Partial<Origami.Config>,
    server: any
  ): Promise<boolean | boolean[]> => {
    if (!conf.apps) return Promise.resolve(false);
    return Promise.all(
      Object.entries(conf.apps).map(async ([name, settings]) =>
        server.application(name, settings)
      )
    );
  };


  // Setup the resources for the server API
  export const setupResources = async (
    conf: Partial<Origami.Config>,
    server: any,
    context: string = process.cwd()
  ): Promise<boolean | boolean[]> => {
    if (!conf.resources) return Promise.resolve(false);
    return Promise.all(
      Object.entries(conf.resources).map(async ([name, r]) => {
        let mPath;
        let model;

        // r is a string to the model
        if (typeof r === 'string') {
          mPath = path.resolve(context, r);
          try {
            model = require(mPath);
          } catch (e) {
            throw new ErrorResourceNotFound(name, mPath);
          }
          const auth = true;
          return server.resource(name, { model, auth });

          // r is a config object
        } else if (r instanceof Object) {
          mPath = path.resolve(context, r.model);
          try {
            model = require(mPath);
          } catch (e) {
            throw new ErrorResourceNotFound(name, mPath);
          }
          const auth = r.auth;
          return server.resource(name, { model, auth });
        }
      })
    );
  };


  // Setup the controllers for the server API
  export const setupControllers = async (
    conf: Partial<Origami.Config>,
    server: any,
    context: string = process.cwd()
  ): Promise<boolean | boolean[]> => {
    if (!conf.controllers) return Promise.resolve(false);
    return Promise.all(
      Object.entries(conf.controllers).map(async ([_path, c]) => {
        let _conf: Origami.ConfigController = {
          prefix: ''
        };

        if (!c) return false;
        if (typeof c === 'string') _conf.prefix = c;
        else if (c instanceof Object) {
          _conf = {
            ..._conf,
            ...c as Origami.ConfigController
          };
        }
        const route = new Route(_conf.prefix);
        await route.include(
          path.resolve(context, _path),
          false, true, false
        );
        server.useRouter(route);

        return true;
      })
    );
  };


  // Load a directory of routes, models, config files, etc, and automatically
  // add everything into the server (EG: calling useRouter(), resource(), etc)
  // const loadDirectory = (dir: string) => {
  //     // TODO:
  //     error('Not implemented');
  // };
}

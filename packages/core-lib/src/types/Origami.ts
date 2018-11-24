// tslint:disable match-default-export-name no-implicit-dependencies interface-name
import express from 'express';
import { Writable } from 'stream';

export namespace Origami {
  export interface Config {
    /**
     * Settings for the overall project
     */
    'app': ConfigApp;

    /**
     * Settings for the store/database
     */
    'store'?: ConfigStore;

    /**
     * Settings for the server setup
     */
    'server': ConfigServer;

    /**
     * Admin node module
     */
    'admin'?: boolean | string;

    /**
     * Model/Controller resources to automatically create
     */
    'resources'?: {
      [name: string]: ConfigResource | string;
    };

    /**
     * Plugins to integrate into Origami
     */
    'plugins'?: {
      [name: string]: boolean | object;
    };

    /**
     * Add controllers by individual files or directories
     */
    'controllers'?: {
      [path: string]: ConfigController | string | boolean;
    };

    /**
     * Applications to install into Origami
     */
    'apps'?: {
      [name: string]: boolean | object;
    };
  }


  export interface ConfigApp {
    /**
     * Name of the project
     */
    'name': string;
  }


  export interface ConfigStore {
    /**
     * Store/Database type to integrate with
     */
    'type': string;
    /**
     * Store/Database hostname to connect with
     */
    'host': string;
    /**
     * Store/Database port to connect with
     */
    'port': number;
    /**
     * Store/Database db name to connect with
     */
    'database': string;
    /**
     * Store/Database username to connect with
     */
    'username': string;
    /**
     * Store/Database password to connect with
     */
    'password': string;
  }

  export interface ConfigTheme {
    /**
     * Theme name to run
     */
    'name'?: string;
    'path'?: string;
  }

  export interface ConfigServer {
    /**
     * Secret code to encrypt data and authentication tokens with
     */
    'secret'?: string;
    /**
     * Port number to run the server on
     */
    'port'?: number;
    /**
     * Server language
     */
    'ln'?: string;
    /**
     * Static directories to serve
     */
    'static'?: string | string[] | boolean;
  }


  export interface ConfigResource {
    model: string;
    auth?: boolean | {
      [key in 'get' | 'head' | 'post' | 'put' | 'delete' | 'list']: boolean
    };
  }

  export interface ConfigController {
    /**
     * Prefix all controllers in this path under a prefix
     */
    prefix?: string;
  }


  /**
   * Valid types of Origami modules to install via NPM
   * @example origami-theme-snow, origami-store-mongodb, origami-plugin-facebook
   */
  export type ModuleType = 'theme' | 'store' | 'plugin' | 'admin';


  export namespace Server {

    export type Position = 'init' | 'pre-store' | 'store' | 'post-store' |
      'pre-render' | 'render' | 'post-render' | 'pre-send';

    export type URL = string | null | RegExp;

    export type Method = 'GET' | 'HEAD' | 'POST' | 'PUT' | 'DELETE' |
      'CONNECT' | 'OPTIONS' | 'PATCH' | 'USE';

    // tslint:disable-next-line no-shadowed-variable
    export interface Config {
      /**
       * Secret code to encrypt data and authentication tokens with
       */
      'secret': string;
      /**
       * Port number to run the server on
       */
      'port': number;
      /**
       * Server language
       */
      'ln': string;
    }

    export type RequestHandler = (req: Request, res: Response, next: express.NextFunction) => any;

    export interface Request extends express.Request {
      jwt: {
        token: string;
        data: {
          userId: string;
          email: string;
        };
      };
      __initialPassword?: string;
    }

    export interface Response extends express.Response {
      locals: {
        content: Content;
        error?: string;
        [key: string]: any;
      };
    }

    // tslint:disable-next-line no-empty-interface
    export interface NextFunction extends express.NextFunction { }

    export interface DataError extends Error {
      data: object;
      statusCode?: number;
    }
  }


  export namespace Theme {
    // tslint:disable-next-line no-shadowed-variable
    export interface Config {
      /**
       * Theme name to run
       */
      name: string;
      paths?: {
        styles?: string;
        views?: string;
        content?: string;
      };
    }
  }


  export namespace Store {
    // tslint:disable-next-line no-shadowed-variable
    export declare const Store: {
      new(options: StoreOptions): Store;
    };
    // tslint:disable-next-line no-shadowed-variable
    export interface Store {

      models: { [name: string]: Model };
      connURI: string;


      connect(): Promise<any>;
      model(name: string, schema?: Schema): Model | void;
    }

    export interface StoreOptions {
      username: string;
      password: string;
      host: string;
      port: number;
      database: string;
    }


    export interface Schema {
      tree?: boolean;
      properties: {
        [key: string]: any;
      };
    }


    export declare const Model: {
      new(name: string, schema: Schema): Model;
    };
    export interface Model {
      create(resource: Resource): Resource;

      find(query: object, opts?: object):
        Promise<Resource | Resource[] | null>;
    }


    export interface Resource {
      id?: string;
      deletedAt?: Date | null;
      children?: Resource[];

      [key: string]: any;
    }

  }


  export interface AppManifest {
    name: string;
    icon?: string;


    admin?: {
      uriBase?: string;
      entryElement?: string;
      entry?: string;
      entryScripts?: string[];
      public?: string;
    };


    resources?: object[];
    plugins?: object[];
    routes?: object[];
  }

  export declare interface ResponseData {
    [key: string]: any;
  }
  export declare type ResponseContent = string | ResponseData | Writable;
  export declare class Content {
    public responseCode: string | false;
    public readonly hasContent: boolean;
    private _content?;
    private _responseCode;
    constructor(req: Server.Request, res: Server.Response);
    public set(content: ResponseContent): void;
    public get(): ResponseContent | false;
    public clear(): void;
  }
}


export interface PackageJson {
  'name'?: string;
  'dependencies'?: {
    [pkg: string]: string;
  };
  'devDependencies'?: {
    [pkg: string]: string;
  };
  'scripts'?: {
    [name: string]: string;
  };
}

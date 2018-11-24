import fs from 'fs';
import path from 'path';
import { Origami } from '..';
import { warn } from '../logs';
import { flatten, regexConcat } from '../utility';
import {
  ErrorRouteFileNotRoute,
  ErrorRouteInvalidInclude,
  ErrorRouteInvalidMiddlewareType,
  ErrorRouteInvalidParent,
  ErrorRouteUnknownPosition
} from './errors';

export type Routers = {
  [K in Origami.Server.Position]: RouterListItem[]
};

export interface RouterListItem {
  handlers: RouterUseHandler;
  method: Origami.Server.Method;
}

export type RouterUseHandler = (Origami.Server.RequestHandler | string)[];

export * from './errors';
export class Route {
  public parent?: Route;
  public routers: Routers;
  public nested: Route[];

  private _url: string | null | RegExp;
  private _positions: Origami.Server.Position[];
  private _activeRouter: RouterListItem[];
  private _currentPosition: Origami.Server.Position = 'init';

  constructor(url: Origami.Server.URL = null, parent?: Route) {
    this._url = url;
    if (parent && !(parent instanceof Route)) throw new ErrorRouteInvalidParent();
    this.parent = parent;

    // Different positions to run route at
    this._positions = [
      'init',

      'pre-store',
      'store',
      'post-store',

      'pre-render',
      'render',
      'post-render',

      'pre-send'
    ];

    // A different array of middleware for each position
    this.routers = {
      init: [],

      'pre-store': [],
      store: [],
      'post-store': [],

      'pre-render': [],
      render: [],
      'post-render': [],

      'pre-send': []
    };


    // Default position is 'render'
    this.position('pre-render');


    this.nested = [];
    this._activeRouter = this.routers['post-store'];
  }


  // If the position is changed, update the activeRouter
  private set _position(v: Origami.Server.Position) {
    if (this._positions.includes(v)) this._activeRouter = this.routers[v];
    else throw new ErrorRouteUnknownPosition(v);
    this._currentPosition = v;
  }

  private get _position(): Origami.Server.Position {
    return this._currentPosition;
  }

  get url(): Origami.Server.URL {
    if (!this._url) {
      if (this.parent) return this.parent.url;
      else return null;
    }

    if (this._url instanceof RegExp) {
      if (this.parent && this.parent.url) return regexConcat(this.parent.url, this._url);
      else return this._url;
    }

    if (this.parent) {
      const pUrl = this.parent.url;
      if (!pUrl) return this._url;
      else if (pUrl instanceof RegExp) return regexConcat(pUrl, this._url);
      else return pUrl + this._url;
    }

    return this._url;
  }


  // Route methods
  public get(...handlers: RouterUseHandler): this {
    return this._route('GET', ...handlers);
  }
  public post(...handlers: RouterUseHandler): this {
    return this._route('POST', ...handlers);
  }
  public put(...handlers: RouterUseHandler): this {
    return this._route('PUT', ...handlers);
  }
  public delete(...handlers: RouterUseHandler): this {
    return this._route('DELETE', ...handlers);
  }
  public all(...handlers: RouterUseHandler): this {
    return this._route('USE', ...handlers);
  }
  public use(...handlers: RouterUseHandler): this {
    return this._route('USE', ...handlers);
  }

  // Change the position (active router)
  public position(position: Origami.Server.Position) {
    this._position = position;

    return this;
  }


  // Nest a Router under itself for recursive paths
  public route(p: Origami.Server.URL) {
    const r = new Route(p, this);
    r.position(this._position);
    this.nested.push(r);

    return r;
  }

  /**
   * Load all routers from a file or directory and nest them
   * @param p Path to file or directory
   * @param prefix Prefix the route
   * @param recursive If true, recursively nest routes
   */
  public async include(
    p: string,
    prefix: string | false = false,
    recursive: Boolean = true,
    throwErrors: boolean = true
  ): Promise<Route | Route[]> {

    const nest = (_p: string) => {
      const route = require(_p);
      if (route.constructor.name === 'Route') {
        if (prefix) {
          const parent = new Route(prefix, this);
          route.parent = parent;
          parent.nested.push(route);
          return parent;
        } else {
          route.parent = this;
          this.nested.push(route);
          return route;
        }
      }
      const e = new ErrorRouteFileNotRoute(_p);
      if (throwErrors) throw e;
      else warn(e);
    };

    let stat;
    try {
      stat = fs.statSync(p);
    } catch (e) {
      throw new ErrorRouteInvalidInclude(p);
    }

    // Load as file
    if (stat.isFile()) {
      return nest(p);

      // Treat as directory
    } else {
      const list = fs.readdirSync(p);
      const nested = (await Promise.all(
        list.map(async (i) => {
          const pathRel = path.resolve(p, i);
          const s = fs.statSync(pathRel);
          if (s.isFile() && /.*\.js$/.test(i)) return nest(pathRel);
          if (recursive && s.isDirectory()) {
            return this.include(
              pathRel,
              `${prefix || ''}/${i}`,
              recursive,
              throwErrors
            );
          }
          return false;
        })
      )).filter((r) => r);
      return flatten(nested);
    }
  }


  // Registers the activeRouter (set by position()) to handle on the url
  private _route(
    method: Origami.Server.Method,
    ...handlersOrNamedMW: RouterUseHandler
  ): this {
    this._validateHandlers(handlersOrNamedMW);
    this._activeRouter.push({
      handlers: handlersOrNamedMW,
      method
    });

    return this;
  }

  private _validateHandlers(handlersOrNamedMW: any[]) {
    handlersOrNamedMW.forEach((h) => {
      switch (typeof h) {
        case 'string':
        case 'function':
          return;
        default:
          throw new ErrorRouteInvalidMiddlewareType(typeof h);
      }
    });
  }
}

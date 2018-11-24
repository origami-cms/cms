import { Origami, Route } from '@origami/core-lib';
import pluralize from 'pluralize';

export type methods = 'get' | 'head' | 'post' | 'put' | 'delete' | 'list';
export type controllers = 'list' | 'create' | 'get' | 'update' | 'delete';

export interface ResourceOptions {
  model: Origami.Store.Schema;
  auth?: boolean | {
    [key in controllers]: boolean
  };
  controllers?: {
    [key in controllers]?: Origami.Server.RequestHandler
  };
}

const MW_SKIP: Origami.Server.RequestHandler = (req, res, next) => {
  next();
  return;
};
const MW_AUTH = 'auth';

export class Resource {
  public resourcePlural: string;
  public router: Route;
  public subRouter: Route;


  constructor(public resource: string, public store: any, public options: ResourceOptions) {
    this.resourcePlural = pluralize(resource);
    this.resource = pluralize.singular(resource);

    this.router = new Route(`/api/v1/${this.resourcePlural}`)
      .position('store');
    this.subRouter = this.router.route(`/:${this.resource}Id`)
      .position('store');

    if (options.auth === undefined) { options.auth = true; }


    (['get', 'post'] as methods[]).forEach((m) => {
      const rMethod = this.router[m as keyof Route] as Function;
      let cMethod = this[m as keyof Resource] as Function;
      let auth: Origami.Server.RequestHandler | string = options.auth ? MW_SKIP : MW_SKIP;

      switch (m) {
        case 'get':
          if (options.controllers) { cMethod = options.controllers.list || cMethod; }
          auth = this._auth('list');
          break;
        case 'post':
          if (options.controllers) { cMethod = options.controllers.create || cMethod; }
          auth = this._auth('create');
      }

      rMethod.bind(this.router)(
        auth,
        cMethod.bind(this)
      );
    });

    (['get', 'delete', 'put'] as methods[]).forEach((m) => {
      const rMethod = this.subRouter[m as keyof Route] as Function;
      let cMethod = this[m as keyof Resource] as Function;
      let auth: Origami.Server.RequestHandler | string = MW_AUTH;

      switch (m) {
        case 'get':
          if (options.controllers) { cMethod = options.controllers.get || cMethod; }
          auth = this._auth('get');
          break;
        case 'put':
          if (options.controllers) { cMethod = options.controllers.update || cMethod; }
          auth = this._auth('update');
          break;
        case 'delete':
          if (options.controllers) { cMethod = options.controllers.delete || cMethod; }
          auth = this._auth('delete');
      }


      rMethod.bind(this.subRouter)(
        auth,
        cMethod.bind(this)
      );
    });

    if (!this.store.models[resource]) { this.store.model(resource, options.model); }
  }

  /**
   * Get the ID of the request
   * @param req Request object
   */
  public id(req: Origami.Server.Request) {
    return req.params[`${this.resource}Id`];
  }


  public async get(
    req: Origami.Server.Request,
    res: Origami.Server.Response,
    next: Origami.Server.NextFunction
  ) {

    // If there is already data passed, skip
    if (res.locals.content.hasContent) {
      next();
      return;
    }

    let model;
    let resourceId;

    try {
      ({ model, resourceId } = await this._getModel(req, res));
    } catch (e) {
      if (next) {
        next(e);
        return;
      }
      throw e;
    }

    const filter = resourceId ? { id: resourceId } : null;

    const data = await model.find(filter);

    // If getting a single resource, and there is none, 404
    if (!data && resourceId) {
      next(new Error('resource.errors.notFound'));
      return;
    }

    res.locals.content.set(data);
    res.locals.responseCode = `resource.success.${resourceId ? 'foundOne' : 'foundList'}`;
    if (next) next();
  }


  public async post(
    req: Origami.Server.Request,
    res: Origami.Server.Response,
    next?: Origami.Server.NextFunction
  ) {
    try {
      const { model } = await this._getModel(req, res);
      res.locals.content.set(await model.create(req.body));
      res.locals.responseCode = 'resource.success.created';
    } catch (e) {
      if (next) {
        next(e);
        return;
      } else {
        throw e;
      }
    }
    if (next) next();
  }


  public async put(
    req: Origami.Server.Request,
    res: Origami.Server.Response,
    next: Origami.Server.NextFunction
  ) {
    try {
      const { model, resourceId } = await this._getModel(req, res);
      res.locals.content.set(await model.update(resourceId, req.body));
      res.locals.responseCode = 'resource.success.updated';
    } catch (e) {
      if (next) {
        next(e);
        return;
      }
      throw e;
    }
    if (next) next();
  }

  // TODO: Delete resource
  public async delete(
    req: Origami.Server.Request,
    res: Origami.Server.Response,
    next: Origami.Server.NextFunction
  ) {
    try {
      const { model, resourceId } = await this._getModel(req, res);

      try {
        await model.delete(resourceId);
        res.locals.content.clear();
        res.locals.responseCode = 'resource.success.deleted';
      } catch (e) {
        const [data] = e.data;
        if (data.rule === 'notFoundID' || data.rule === 'notFound') {
          res.locals.responseCode = 'resource.errors.notFound';
        }
      }
    } catch (e) {
      if (next) {
        next(e);
        return;
      }
      throw e;
    }

    if (next) next();
  }


  private async _getModel(req: Origami.Server.Request, res: Origami.Server.Response) {
    const resourceId = await this.id(req);
    const model = await res.app.get('store').model(this.resource);

    return { resourceId, model };
  }


  private _auth(type: controllers) {
    if (this.options.auth) {
      if (this.options.auth === true) { return MW_AUTH; }
      return !this.options.auth[type] ? MW_SKIP : MW_AUTH;
    }
    if (this.options.auth === false) { return MW_SKIP; }

    return MW_AUTH;
  }
}

// tslint:disable no-unused-expression
import 'jest-extended';
import path from 'path';
import {Route as BuildRoute} from '../../build/Route';
import { ErrorRouteFileNotRoute, ErrorRouteInvalidInclude, ErrorRouteInvalidMiddlewareType, ErrorRouteInvalidParent, ErrorRouteUnknownPosition, Route } from '../Route';
import { Origami } from '../types/Origami';

const POSITIONS: Origami.Server.Position[] = [
  'init',

  'pre-store',
  'store',
  'post-store',

  'pre-render',
  'render',
  'post-render',

  'pre-send'
];

const METHODS: (keyof Route)[] = [
  'get',
  'post',
  'put',
  'delete',
  'all',
  'use'
];

describe('core-lib.Route.constructor()', () => {
  it('should create a new Route', () => {
    const r = new Route();
    // @ts-ignore Testing private
    expect(r._url).toBeNull();
    expect(r.parent).toBeUndefined();
    expect(r.routers).toContainAllKeys([
      'init',

      'pre-store',
      'store',
      'post-store',

      'pre-render',
      'render',
      'post-render',

      'pre-send'
    ]);
    expect(r.nested).toBeArrayOfSize(0);
    // @ts-ignore Testing private
    expect(r._activeRouter).toBeArrayOfSize(0);
  });

  it('should create a new Route with a url', () => {
    const URL = '/foo';
    const r = new Route(URL);
    expect(r.url).toEqual(URL);
  });

  it('should create a new Route with a parent', () => {
    const parent = new Route();
    const r = new Route(null, parent);
    expect(r.parent).toEqual(parent);
  });

  it('should throw ErrorRouteInvalidParent for invalid parent', () => {
    try {
      // @ts-ignore Force error
      new Route(null, 'invalid');
    } catch (e) {
      expect(e).toBeInstanceOf(ErrorRouteInvalidParent);
    }
  });
});


describe('core-lib.Route.position()', () => {
  it('should start with position of "pre-render"', () => {
    const r = new Route();
    // @ts-ignore Testing private
    expect(r._position).toEqual('pre-render');
  });

  POSITIONS.forEach((p) => {
    it(`should be able to set position to '${p}'`, () => {
      const r = new Route();
      r.position(p);
      // @ts-ignore Testing private
      expect(r._position).toEqual(p);
    });
  });

  it('route.position() should return self (chaining)', () => {
    const r = new Route();
    expect(r.position('store')).toEqual(r);
  });

  it('route.position() can chain value', () => {
    const r = new Route()
      .position('store')
      .position('render');
    // @ts-ignore Testing private
    expect(r._position).toEqual('render');
  });

  it('should throw ErrorRouteUnknownPosition for unknown position', () => {
    try {
      // @ts-ignore Force error
      new Route().position('unknown');
    } catch (e) {
      expect(e).toBeInstanceOf(ErrorRouteUnknownPosition);
    }
  });

  it('should update the active router to add different middleware in different positions', () => {
    const r = new Route();
    expect(r.routers.store).toBeEmpty();
    expect(r.routers.render).toBeEmpty();
    expect(r.routers['pre-send']).toBeEmpty();
    r
      .position('store')
      .get(() => { })
      .position('render')
      .get(() => { })
      .get(() => { })
      .position('pre-send')
      .get(() => { });

    expect(r.routers.store).toBeArrayOfSize(1);
    expect(r.routers.render).toBeArrayOfSize(2);
    expect(r.routers['pre-send']).toBeArrayOfSize(1);
  });
});


describe('core-lib.Route.url', () => {
  it('should have correct string url', () => {
    const URL = '/foo';
    const r = new Route(URL);
    expect(r.url).toEqual(URL);
  });

  it('should have correct regex url', () => {
    const URL = /\/foo/;
    const r = new Route(URL);
    expect(r.url).toEqual(URL);
  });

  it('should have correct string url with parent url as string and route url as string', () => {
    const r = new Route('/bar', new Route('/foo'));
    expect(r.url).toEqual('/foo/bar');
  });

  it('should have correct regex url with parent url as regex and route url as string', () => {
    const r = new Route('/bar', new Route(/\/foo/));
    expect(r.url).toEqual(/\/foo\/bar/);
  });

  it('should have correct regex url with parent url as regex and route url as regex', () => {
    const r = new Route(/\/bar/, new Route(/\/foo/));
    expect(r.url).toEqual(/\/foo\/bar/);
  });

  it('should have correct regex url with parent url as string and route url as regex', () => {
    const r = new Route(/\/bar/, new Route('/foo'));
    expect(r.url).toEqual(/\/foo\/bar/);
  });

  it('should return parent url if no route url is provided', () => {
    const r1 = new Route(null, new Route('/foo'));
    const r2 = new Route(null, new Route(/\/foo/));
    expect(r1.url).toEqual('/foo');
    expect(r2.url).toEqual(/\/foo/);
  });

  it('should route url if no parent url is provided', () => {
    const r1 = new Route('/foo', new Route());
    const r2 = new Route(/\/foo/, new Route());
    expect(r1.url).toEqual('/foo');
    expect(r2.url).toEqual(/\/foo/);
  });
});


METHODS.forEach((m) => {
  let method = m.toUpperCase();
  if (method === 'ALL') method = 'USE';

  describe(`core-lib.Route.${m}()`, () => {
    it(`should add ${m} handler to the active router`, () => {
      const r = new Route().position('store');
      const mw = () => { };
      (r[m] as Function)(mw);
      expect(r.routers.store).toBeArrayOfSize(1);
      expect(r.routers.store).toContainValue({ handlers: [mw], method });
    });
    it(`should add multiple ${m} handlers to the active router`, () => {
      const r = new Route().position('store');
      const mw1 = () => { };
      const mw2 = () => { };
      (r[m] as Function)(mw1);
      (r[m] as Function)(mw2);
      expect(r.routers.store).toBeArrayOfSize(2);
      expect(r.routers.store).toContainAllValues([
        { handlers: [mw1], method },
        { handlers: [mw2], method }
      ]);
    });
    it(`should add multiple ${m} handlers to multiple positions`, () => {
      const r = new Route();
      const mw1 = () => { };
      const mw2 = () => { };
      r.position('render');
      (r[m] as Function)(mw1);
      r.position('init');
      (r[m] as Function)(mw2);

      expect(r.routers.init).toBeArrayOfSize(1);
      expect(r.routers.init).toContainValue({ handlers: [mw2], method });
      expect(r.routers.render).toBeArrayOfSize(1);
      expect(r.routers.render).toContainValue({ handlers: [mw1], method });
    });
    it(`should add named middleware ${m} handlers`, () => {
      const r = new Route();
      r.position('render');
      (r[m] as Function)('compile');
      r.position('init');
      (r[m] as Function)('auth');

      expect(r.routers.init).toBeArrayOfSize(1);
      expect(r.routers.init).toContainValue({ handlers: ['auth'], method });
      expect(r.routers.render).toBeArrayOfSize(1);
      expect(r.routers.render).toContainValue({ handlers: ['compile'], method });
    });
    it(`should add multiple middleware to the same ${m} handler`, () => {
      const r = new Route();
      r.position('render');
      const mw1 = () => { };
      (r[m] as Function)('compile', mw1);
      r.position('init');
      const mw2 = () => { };
      (r[m] as Function)('auth', mw2);

      expect(r.routers.init).toBeArrayOfSize(1);
      expect(r.routers.init).toContainValue({ handlers: ['auth', mw2], method });
      expect(r.routers.render).toBeArrayOfSize(1);
      expect(r.routers.render).toContainValue({ handlers: ['compile', mw1], method });
    });
    it(`should throw ErrorRouteInvalidMiddlewareType for invalid ${m} handler`, () => {
      try {
        const r = new Route();
        (r[m] as Function)(123);
      } catch (e) {
        expect(e).toBeInstanceOf(ErrorRouteInvalidMiddlewareType);
      }
    });
    it(`route.${m}() should return self (chaining)`, () => {
      const r = new Route();
      expect((r[m] as Function)(() => { })).toEqual(r);
    });
  });
});


describe(`core-lib.Route.route()`, () => {
  it(`should nest a route`, () => {
    const urlParent = '/parent';
    const urlNested = '/nested';
    const r = new Route(urlParent);
    const nested = r.route(urlNested);

    expect(r.nested).toBeArrayOfSize(1);
    expect(r.nested[0]).toEqual(nested);
    expect(r.nested[0].url).toEqual(urlParent + urlNested);
    expect(r.nested[0].parent).toEqual(r);
  });

  it(`should nest a route at the current position`, () => {
    const r1 = new Route().position('init').route(null);
    const r2 = new Route().position('render').route(null);
    const parent = new Route()
      .position('init')
      .route(null).parent!
      .position('render')
      .route(null).parent!;

    // @ts-ignore Testing private
    expect(r1._position).toEqual('init');
    // @ts-ignore Testing private
    expect(r2._position).toEqual('render');
    // @ts-ignore Testing private
    expect(parent.nested[0]._position).toEqual('init');
    // @ts-ignore Testing private
    expect(parent.nested[1]._position).toEqual('render');
  });
});


describe(`core-lib.Route.include()`, () => {
  const routes = path.resolve(__dirname, './__mocks__/routes/');
  it(`should return a promise`, () => {
    const r = new Route();
    const promise = r.include(path.resolve(routes, 'r1.js'));
    expect(promise).toBeInstanceOf(Promise);
  });

  it(`should include a route from file`, async () => {
    const r = new Route();
    const nested = (await r.include(path.resolve(routes, 'r1.js'))) as Route;
    expect(r.nested).toBeArrayOfSize(1);
    expect(r.nested).toContain(nested);
    expect(r.nested[0]).toEqual(nested);
    expect(nested.url).toEqual('/r1');
  });

  it(`should throw ErrorRouteFileNotRoute from invalid file`, async () => {
    try {
      const r = new Route();
      await r.include(path.resolve(routes, 'invalid.js'));
    } catch (e) {
      expect(e).toBeInstanceOf(ErrorRouteFileNotRoute);
    }
  });

  it('should include routes from a directory without recursion', async () => {
    const r = new Route();
    const nested = (await r.include(routes, false, false, false)) as Route[];
    expect(nested).toBeArrayOfSize(1);
    expect(nested[0]).toBeInstanceOf(BuildRoute);
    expect(nested[0].url).toEqual('/r1');
  });

  it('should throw ErrorRouteFileNotRoute from file in directory', async () => {
    try {
      const r = new Route();
      await r.include(routes);
    } catch (e) {
      expect(e).toBeInstanceOf(ErrorRouteFileNotRoute);
    }
  });

  it('should include routes from a directory recursively', async () => {
    const r = new Route();
    const nested = (await r.include(routes, false, true, false)) as Route[];

    expect(nested).toBeArrayOfSize(2);
    expect(nested[0].url).toEqual('/nested');
    expect(nested[0].nested).toBeArrayOfSize(1);
    expect(nested[0].nested[0].url).toEqual('/nested/r2');
    expect(nested[1].url).toEqual('/r1');
  });

  it('should include routes from a directory recursively with prefix', async () => {
    const r = new Route();
    const nested = (await r.include(routes, '/prefix', true, false)) as Route[];

    expect(nested).toBeArrayOfSize(2);
    expect(nested[0].url).toEqual('/prefix/nested');
    expect(nested[0].nested).toBeArrayOfSize(1);
    expect(nested[0].nested[0].url).toEqual('/prefix/nested/r2');
    expect(nested[1].url).toEqual('/prefix');
    expect(nested[1].nested[0].url).toEqual('/prefix/r1');
  });

  it('should throw ErrorRouteInvalidInclude for unknown include', async () => {
    try {
      const r = new Route();
      await r.include('./123');
    } catch (e) {
      expect(e).toBeInstanceOf(ErrorRouteInvalidInclude);
    }
  });
});

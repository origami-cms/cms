import { Route } from '@origami/core-lib';
import { Server as HTTPServer } from 'http';
import { NOT_FOUND } from 'http-status-codes';
import 'jest-extended';
import path from 'path';
import { check } from 'tcp-port-used';
import { storeRemove, TestServer } from '../../../../lib/testing';
import { ErrorServerExistingNamedMiddleware, ErrorServerPluginNotFunction, ErrorServerPortInUse, ErrorServerStoreNotConfigured, ErrorServerUnknownNamedMiddleware, ErrorServerUnknownPlugin } from '../errors';
import { App } from '../lib/App';
import { Server } from '../server';


describe('core-server.Server.constructor()', async () => {
  process.chdir(path.resolve(__dirname, '__mocks__'));

  it('should setup server with default options', async () => {
    const s = await (new TestServer()).init({ port: 8080 });
    expect(s.app).toBeFunction();
    // @ts-ignore Testing private
    expect(s._options).toMatchObject({
      port: 8080,
      ln: 'enUS',
      secret: 'secret'
    });
    // @ts-ignore Testing private
    expect(s._positionRouters).toContainAllKeys([
      'init',
      'pre-store',
      'store',
      'post-store',

      'pre-render',
      'render',
      'post-render',

      'pre-send'
    ]);
  });

  it('should setup server with port assigned from process.env.PORT', async () => {
    const port = 9999;
    process.env.PORT = port.toString();
    const s = await (new TestServer()).init();
    // @ts-ignore Testing private
    expect(s._options.port).toEqual(port);
    delete process.env.PORT;
  });

  it('should setup server with static default', async () => {
    const ts = new TestServer();
    await ts.init();
    await ts.serve();
    const res = await ts.request('/test.txt');
    expect(res.trim()).toEqual('Hello');
    await ts.stop();
  });

  it('should setup server with static set to true', async () => {
    const ts = new TestServer();
    await ts.init({ static: true });
    await ts.serve();
    const res = await ts.request('/test.txt');
    expect(res.trim()).toEqual('Hello');
    await ts.stop();
  });

  it('should skip setup with static set to false', async () => {
    const ts = new TestServer();
    await ts.init({ static: false });
    await ts.serve();
    try { await ts.request('/test.txt', true); } catch (e) {
      ts.expectError(e, 'Not found', NOT_FOUND);
    }
    await ts.stop();
  });

  it('should setup server with custom static', async () => {
    process.chdir(path.resolve(__dirname, '__mocks__'));
    const ts = new TestServer();
    await ts.init({
      static: 'custom-public'
    });
    await ts.serve();
    const res = await ts.request('/foo.txt');
    expect(res.trim()).toEqual('Bar');
    await ts.stop();
  });

  it('should setup server with multiple static directories', async () => {
    process.chdir(path.resolve(__dirname, '__mocks__'));
    const ts = new TestServer();
    await ts.init({
      static: ['public', 'custom-public']
    });
    await ts.serve();
    const res1 = await ts.request('/test.txt');
    expect(res1.trim()).toEqual('Hello');
    const res2 = await ts.request('/foo.txt');
    expect(res2.trim()).toEqual('Bar');
    await ts.stop();
  });
});


describe('core-server.Server.serve()', async () => {
  it('should run the server on the default port', async () => {
    const port = 8080;
    const s = await (new TestServer()).init({ port });
    expect(await check(port)).toBeFalse();
    await s.serve();
    // @ts-ignore Testing private
    expect(s._server).toBeInstanceOf(HTTPServer);
    expect(await check(port)).toBeTrue();
    s.stop();
    expect(await check(port)).toBeFalse();
  });

  it('should run the server on a specific port from config', async () => {
    const port = 9999;
    const ts = new TestServer();
    await ts.init({ port });
    expect(await check(port)).toBeFalse();
    await ts.serve();
    expect(await check(port)).toBeTrue();
    ts.stop();
    expect(await check(port)).toBeFalse();
  });

  it('should run the server on a specific port from process.env.PORT', async () => {
    const PORT = 9998;
    process.env.PORT = PORT.toString();
    const ts = new TestServer();
    await ts.init({ port: PORT });
    expect(await check(PORT)).toBeFalse();
    await ts.serve();
    expect(await check(PORT)).toBeTrue();
    ts.stop();
    expect(await check(PORT)).toBeFalse();
    delete process.env.PORT;

  });

  it('should throw ErrorServerPortInUse when the port is already taken', async () => {
    const s1 = new Server();
    const s2 = new Server();
    await s1.serve();

    try {
      await s2.serve();
    } catch (e) {
      expect(e).toBeInstanceOf(ErrorServerPortInUse);
    }

    s1.stop();
  });
});


describe('core-server.Server.useRouter()', async () => {
  beforeEach(() => process.chdir(__dirname));
  it('should add routes into the server', async () => {
    const PATH1 = '/';
    const PATH2 = '/2';
    const s = await (new TestServer()).init();
    const r1 = new Route(PATH1).get(() => { });
    const r2 = new Route(PATH2)
      .get(() => { })
      .post(() => { });

    expect(s.getMiddlewareForPath(PATH1)).toBeArrayOfSize(0);
    await s.useRouter(r1);
    expect(s.getMiddlewareForPath(PATH1)).toBeArrayOfSize(1);

    expect(s.getMiddlewareForPath(PATH2)).toBeArrayOfSize(0);
    await s.useRouter(r2);
    expect(s.getMiddlewareForPath(PATH2)).toBeArrayOfSize(2);
  });

  it('should add routes at the right position', async () => {
    const PATH = '/';
    const s = await (new TestServer()).init();
    const r1 = new Route(PATH).position('init').get(() => { });
    const r2 = new Route(PATH).position('store').get(() => { });
    const r3 = new Route(PATH).position('render').get(() => { });


    expect(s.getMiddlewareForPath(PATH)).toBeArrayOfSize(0);
    // @ts-ignore Testing private
    expect(s._positionRouters.init.stack).toBeArrayOfSize(0);
    await s.useRouter(r1);
    expect(s.getMiddlewareForPath(PATH)).toBeArrayOfSize(1);
    // @ts-ignore Testing private
    expect(s._positionRouters.init.stack).toBeArrayOfSize(1);


    // @ts-ignore Testing private
    expect(s._positionRouters.store.stack).toBeArrayOfSize(0);
    await s.useRouter(r2);
    // @ts-ignore Testing private
    expect(s._positionRouters.store.stack).toBeArrayOfSize(1);


    // @ts-ignore Testing private
    expect(s._positionRouters.render.stack).toBeArrayOfSize(0);
    await s.useRouter(r3);
    expect(s.getMiddlewareForPath(PATH)).toBeArrayOfSize(3);
    // @ts-ignore Testing private
    expect(s._positionRouters.render.stack).toBeArrayOfSize(1);
  });

  it('should add nested routes', async () => {
    const PATH1 = '/foo';
    const PATH2 = '/bar';
    const PATH3 = '/wiz';
    const s = await (new TestServer()).init();
    const r1 = new Route(PATH1).get(() => { });
    r1
      .route(PATH2)
      .get(() => { })
      .post(() => { })
      .route(PATH3)
      .get(() => { })
      .post(() => { })
      .delete(() => { });


    expect(s.getMiddlewareForPath(PATH1)).toBeArrayOfSize(0);
    s.useRouter(r1);
    expect(s.getMiddlewareForPath(PATH1)).toBeArrayOfSize(1);
    expect(s.getMiddlewareForPath(PATH1 + PATH2)).toBeArrayOfSize(2);
    expect(s.getMiddlewareForPath(PATH1 + PATH2 + PATH3)).toBeArrayOfSize(3);
  });

  it('should add routes with named middleware', async () => {
    const PATH1 = '/foo';
    const PATH2 = '/bar';
    const PATH3 = '/wiz';
    const s = await (new TestServer()).init();
    s.namedMiddleware('auth', async () => { });
    s.namedMiddleware('render', async () => { });

    const r1 = new Route(PATH1).get('auth');
    const r2 = new Route(PATH2).get('auth', async () => { });
    const r3 = new Route(PATH3).get('auth', 'render', async () => { });

    expect(s.getMiddlewareForPath(PATH1)).toBeArrayOfSize(0);
    s.useRouter(r1);
    expect(s.getMiddlewareForPath(PATH1)).toBeArrayOfSize(1);

    expect(s.getMiddlewareForPath(PATH2)).toBeArrayOfSize(0);
    s.useRouter(r2);
    expect(s.getMiddlewareForPath(PATH2)).toBeArrayOfSize(2);

    expect(s.getMiddlewareForPath(PATH3)).toBeArrayOfSize(0);
    s.useRouter(r3);
    expect(s.getMiddlewareForPath(PATH3)).toBeArrayOfSize(3);
  });

  it('should add routes with named middleware', async () => {
    const PATH1 = '/foo';
    const PATH2 = '/bar';
    const PATH3 = '/wiz';
    const s = await (new TestServer()).init();
    s.namedMiddleware('auth', async () => { });
    s.namedMiddleware('render', async () => { });

    const r1 = new Route(PATH1).get('auth');
    const r2 = new Route(PATH2).get('auth', async () => { });
    const r3 = new Route(PATH3).get('auth', 'render', async () => { });

    expect(s.getMiddlewareForPath(PATH1)).toBeArrayOfSize(0);
    s.useRouter(r1);
    expect(s.getMiddlewareForPath(PATH1)).toBeArrayOfSize(1);

    expect(s.getMiddlewareForPath(PATH2)).toBeArrayOfSize(0);
    s.useRouter(r2);
    expect(s.getMiddlewareForPath(PATH2)).toBeArrayOfSize(2);

    expect(s.getMiddlewareForPath(PATH3)).toBeArrayOfSize(0);
    s.useRouter(r3);
    expect(s.getMiddlewareForPath(PATH3)).toBeArrayOfSize(3);
  });

  it('should throw ErrorServerUnknownNamedMiddleware for unknown named middleware', async () => {
    const mw = 'auth';
    const s = await (new TestServer()).init();
    try {
      s.useRouter(new Route().get(mw));
    } catch (e) {
      expect(e).toBeInstanceOf(ErrorServerUnknownNamedMiddleware);
    }
  });
});


describe('core-server.Server.plugin()', async () => {
  beforeEach(() => process.chdir(__dirname));

  it('server should start with no plugins', async () => {
    const s = await (new TestServer()).init();
    expect(s.plugins).toBeEmpty();
  });

  it('should load a relative plugin', async () => {
    const plugin = './__mocks__/plugins/plugin.js';
    const s = await (new TestServer()).init();
    const pluginPromise = s.plugin(plugin);
    expect(pluginPromise).toBeInstanceOf(Promise);
    const res = await pluginPromise;
    expect(res).toBeTrue();
    expect(s.plugins).toContainKey(plugin);
    expect(s.plugins[plugin]).toBeTrue();
  });

  it('should load a es6 module plugin', async () => {
    const plugin = './__mocks__/plugins/es6.js';
    const s = await (new TestServer()).init();
    await s.plugin(plugin);
    expect(s.plugins).toContainKey(plugin);
    expect(s.plugins[plugin]).toBeTrue();
  });

  it('should not load a relative plugin with false setting', async () => {
    const plugin = './__mocks__/plugins/plugin.js';
    const s = await (new TestServer()).init();
    const pluginPromise = s.plugin(plugin, false);
    expect(pluginPromise).toBeInstanceOf(Promise);
    const res = await pluginPromise;
    expect(res).toBeFalse();
    expect(s.plugins).not.toContainKey(plugin);
  });

  it('should load a relative plugin with options', async () => {
    process.env.TEST_VAR = 'false';
    const plugin = './__mocks__/plugins/plugin.js';
    const settings = { TEST_VAR: process.env.TEST_VAR };
    const s = await (new TestServer()).init();
    const res = await s.plugin(plugin, settings);
    expect(res).toBeTrue();
    expect(s.plugins).toContainKey(plugin);
    expect(s.plugins[plugin]).toEqual(settings);
    expect(process.env.TEST_VAR).toEqual(settings.TEST_VAR);
  });

  it('should throw ErrorServerPluginNotFunction when plugin does not export a function', async () => {
    const plugin = './__mocks__/plugins/invalid.js';
    const s = await (new TestServer()).init();
    try {
      await s.plugin(plugin);
    } catch (e) {
      expect(e).toBeInstanceOf(ErrorServerPluginNotFunction);
    }
  });

  it('should throw ErrorServerUnknownPlugin when plugin cannot be found', async () => {
    const plugin = './__mocks__/plugins/unknown.js';
    const s = await (new TestServer()).init();
    try {
      await s.plugin(plugin);
    } catch (e) {
      expect(e).toBeInstanceOf(ErrorServerUnknownPlugin);
    }
  });
});


describe('core-server.Server.application()', async () => {
  it('server should start with no apps', async () => {
    const s = await (new TestServer()).init();
    expect(s.apps).toBeEmpty();
  });

  it('should setup an app', async () => {
    const appLocation = './__mocks__/app';
    const s = await (new TestServer()).init();
    const appPromise = s.application(appLocation);
    expect(appPromise).toBeInstanceOf(Promise);
    // @ts-ignore
    const app = (await appPromise) as App.App;

    expect(app.constructor.name).toEqual('App');
    expect(s.apps).toContainKey(app.appName as string);
    expect(s.apps[app.appName as string].constructor.name).toEqual('App');
  });

  it('should not setup app with false setting', async () => {
    const app = './__mocks__/app';
    const s = await (new TestServer()).init();
    const appPromise = s.application(app, false);
    expect(appPromise).toBeInstanceOf(Promise);
    const res = await appPromise;
    expect(res).toBeFalse();
    expect(s.plugins).not.toContainKey(app);
  });
});


describe('core-server.Server.resource()', async () => {
  it('server should start with no resources', async () => {
    const s = await (new TestServer()).init();
    expect(s.resources).toBeEmpty();
  });

  it('should setup a resource', async () => {
    const model = require('./__mocks__/resources/cat.js');
    const resourceName = 'cat';
    const s = await (new TestServer()).init({}, true);
    await s.plugin('auth');

    const resource = s.resource(resourceName, { model });
    expect(resource.constructor.name).toEqual('Resource');
    expect(s.resources).toContainKey(resourceName);
    expect(s.resources[resourceName].constructor.name).toEqual('Resource');
    storeRemove();
  });

  it('should setup a resource with default auth', async () => {
    const model = require('./__mocks__/resources/cat.js');
    const resourceName = 'cat';
    const s = await (new TestServer()).init(undefined, true, ['auth']);

    s.resource(resourceName, { model });
    expect(s.resources[resourceName].options.auth).toBeTrue();
    storeRemove();
  });

  it('throw ErrorServerStoreNotConfigured when no store is configured', async () => {
    const model = require('./__mocks__/resources/cat.js');
    const resourceName = 'cat';
    const s = await (new TestServer()).init(undefined, false, ['auth']);
    try {
      s.resource(resourceName, { model });
    } catch (e) {
      expect(e).toBeInstanceOf(ErrorServerStoreNotConfigured);
    }
  });
});


describe('core-server.Server.namedMiddleware()', async () => {
  it('server should start with no named middleware', async () => {
    const s = await (new TestServer()).init();
    // @ts-ignore Testing private
    expect(s._namedMiddleware).toBeEmpty();
  });

  it('server should load named middleware', async () => {
    const s = await (new TestServer()).init();
    const mwName = 'test';
    s.namedMiddleware(mwName, async () => { });
    // @ts-ignore Testing private
    expect(s._namedMiddleware).toContainKey(mwName);
    // @ts-ignore Testing private
    expect(s._namedMiddleware[mwName]).toBeFunction();
    expect(s.getNamedMiddleware(mwName)).toBeFunction();
  });

  it('server should throw error for existing middleware', async () => {
    const s = await (new TestServer()).init();
    const mwName = 'test';
    s.namedMiddleware(mwName, async () => { });
    try {
      s.namedMiddleware(mwName, async () => { });
    } catch (e) {
      expect(e).toBeInstanceOf(ErrorServerExistingNamedMiddleware);
    }
  });
});

describe('core-server.Server.getNamedMiddleware()', async () => {
  it('should return all named middleware if no name is provided getNamedMiddleware()', async () => {
    const s = await (new TestServer()).init();
    expect(s.getNamedMiddleware()).toBeEmpty();
    s.namedMiddleware('1', async () => { });
    s.namedMiddleware('2', async () => { });
    s.namedMiddleware('3', async () => { });
    expect(s.getNamedMiddleware()).toContainAllKeys(['1', '2', '3']);
  });

  it('should return one if provided name is string getNamedMiddleware(string)', async () => {
    const s = await (new TestServer()).init();
    expect(s.getNamedMiddleware()).toBeEmpty();

    const mw1 = () => { };
    const mw2 = () => { };
    const mw3 = () => { };
    s.namedMiddleware('1', mw1);
    s.namedMiddleware('2', mw2);
    s.namedMiddleware('3', mw3);

    expect(s.getNamedMiddleware('1')).toEqual(mw1);
    expect(s.getNamedMiddleware('2')).toEqual(mw2);
    expect(s.getNamedMiddleware('3')).toEqual(mw3);
  });

  it('should return multiple if provided name is regex getNamedMiddleware(regexp)', async () => {
    const s = await (new TestServer()).init();
    expect(s.getNamedMiddleware()).toBeEmpty();

    const mw1 = () => { };
    const mw2 = () => { };
    const mw3 = () => { };
    s.namedMiddleware('mw-foo-bar', mw1);
    s.namedMiddleware('mw-foo-fiz', mw2);
    s.namedMiddleware('fiz-another', mw3);

    expect(s.getNamedMiddleware(/mw/)).toMatchObject({ 'mw-foo-bar': mw1, 'mw-foo-fiz': mw2 });
    expect(s.getNamedMiddleware(/fiz/)).toMatchObject({ 'mw-foo-fiz': mw2, 'fiz-another': mw3 });
    expect(s.getNamedMiddleware(/another/)).toMatchObject({ 'fiz-another': mw3 });
  });

  it('server should return false for unknown middleware', async () => {
    const s = await (new TestServer()).init();
    expect(s.getNamedMiddleware('unknown')).toBeFalse();
  });
});


describe('core-server.Server.getMiddlewareForPath()', async () => {
  it('should return array of handlers', async () => {
    const s = await (new TestServer()).init();
    const r = new Route('/').get(() => { });
    s.useRouter(r);
    expect(s.getMiddlewareForPath('/')).toBeArrayOfSize(1);
  });
});

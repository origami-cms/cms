import fs from 'fs';
import 'jest-extended';
import path from 'path';
import { storeRemove, TestServer } from '../../../../lib/testing';
import { ErrorServerPluginNotFunction } from '../../../core-server/src/errors';
import { config, ErrorResourceNotFound } from '../configFile';
import { Origami } from '../types/Origami';

describe('core-lib.configFile.env', () => {
  let OLD_ENV: NodeJS.ProcessEnv;

  beforeAll(() => OLD_ENV = process.env);

  beforeEach(() => {
    jest.resetModules(); // this is important
    process.env = { ...OLD_ENV };
    delete process.env.NODE_ENV;
  });

  afterEach(() => process.env = OLD_ENV);

  it('should return an empty config', () => {
    const c = config.env({});
    expect(c).toBeObject();
    expect(c).toBeEmpty();
  });

  it('should default to empty object for no parameters', () => {
    const c = config.env();
    expect(c).toBeObject();
    expect(c).toBeEmpty();
  });

  it('should return the same config', () => {
    const input = {
      apps: {},
      plugins: {}
    };
    const c = config.env(input);
    expect(c).toBeObject();
    expect(c).toContainAllKeys(Object.keys(input));
    expect(c).toContainAllValues(Object.values(input));
  });

  it('should return the same config', () => {
    const input = {
      apps: {},
      plugins: {}
    };
    const c = config.env(input);
    expect(c).toBeObject();
    expect(c).toContainAllKeys(Object.keys(input));
    expect(c).toContainAllValues(Object.values(input));
  });

  it('should insert options from process.env (ORIGAMI_STORE_TYPE)', () => {
    const type = 'mongodb';
    process.env.ORIGAMI_STORE_TYPE = type;
    const input = {
      apps: {},
      plugins: {}
    };
    const c = config.env(input);

    expect(c).toBeObject();
    expect(c.store).toBeObject();
    expect(c.store!.type).toBeString();
    expect(c.store!.type).toEqual(type);
  });

  it('should insert options from multiple process.env', () => {
    const type = 'postgres';
    const serverStatic = './public';
    process.env.ORIGAMI_STORE_TYPE = type;
    process.env.ORIGAMI_SERVER_STATIC = serverStatic;
    const c = config.env({
      apps: {},
      plugins: {}
    });

    expect(c).toBeObject();

    expect(c.store).toBeObject();
    expect(c.store!.type).toBeString();
    expect(c.store!.type).toEqual(type);

    expect(c.server).toBeObject();
    expect(c.server!.static).toBeString();
    expect(c.server!.static).toEqual(serverStatic);
  });


  it('removes local alias from paths ("/path/to/plugin:withAlias" => "/path/to/plugin")', () => {
    const alias = 'withAlias';
    const _path = '/path/to/plugin';
    const c = config.env({
      plugins: { [`${_path}:${alias}`]: true }
    });

    expect(c).toBeObject();
    expect(c.plugins).toBeObject();
    expect(c.plugins).toContainKey(_path);
    expect(c.plugins![_path]).toEqual(true);
  });

  it('overrides process.env variables to local alias ("/path/to/plugin:withAlias")', () => {
    const alias = 'withAlias';
    const _path = '/path/to/plugin';

    process.env.ORIGAMI_PLUGINS_WITHALIAS_FOO = 'bar';
    const c = config.env({
      plugins: {
        [`${_path}:${alias}`]: {}
      }
    });

    expect(c).toBeObject();
    expect(c.plugins).toBeObject();
    expect(c.plugins).toContainKey(_path);
    expect(c.plugins![_path]).toEqual({ foo: 'bar' });
  });

  it('imports .env file', () => {
    process.chdir(path.join(__dirname, '__mocks__/env'));

    const c = config.env({});

    expect(c).toBeObject();
    expect(c.store).toBeObject();
    expect(c.store!.type).toBeString();
    expect(c.store!.type).toEqual('mongodb');
  });

  it('overrides .env file with process.env', () => {
    process.chdir(path.join(__dirname, '__mocks__/env'));
    const type = 'mongodb';
    process.env.ORIGAMI_STORE_TYPE = type;

    const c = config.env({});

    expect(c).toBeObject();
    expect(c.store).toBeObject();
    expect(c.store!.type).toBeString();
    expect(c.store!.type).toEqual(type);
  });
});


describe('core-lib.configFile.read', () => {
  it('should return false if no .origami file in directory', async () => {
    const cPromise = config.read();
    expect(cPromise).toBeInstanceOf(Promise);
    const c = await cPromise;
    expect(c).toEqual(false);
  });

  it('should load .origami by default', async () => {
    process.chdir(path.resolve(__dirname, '__mocks__/config'));
    const cPromise = config.read();
    expect(cPromise).toBeInstanceOf(Promise);
    const c = await cPromise as Origami.Config;
    expect(c).toBeObject();
    expect(c).toHaveProperty('apps');
    expect(c.apps).toBeObject();
    expect(c.apps).toBeEmpty();
  });

  it('should load .origami by passing in directory', async () => {
    const cPromise = config.read(path.resolve(__dirname, '__mocks__/config'));
    expect(cPromise).toBeInstanceOf(Promise);
    const c = await cPromise as Origami.Config;
    expect(c).toBeObject();
    expect(c).toHaveProperty('apps');
    expect(c.apps).toBeObject();
    expect(c.apps).toBeEmpty();
  });

  it('should load .origami by passing in file', async () => {
    const cPromise = config.read(path.resolve(__dirname, '__mocks__/config/.origami.2'));
    expect(cPromise).toBeInstanceOf(Promise);
    const c = await cPromise as Origami.Config;
    expect(c).toBeObject();
    expect(c).toHaveProperty('plugins');
    expect(c.plugins).toBeObject();
    expect(c.plugins).toBeEmpty();
  });

  it('should return false when trying to load non-existent file', async () => {
    const c = await config.read(path.resolve(__dirname, '__mocks__/config/.origami.3'));
    expect(c).toEqual(false);
  });

  it('should return false when trying to load non-existent file in directory', async () => {
    const c = await config.read(path.resolve(__dirname));
    expect(c).toEqual(false);
  });

  it('should throw error when trying to load invalid file', async () => {
    const read = async () =>
      config.read(path.resolve(__dirname, '__mocks__/config/.origami.invalid'));

    await expect(read()).rejects.toMatchObject({ name: 'SyntaxError' });
  });
});


describe('core-lib.configFile.write', () => {

  it('should write a .origami file to ./', async () => {
    const data = { apps: {} };
    process.chdir(__dirname);
    delete process.env.CLI_CWD;

    await config.write(data);
    const c = path.join(__dirname, '.origami');
    const written = JSON.parse(fs.readFileSync(c).toString());
    expect(written).toMatchObject(data);
    fs.unlinkSync(c);
  });

  it('should write a .origami file to the process.env.CLI_CWD', async () => {
    const data = { apps: {} };
    process.chdir(__dirname);
    process.env.CLI_CWD = __dirname;

    await config.write(data);
    const c = path.join(__dirname, '.origami');
    const written = JSON.parse(fs.readFileSync(c).toString());
    expect(written).toMatchObject(data);
    fs.unlinkSync(c);
  });
});


describe('core-lib.configFile.setupPlugins', () => {
  it('should setup no plugins with empty config', async () => {
    const s = await (new TestServer()).init();
    const setupPromise = config.setupPlugins({}, s);
    expect(setupPromise).toBeInstanceOf(Promise);
    const setup = await setupPromise;
    expect(s.plugins).toBeObject();
    expect(s.plugins).toBeEmpty();
    expect(setup).toEqual(false);
  });

  it('should setup plugins with true value', async () => {
    const s = await (new TestServer()).init({}, false, ['auth']);
    const plugins = {
      favicon: true,
      media: { provider: 'filesystem' }
    };
    const setupPromise = config.setupPlugins({ plugins }, s);
    expect(setupPromise).toBeInstanceOf(Promise);
    await setupPromise;

    expect(s.plugins).toBeObject();
    expect(s.plugins).toMatchObject(plugins);
  });

  it('should setup skip plugins with false value', async () => {
    const s = await (new TestServer()).init({}, false, ['auth']);
    const plugins = {
      favicon: false,
      media: { provider: 'filesystem' }
    };
    const setupPromise = config.setupPlugins({ plugins }, s);
    expect(setupPromise).toBeInstanceOf(Promise);
    await setupPromise;

    expect(s.plugins).toBeObject();
    expect(s.plugins).not.toMatchObject({ favicon: false });
    expect(s.plugins).not.toContainKey('favicon');
    expect(s.plugins).toMatchObject({ media: { provider: 'filesystem' } });
  });

  it('should throw error when trying to load unknown plugin', async () => {
    const plugin = 'unknown';
    try {
      const setup = async () => {
        const s = await (new TestServer()).init();
        const plugins = { [plugin]: true };
        await config.setupPlugins({ plugins }, s);
      };
      await setup();
    } catch (e) {
      expect(e).toMatchObject({
        namespace: 'Server',
        name: 'UnknownPlugin',
        message: `Could not load plugin '${plugin}'`
      });
    }
  });
});


describe('core-lib.configFile.setupApps', () => {
  it('should setup no apps with empty config', async () => {
    const s = await (new TestServer()).init();
    const setupPromise = config.setupApps({}, s);
    expect(setupPromise).toBeInstanceOf(Promise);
    const setup = await setupPromise;
    expect(s.apps).toBeObject();
    expect(s.apps).toBeEmpty();
    expect(setup).toEqual(false);
  });

  it('should setup apps with true value', async () => {
    const s = await (new TestServer()).init({}, true, ['auth']);
    const apps = { pages: true };
    const setupPromise = config.setupApps({ apps }, s);
    expect(setupPromise).toBeInstanceOf(Promise);
    await setupPromise;

    expect(s.apps).toBeObject();
    expect(s.apps).toContainKey('pages');
  });

  it('should setup skip apps with false value', async () => {
    const s = await (new TestServer()).init({}, true, ['auth']);
    const apps = { myApp: false, pages: true };
    const setupPromise = config.setupApps({ apps }, s);
    expect(setupPromise).toBeInstanceOf(Promise);
    await setupPromise;

    expect(s.apps).toBeObject();
    expect(s.apps).not.toContainKey('myApp');
    expect(s.apps).toContainKey('pages');
  });
});


describe('core-lib.configFile.setupResources', () => {
  beforeEach(() => {
    process.chdir(__dirname);
  });
  afterEach(() => {
    storeRemove();
  });
  it('should setup no resources with empty config', async () => {
    const s = await (new TestServer()).init();

    const setupPromise = config.setupResources({}, s);
    expect(setupPromise).toBeInstanceOf(Promise);
    const setup = await setupPromise;
    expect(s.resources).toBeObject();
    expect(s.resources).toBeEmpty();
    expect(setup).toEqual(false);
  });

  it('should setup resource from string {resources: {r: "./path/to/resource.js"}}', async () => {
    const s = await (new TestServer()).init({}, true, ['auth']);
    const setupPromise = config.setupResources({
      resources: { r: './__mocks__/resources/resource.js' }
    }, s);
    expect(setupPromise).toBeInstanceOf(Promise);
    await setupPromise;
    expect(Object.keys(s.resources)).toBeArrayOfSize(1);
    expect(s.resources).toContainKey('r');
  });

  it('should setup resource from string with authentication set to true', async () => {
    const s = await (new TestServer()).init({}, true, ['auth']);
    await config.setupResources({
      resources: { r: './__mocks__/resources/resource.js' }
    }, s);
    expect(Object.keys(s.resources)).toBeArrayOfSize(1);
    expect(s.resources).toContainKey('r');
    expect(s.resources.r.options.auth).toEqual(true);
  });

  it('should throw error when trying to load unknown resource from string', async () => {
    const setup = async () => {
      const s = await (new TestServer()).init({}, true, ['auth']);
      await config.setupResources({
        resources: { r: './__mocks__/resource/unknown.js' }
      }, s);
    };

    await expect(setup()).rejects.toBeInstanceOf(ErrorResourceNotFound);
  });

  it('should setup resource from object {resources: {r: {...}}}', async () => {
    const s = await (new TestServer()).init({}, true, ['auth']);
    await config.setupResources({
      resources: {
        r: { model: './__mocks__/resources/resource.js' }
      }
    }, s);
    expect(Object.keys(s.resources)).toBeArrayOfSize(1);
    expect(s.resources).toContainKey('r');
  });

  it('should setup resource from object with authentication by default set to true', async () => {
    const s = await (new TestServer()).init({}, true, ['auth']);
    await config.setupResources({
      resources: {
        r: { model: './__mocks__/resources/resource.js' }
      }
    }, s);
    expect(Object.keys(s.resources)).toBeArrayOfSize(1);
    expect(s.resources).toContainKey('r');
    expect(s.resources.r.options.auth).toEqual(true);
  });

  it('should setup resource from object with authentication set to false', async () => {
    const s = await (new TestServer()).init({}, true);
    await config.setupResources({
      resources: {
        r: {
          model: './__mocks__/resources/resource.js',
          auth: false
        }
      }
    }, s);
    expect(Object.keys(s.resources)).toBeArrayOfSize(1);
    expect(s.resources).toContainKey('r');
    expect(s.resources.r.options.auth).toEqual(false);
  });

  it('should throw error when trying to load unknown resource from object', async () => {
    const setup = async () => {
      const s = await (new TestServer()).init({}, true);
      await config.setupResources({
        resources: {
          r: {
            model: './__mocks__/resource/unknown.js'
          }
        }
      }, s);
    };

    await expect(setup()).rejects.toBeInstanceOf(ErrorResourceNotFound);
  });
});


describe('core-lib.configFile.setupControllers', () => {
  it('should setup no controllers with empty config', async () => {
    const s = await (new TestServer()).init();
    const setupPromise = config.setupControllers({}, s);
    expect(setupPromise).toBeInstanceOf(Promise);
    const setup = await setupPromise;
    expect(setup).toEqual(false);
    expect(s.getMiddlewareForPath('/')).toBeArrayOfSize(0);
  });

  it('should setup controller from string {controllers: {"./path/to/controller.js": true}}', async () => {
    const s = await (new TestServer()).init();
    const setupPromise = config.setupControllers({
      controllers: {
        './__mocks__/controller/controller.js': true
      }
    }, s);
    expect(setupPromise).toBeInstanceOf(Promise);
    await setupPromise;
    expect(s.getMiddlewareForPath('/test')).toBeArrayOfSize(1);
  });

  it('should setup skip controllers with false value', async () => {
    const s = await (new TestServer()).init({}, false, ['auth']);
    await config.setupControllers({
      controllers: {
        './__mocks__/controller/controller.js': false
      }
    }, s);
    expect(s.getMiddlewareForPath('/test')).toBeArrayOfSize(0);
  });

  it('should setup controller from string with prefix {controllers: {"./path/to/controller.js": "/prefix"}}', async () => {
    const s = await (new TestServer()).init();
    const setupPromise = config.setupControllers({
      controllers: {
        './__mocks__/controller/controller.js': '/prefix'
      }
    }, s);
    expect(setupPromise).toBeInstanceOf(Promise);
    await setupPromise;
    expect(s.getMiddlewareForPath('/prefix/test')).toBeArrayOfSize(1);
  });

  it('should setup controller from object with prefix {controllers: {"./path/to/controller.js": {...}}}', async () => {
    const s = await (new TestServer()).init();
    const setupPromise = config.setupControllers({
      controllers: {
        './__mocks__/controller/controller.js': {
          prefix: '/prefix2'
        }
      }
    }, s);
    expect(setupPromise).toBeInstanceOf(Promise);
    await setupPromise;
    expect(s.getMiddlewareForPath('/prefix2/test')).toBeArrayOfSize(1);
  });
});

import execa from 'execa';
import 'jest-extended';
import path from 'path';
import { requireLib } from '../requireLib';
jest.setTimeout(30000);

describe('core-lib.requireLib: relative path', () => {
  beforeAll(() => {
    process.chdir(__dirname);
  });

  it('should load a relative path', async () => {
    const file = await requireLib('./__mocks__/requireLib/foo.js', __dirname);
    expect(file).toEqual('bar');
  });
  it('should load a relative path with prefix enabled (skips prefix)', async () => {
    const file = await requireLib('./__mocks__/requireLib/foo.js', __dirname, '@origami');
    expect(file).toEqual('bar');
  });
});


describe('core-lib.requireLib: absolute path', () => {
  beforeAll(() => {
    process.chdir(__dirname);
  });

  it('should load an absolute path', async () => {
    const file = await requireLib(path.resolve('./__mocks__/requireLib/foo.js'), __dirname);
    expect(file).toEqual('bar');
  });
  it('should load an absolute path with prefix enabled (skips prefix)', async () => {
    const file = await requireLib(path.resolve('./__mocks__/requireLib/foo.js'), __dirname, '@origami');
    expect(file).toEqual('bar');
  });
});


describe('core-lib.requireLib: aliased path', () => {
  beforeAll(() => {
    process.chdir(__dirname);
  });

  it('should load an aliased path', async () => {
    const file = await requireLib(path.resolve('./__mocks__/requireLib/foo.js:aliasName'), __dirname);
    expect(file).toEqual('bar');
  });
  it('should load an aliased path with prefix enabled (skips prefix)', async () => {
    const file = await requireLib(path.resolve('./__mocks__/requireLib/foo.js:aliasName'), __dirname, '@origami');
    expect(file).toEqual('bar');
  });
});


describe('core-lib.requireLib: module by finding root', () => {
  beforeAll(async () => {
    process.chdir(__dirname);
    await execa('npm', ['install'], { cwd: path.join(__dirname, '__mocks__/requireLib/pkg') });
  });

  afterEach(async () => {
    // await execa('rm', ['-rf', 'node_modules'], { cwd: path.join(__dirname, '__mocks__/rsequireLib/pkg') });
  });

  it('should load a module by finding the root (no prefix)', async () => {
    const m = 'is-sorted';
    const isSorted = await requireLib(
      m,
      path.resolve('./__mocks__/requireLib/pkg')
    );

    await expect(isSorted).toBeFunction();
  });

  it('should reject a module by finding the root (no prefix)', async () => {
    const m = 'test';
    const load = async () => {
      await requireLib(
        m,
        path.resolve('./__mocks__/requireLib/pkg')
      );
    };
    await expect(load()).rejects.toMatchObject({ message: `Could not load module '${m}'` });
  });

  it('should load a module by finding the root with a prefix', async () => {
    const m = '-sorted';
    const load = async () => {
      await requireLib(
        m,
        path.resolve('./__mocks__/requireLib/pkg')
      );
    };
    await expect(load()).rejects.toMatchObject({ message: `Could not load module '${m}'` });

    const isSorted = await requireLib(
      m,
      path.resolve('./__mocks__/requireLib/pkg'),
      'is'
    );
    await expect(isSorted).toBeFunction();
  });

  it('should load a module by finding the root with multiple prefix options', async () => {
    const m = '-sorted';
    const load = async () => {
      await requireLib(
        m,
        path.resolve('./__mocks__/requireLib/pkg')
      );
    };
    await expect(load()).rejects.toMatchObject({ message: `Could not load module '${m}'` });

    const isSorted = await requireLib(
      m,
      path.resolve('./__mocks__/requireLib/pkg'),
      ['fail', 'nope', 'is']
    );
    await expect(isSorted).toBeFunction();
  });
});


describe('core-lib.requireLib: module by process.cwd()', () => {
  beforeAll(() => {
    process.chdir('../../../../');
  });

  it('should load a module from process.cwd() (no prefix)', async () => {
    const m = 'colors';
    const colors = await requireLib(
      m,
      path.resolve('./__mocks__/requireLib/pk/node_modules')
    );

    await expect(colors).toBeObject();
    await expect(colors.blue).toBeFunction();
  });

  it('should reject a module from process.cwd() (no prefix)', async () => {
    const m = 'test';
    const load = async () => {
      await requireLib(
        m,
        path.resolve('./__mocks__/requireLib/pk/node_modules')
      );
    };
    await expect(load()).rejects.toMatchObject({ message: `Could not load module '${m}'` });
  });

  it('should load a module from process.cwd() with a prefix', async () => {
    const m = 'core-server';
    const load = async () => {
      await requireLib(
        m,
        path.resolve('./__mocks__/requireLib/pk/node_modules')
      );
    };
    await expect(load()).rejects.toMatchObject({ message: `Could not load module '${m}'` });

    const coreServer = await requireLib(
      m,
      path.resolve('./__mocks__/requireLib/pkg/node_modules'),
      '@origami/'
    );
    await expect(coreServer).toBeObject();
  });

  it('should load a module from process.cwd() with multiple prefix options', async () => {
    const m = 'core-server';
    const load = async () => {
      await requireLib(
        m,
        path.resolve('./__mocks__/requireLib/pk/node_modules')
      );
    };
    await expect(load()).rejects.toMatchObject({ message: `Could not load module '${m}'` });

    const coreServer = await requireLib(
      m,
      path.resolve('./__mocks__/requireLib/pkg/node_modules'),
      ['fail', 'origami-', '@origami/']
    );

    // await expect(coreServer.default).toBeFunction();
  });
});

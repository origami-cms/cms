import findRoot from 'find-root';
// @ts-ignore
import importFrom from 'import-from';
import path from 'path';
import { OrigamiError } from './OrigamiError';

export class ErrorRequireLib extends OrigamiError {
  constructor(lib: string) {
    super(
      'Lib',
      'ModuleNotFound',
      `Could not load module '${lib}'`
    );
  }
}

/**
 * A fallback require function that attempts to load the library first from the
 * current workspace, then as a relative path, then as a module from where the
 * process is called
 */
export const requireLib = async (lib: string, context: string, prefix?: string | string[]) => {
  // tslint:disable non-literal-require
  let _lib: string = lib;

  // If the local path is aliased, only use the local path
  if (lib.includes(':')) _lib = lib.split(':')[0];

  // If trying to load a relative module
  if (_lib.startsWith('/')) return require(_lib);
  if (_lib.startsWith('./')) return require(path.resolve(process.cwd(), _lib));

  const notFound = new ErrorRequireLib(_lib);

  const load = async (ctx: string) => {
    try {
      if (typeof prefix === 'string' || !prefix) {
        return await importFrom(ctx, `${prefix || ''}${_lib}`);
      } else throw notFound;
    } catch {
      let loadLib;
      if (prefix instanceof Array) {
        for (const p of prefix) {
          try {
            loadLib = await importFrom(ctx, `${p}${_lib}`);
            break;
          } catch { continue; }
        }
        if (loadLib) return loadLib;
      } else throw notFound;
    }
  };

  let loaded;
  try {
    // Attempt to load module relative to where it's called with opt. prefix
    // EG: lib: user-profiles, prefix: origami-plugin-
    loaded = await load(findRoot(context));

    if (loaded) return loaded;
    else throw notFound;

  } catch (e) {
    // Finally attempt to load it from the project's node_modules with opt. prefix
    loaded = await load(process.cwd());
    if (loaded) return loaded;
    else throw notFound;
  }
};

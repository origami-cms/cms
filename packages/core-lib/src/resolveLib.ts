import findRoot from 'find-root';
import path from 'path';
// @ts-ignore
import resolveFrom from 'resolve-from';

/**
 * A fallback require function that attempts to load the library first from the
 * current workspace, then as a relative path, then as a module from where the
 * process is called
 */
export const resolveLib = async (lib: string, context: string, prefix?: string) => {
    // If trying to load a relative module
  if (lib.startsWith('/')) return lib;
  if (lib.startsWith('.')) return path.resolve(process.cwd(), lib);

    // Attempt to load module relative to where it's called with opt. prefix
    // EG: lib: user-profiles, prefix: origami-plugin-
  const p = resolveFrom(findRoot(context), `${prefix}${lib}`);
  if (p) return p;

    // Finally attempt to load it from the project's node_modules with opt. prefix
  return resolveFrom(process.cwd(), `${prefix}${lib}`);
};

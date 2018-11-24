import fs from 'fs';
import path from 'path';
import {promisify} from 'util';

const readDir = promisify(fs.readdir);

/**
 * Finds the first matched file in the given directory, ignoring the extension name.
 * EG:
 *     With a given directory of:
 *     dir/
 *         site.css
 *         site.scss
 *         home.scss
 *
 *     If findFile is called as `findFile('dir/', 'site')`
 *     then 'dir/site.css' would be returned (first result alphabetically)
 */
export const findFile = async(dir: string, filename: string) => {
    const r = new RegExp(`^${filename}\.\\w+$`);

    const [file] = (await readDir(dir))
        .filter((f) => fs.statSync(path.join(dir, f)).isFile())
        .filter((f) => r.test(f));

    if (!file) return false;

    return path.join(dir, file);
};

import { CLIError, handle } from '@oclif/errors';
import fs from 'fs';
import path from 'path';
import Run from '../commands/run';

/**
 * Looks up a command in the src or lib commands directory
 * @param cmd Command to check
 */
export const commandExists = (cmd: string) => {
  const commands = path.resolve(__dirname, '../commands');
  return fs
    .readdirSync(commands)
    .map((f) => {
      // Path is a file
      if (/\.(j|t)s$/.test(f)) return f.split('.')[0];

      try {
        const index = path.join(commands, f, 'index.ts');
        // Attempt to load directory index
        const stat = fs.statSync(index);
        if (stat.isFile()) return f;
        return false;
      } catch (e) {
        // File does not exist
        return false;
      }
    })
    .filter((f) => f);
};


export const getEntry = async (args: string[]) =>
  new Promise((res, rej) => {
    let parsed;

    try {
      // @ts-ignore
      parsed = (new Run(args)).parse();
    } catch {
      res(false);
      return;
    }

    const _entry = parsed.args.entry;

    // If nothing was passed, or the first argument is a flag, attempt to
    // load the .origami file from the current dir
    if (!_entry || _entry.startsWith('-')) {
      res(path.join(process.cwd(), '.origami'));
      return;
    }

    const relative = path.resolve(process.cwd(), _entry);

    try {
      fs.statSync(relative);
      res(relative);
      return;
    } catch {
      if (commandExists(_entry)) res(false);
      else rej(new CLIError(`Could not load Origami file ${relative}`));
    }
  }).catch(handle);

import { stat } from 'fs';
import mkdirp from 'mkdirp';
import { promisify } from 'util';


const fsStat = promisify(stat);
const mk = promisify(mkdirp);

/**
 * Creates the directory to the process.env.CLI_CWD if it doesn't exist
 * @returns When finished making the directory
 */
export const initDirectory = async (): Promise<void> => {
  const cwd = process.env.CLI_CWD;

  if (!cwd) return Promise.resolve();

  // Check if cwd exists
  try {
    (await fsStat(cwd)).isDirectory();
    return Promise.resolve();

    // Otherwise create it
  } catch (e) {
    return mk(cwd);
  }
};

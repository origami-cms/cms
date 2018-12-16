import { readFile, writeFile } from 'fs';
import path from 'path';
import { promisify } from 'util';
const fsReadFile = promisify(readFile);
const fsWriteFile = promisify(writeFile);
import deepmerge from 'deepmerge';
import { PackageJson } from './types/Origami';


const PKG_FILE = (): string => path.resolve(process.env.CLI_CWD || process.cwd(), 'package.json');


export namespace pkgjson {
  /**
   * Attempt to load the package.json at the current directory
   * @returns The package as json, or false if it cannot be found
   * or loaded correctly
   */
  export const read = async (): Promise<PackageJson | Boolean> => {
    return new Promise(async (res, rej) =>

      fsReadFile(PKG_FILE())
        .catch((e) => {
          res(false);
        })
        .then((json) => {
          if (json) res(json.toJSON() as PackageJson);
          else return false;
        })
    );
  };


  /**
   * Merge/create the package.json file
   * @param file JSON config for Origami app to override
   */
  export const write = async (file: PackageJson): Promise<void> => {
    let existing = {};
    try {
      existing = require(PKG_FILE());
    } catch (e) {
      // No existing package.json file
    }

    const TAB_SIZE = 4;

    return fsWriteFile(
      PKG_FILE(),
      JSON.stringify(
        deepmerge(existing, file),
        null, TAB_SIZE
      )
    );
  };
}

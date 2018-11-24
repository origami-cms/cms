import { Origami, PackageJson, pkgjson } from '@origami/core';

/**
 * Creates a basic package.json file if it doesn't already exist
 * @param c Origami config file as json
 * @returns When finished writing file
 */
export const initPackage = async (c: Origami.Config): Promise<void> => {
  if (await pkgjson.read()) return Promise.resolve();

  const p: PackageJson = {
    name: c.app.name.replace(/\s/g, '-').toLowerCase(),
    dependencies: {},
    scripts: {}
  };

  return pkgjson.write(p);
};

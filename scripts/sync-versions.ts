import execa from 'execa';
import path from 'path';
import { PackageJson } from '../packages/core/src/index';
import fs from 'fs';

// Loops over all packages, and syncs the versions to the LOCAL latest version
const sync = async () => {
  const {stdout} = await execa('npx', ['lerna', 'list']);
  const packageNames = stdout.split('\n');
  const packages: {[key: string]: {name: string, pkg: PackageJson}} = {};

  packageNames.forEach(async(p) => {
    const name = p.split('@origami/').pop() as string;
    packages[p] = {
      name,
      pkg: require(path.resolve(__dirname, '../packages', name, 'package.json'))
    }
  });

  Object.entries(packages).forEach(async ([pkg, {name, pkg: pkgjson}]) => {
    packageNames.forEach(p => {
      const _pkg = packages[p].pkg;
      // @ts-ignore
      if (pkgjson.dependencies && pkgjson.dependencies[p]) pkgjson.dependencies[p] = _pkg.version;
      // @ts-ignore
      if (pkgjson.devDependencies && pkgjson.devDependencies[p]) pkgjson.devDependencies[p] = _pkg.version;
    });

    const file = path.resolve(__dirname, '../packages', name, 'package.json');
    fs.writeFileSync(file, JSON.stringify(pkgjson, null, 2));
    await execa('git', ['add', file]);
  });

};

sync();

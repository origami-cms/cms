import execa from 'execa';
import fs from 'fs';
import Listr, { ListrTask } from 'listr';
import path from 'path';

const [, , ...args] = process.argv;
const exclude = ['@origami/bird', '@origami/cli', '@origami/tslint-config'];

/**
 * Removes all local references in Typedoc JSON result
 * @param obj Typedoc JSON result
 */
const removeLocalSources = (obj: any) => {

  const relative = path.resolve(__dirname, '../packages');

  if (obj.originalName && obj.originalName.startsWith(relative)) {
    obj.originalName = `@origami${obj.originalName.slice(relative.length)}`;
  }
  if (obj.fileName && obj.fileName.includes('node_modules')) {
    obj.fileName = obj.fileName.split('node_modules')[1].slice(1);
  }
  if (obj.type && obj.type.name && obj.type.name.includes('node_modules')) {
    obj.type.name = obj.type.name.split('node_modules')[1].slice(1);
  }

  if (obj.children) obj.children.forEach(removeLocalSources);
  if (obj.sources) obj.sources.forEach((s: any) => removeLocalSources(s));
  if (obj.signatures) obj.signatures.forEach((s: any) => removeLocalSources(s));
  if (obj.parameters) obj.parameters.forEach((s: any) => removeLocalSources(s));
  if (obj.types) obj.types.forEach((s: any) => removeLocalSources(s));
  if (obj.typeArguments) obj.typeArguments.forEach((s: any) => removeLocalSources(s));
  if (obj.declaration) removeLocalSources(obj.declaration);
  if (obj.type) removeLocalSources(obj.type);
};

/**
 * Runs typedoc over a module
 * @param jsonFile JSON output
 * @param module   Module to document
 */
const generateJSON = (jsonFile: string, module: string) =>
  execa(
    'npx',
    [
      'typedoc',
      '--json',
      jsonFile,
      '--tsconfig',
      `./packages/${module}/tsconfig.json`,
      '--mode',
      'file',
      '--excludeNotExported',
      '--excludeExternals',
      '--excludePrivate'
    ],
    { cwd: path.resolve(__dirname, '../') }
  );

/**
 * Documents a module
 * @param m Module to document
 */
const document = async (m: string) => {
  const jsonFile = path.resolve(__dirname, `../packages/${m}/docs.json`);
  await generateJSON(jsonFile, m);
  const json = require(jsonFile);
  removeLocalSources(json);
  fs.writeFileSync(jsonFile, JSON.stringify(json, null, 2));
};

(async () => {
  let modules = args;
  if (!modules.length) {
    const { stdout } = await execa('npx', ['lerna', 'list']);
    modules = stdout.split('\n').filter((m) => m.startsWith('@origami'));
  }

  modules = modules
    .filter((m) => !exclude.includes(m))
    .map((m) => (m.startsWith('@origami') ? /@origami\/(.+)/.exec(m)![1] : m));

  new Listr(
    modules.map(
      (m) =>
        ({
          title: `@origami/${m}`,
          task: () => document(m)
        } as ListrTask)
    ),
    { concurrent: true }
  ).run();
})();

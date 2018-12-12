import { colors, info, Origami, PackageJson, pkgjson } from '@origami/core';
import execa from 'execa';
import { installPackages } from '../installPackages';

/**
 * Installs the necessary node modules that are specified in the config
 * @async
 * @returns Whether it's safe to continue or not
 */
export const install = async (config: Origami.Config): Promise<void> => {
  // Find the existing dependencies already installed
  const _p = await pkgjson.read();

  if (!_p) throw new Error('Could not find package.json');
  const p = _p as PackageJson;

  const existing = p.dependencies || {};

  // Required dependencies for Origami to run
  let dependencies = ['@origami/origami'];

  if (config.store && config.store.type) {
    dependencies.push(`origami-store-${config.store.type}`);
  }

  // Filter with what's currently installed
  dependencies = dependencies.filter((d) => !existing[d]);

  if (!dependencies.length) {
    info('No dependencies to install');
    return;
  }

  let colorDeps = dependencies
    .map((d) => colors.blue(d))
    .slice(0, -1)
    .join(colors.white(', '));
  colorDeps +=
    colors.white(' and ') + colors.blue(dependencies.slice(-1).pop()!);
  // Install the rest
  info(
    `Installing ${dependencies.length} package${
      dependencies.length > 1 ? 's' : ''
    }:`
  );
  info(colorDeps);
  try {
    await installPackages(dependencies);
    info(colors.green('Done!'));
  } catch (e) {
    info(colors.red(e.message));
  }
};

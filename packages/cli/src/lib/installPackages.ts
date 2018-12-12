import { error, warn } from '@origami/core';
import execa from 'execa';
import { spinner } from './spinner';

export const installPackages = async (
  dependencies: string[],
  cwd = process.env.CLI_CWD
) => {
  try {
    spinner.start('Installing');
    await execa('yarn', ['add', ...dependencies], { cwd });
    spinner.stop();
  } catch (e) {
    warn('Yarn not available. Attempting to install via npm...');
    try {
      await execa('npm', ['install', '--save', ...dependencies], { cwd });
      spinner.stop();
    } catch (e) {
      error('Could not install packages');
      spinner.stop();
    }
  }
};

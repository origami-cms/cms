import { config } from '@origami/core';
import execa from 'execa';
import { ListrTask } from 'listr';
import { initDirectory as initD, initPackage, prompt } from '../lib/new';

export namespace setup {
  /**
   * Make the directory if it doesn't exist
   */
  export const initDirectory = (): ListrTask => ({
    title: 'Initialize directory',
    async task() {
      return initD();
    }
  });

  /**
   * Prompt the user through a wizard to get the details for the origami file
   */
  export const retrieveConfiguration = (defaults: boolean, directory: string): ListrTask => ({
    title: 'Retrieve configuration',
    async task(ctx) {
      ctx.config = await prompt(defaults, directory);
    }
  });

  /**
   * Write the .origami file
   */
  export const createOrigami = (): ListrTask => ({
    title: 'Create .origami file',
    async task(ctx) {
      return config.write(ctx.config);
    }
  });

  /**
   * Create the package.json
   */
  export const createPackage = (): ListrTask => ({
    title: 'Create package.json file',
    async task(ctx) {
      return initPackage(ctx.config);
    }
  });

  /**
   * Install the dependencies that are yet to be installed
   */
  export const installDependenciesYarn = (): ListrTask => ({
    title: 'Install package dependencies with Yarn',
    task: async (ctx, task) => execa('yarn', { cwd: ctx.dest })
      .catch(() => {
        ctx.yarn = false;
        task.skip('Yarn not available, install it via `npm install -g yarn`');
      })
  });
  export const installDependenciesNPM = (): ListrTask => ({
    title: 'Install package dependencies with npm',
    enabled: (ctx) => ctx.yarn === false,
    task: async (ctx) => execa('npm', ['install'], { cwd: ctx.dest })
  });
}

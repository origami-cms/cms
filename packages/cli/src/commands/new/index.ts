// tslint:disable no-default-export export-name

import Command, { flags } from '@oclif/command';
import { bird } from '@origami/bird';
import { colors, config, info } from '@origami/core';
import path from 'path';
import { initDirectory, initPackage, install, override, prompt } from '../../lib/new';

export default class New extends Command {
  public static description = 'Initialize a new Origami project';

  public static examples = [
    '$ origami new',
    '$ origami new ./my-site',
    '$ origami new ./ --useDefaults'
  ];

  public static flags = {
    useDefaults: flags.boolean({
      char: 'd',
      description: 'Use default settings',
      default: false,
      type: 'boolean'
    })
  };

  public static args = [
    {
      name: 'directory',
      description: 'Directory to initialize the new project',
      required: false,
      default: process.cwd(),
      parse: (v: string) => path.relative(process.cwd(), v)
    }
  ];

  public async run() {
    const { args, flags: f } = this.parse(New);
    const t = Date.now();

    process.env.CLI_CWD = path.resolve(args.directory);

    // Display the Origami bird
    bird();

    // If there is a config, confirm the user wants to override the existing project
    if (!(await override())) return;

    await initDirectory();
    if (f.useDefaults) info('Using default config');
    const _config = await prompt(f.useDefaults, args.directory);

    await config.write(_config);
    await initPackage(_config);
    await install(_config);

    // TODO: Init database
    this.log(colors.green(`Setup completed in ${(Date.now() - t) / 1000}s`));
  }
}

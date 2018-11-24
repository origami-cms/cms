// tslint:disable no-default-export export-name

import Command from '@oclif/command';
import path from 'path';
import { clone } from '../../lib/examples';


export default class Example extends Command {
  public static description = 'Generate an example Origami project';

  public static examples = [
    '$ origami new',
    '$ origami ./my-site',
    '$ origami new ./ --useDefaults'
  ];

  public static args = [{
    name: 'example',
    description: 'Example project to clone',
    required: true,
    default: process.cwd(),
    parse: (v: string) => path.relative(process.cwd(), v)
  }];


  public async run() {
    const { args } = this.parse(Example);
    await clone(args.example);
  }
}

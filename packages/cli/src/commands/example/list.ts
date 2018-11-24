// tslint:disable no-default-export export-name

import Command from '@oclif/command';
import { fetchAll } from '../../lib/examples';

export default class List extends Command {
  public static description = 'List the available examples';

  public static examples = [
    '$ origami list'
  ];

  public async run() {
    await fetchAll();
  }
}

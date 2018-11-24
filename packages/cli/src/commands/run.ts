// tslint:disable no-default-export export-name
import { Command, flags } from '@oclif/command';
import { run as runner } from '../lib/run';

export default class Run extends Command {
  public static description = 'Run a origami instance';

  public static examples = [
    '$ origami',
    '$ origami -o',
    '$ origami my-site/',
    '$ PORT=1234 origami my-site/',
    '$ ORIGAMI_STORE_SECRET=supersecret origami my-app/'
  ];

  public static flags = {
    open: flags.boolean({
      char: 'o',
      description: 'Open Origami in the web browser once it\'s running',
      default: false,
      type: 'boolean'
    })
  };

  public static args = [{
    name: 'entry',
    description: 'The .origami file, or directory with a .origami file to run'
  }];

  public async run() {
    const { args, flags: f } = this.parse(Run);
    return runner(args.entry, f.open);
  }
}

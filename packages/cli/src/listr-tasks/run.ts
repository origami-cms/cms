import { ListrTask } from 'listr';
import {run as runner} from '../lib/run';

export namespace run {
  /**
   * Run the Origami project
   */
  export const origami = (): ListrTask => ({
    title: 'Run',
    async task(ctx) {
      return runner(ctx.directory, ctx.open);
    }
  });
}

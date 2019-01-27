import { colors, config, Origami } from '@origami/core';
import * as inq from 'inquirer';

/**
 * Prompts user to override the existing project if there is already a config file
 * present in the current working directory
 * @async
 * @returns Whether it's safe to continue or not
 */
export const override = async (): Promise<boolean> => {
  let existing = await config.read();
  if (!existing) return true;

  existing = existing;

  interface Result {
    override: boolean;
  }

  // tslint:disable-next-line no-unnecessary-type-assertion
  return (await inq.prompt({
    type: 'confirm',
    message: `Override existing app ${colors.red(existing.app.name || '')}?`,
    name: 'override',
    default: false
  }) as Result).override;
};

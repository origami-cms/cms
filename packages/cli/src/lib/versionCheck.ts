import { colors } from '@origami/core';
import { cli } from 'cli-ux';
// @ts-ignore
import getLatest from 'latest-version';
import { gt } from 'semver';


export const versionCheck = async (skipLog?: boolean) => {
  // tslint:disable-next-line no-require-imports
  const { version: current, name } = require('../../package.json');
  const latest = await getLatest(name);

  if (gt(latest, current)) {
    if (!skipLog) {
      cli.log(colors.green(`⬆  A new version of Origami CLI (${latest}) is available. ⬆`));
    }
    return false;
  } else return true;
};

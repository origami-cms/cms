// tslint:disable no-console

import { colors, showLog } from '@origami/core-lib';
import fs from 'fs';
import path from 'path';

export const bird = (): void => {
  if (!showLog('info')) return;

  const width = 40;
  console.log(
    colors.purple(fs.readFileSync(path.resolve(__dirname, '../crane.txt')).toString())
  );
  const logo = 'ORIGAMI'.split('').join(' ');
  const spacer = ' '.repeat((width - logo.length) / 2);
  // tslint:disable-next-line
  console.log(colors.purple(`${spacer}${logo}${spacer}`), '\n'.repeat(5));
};

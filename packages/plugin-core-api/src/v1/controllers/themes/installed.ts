import { Route } from '@origami/core-lib';
import * as NPM from '../../../lib/npm';

const r = new Route('/api/v1/themes/installed');
module.exports = r;

r.get(async (req, res, next) => {
  const t = await Promise.all([
    // Get list of packages
    NPM.list('theme'),
    // TODO: Move to db call
    // Get activated package
    'snow'
  ]);
  let [themes] = t;
  const [, activated] = t;

  themes = themes
    .map((_t) => {
      const _r = /^origami-theme-(.+)$/.exec(_t);
      return _r ? _r[1] : null;
    })
    .filter((_t) => _t) as string[];

  res.locals.content.set({ themes, activated });
  next();
});

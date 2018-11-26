import { Route } from '@origami/core-lib';
import * as NPM from '../../../lib/npm';

const r = new Route('/themes');
module.exports = r;

r.get(async (req, res, next) => {
  res.locals.content.set(
    (await NPM.search('theme')).map((p) => ({
      name: p.name,
      version: p.version,
      description: p.description,
      author: p.author
    }))
  );
  next();
});

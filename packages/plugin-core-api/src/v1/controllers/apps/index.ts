import { Route } from '@origami/core-lib';
import { App } from '@origami/core-server';

const r = new Route();
module.exports = r;

r
  .position('store')
  .get('auth', async (req, res, next) => {
    res.locals.content.set(
      Object.entries(res.app.get('apps') as { [name: string]: App.App })
        .reduce((apps, [name, app]) => {
          apps[name] = app.entry as App.EntryResponse;
          return apps;
        }, {} as { [name: string]: App.EntryResponse })
    );

    next();
  });

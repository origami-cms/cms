import { auth, info, Route } from '@origami/core-lib';
import path from 'path';
import { resources } from './v1/resources';

module.exports = async (app: any, options: any) => {
  if (!app.store) {
    info('CoreAPIPlugin: Skipping plugin because there is no store configured');
    return;
  }

  resources(app);

  // ------------------------------------------------------------ Setup models
  const api = new Route('/api/v1');

  // If the body has a password, hash it for all routes
  api
    .position('pre-store')
    .use(async (req, res, next) => {
      if (req.body.password) {
        req.__initialPassword = req.body.password;
        req.body.password = await auth.hash(req.body.password);
      }
      next();
    });


  await api.include(path.resolve(__dirname, './v1/controllers'), false, true, false);


  api
    .position('pre-render')
    .use((req, res, next) => {
      if (!res.locals.content.hasContent) {
        res.locals.content.responseCode = 'general.errors.notFound';
      }
      next();
    });

  app.useRouter(api);
};

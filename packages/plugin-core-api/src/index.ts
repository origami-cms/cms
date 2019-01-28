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
  const contentType = new Route();

  // Enforce all requests to be JSON by default (even errors)
  // This can be overridden by the Accepts header on the request

  contentType
    .position('init')
    .use((req, res, next) => {
      if (req.originalUrl.match(/^\/api\/v1\//)) res.contentType('json');
      if (req.query.format) {
        switch (req.query.format) {
          case 'json':
            res.contentType('json');
            break;
          case 'html':
            res.contentType('html');
            break;
          case 'xml':
            res.contentType('xml');
            break;
          case 'csv':
            res.contentType('text/csv');
        }
      }

      next();
    });

  // If the body has a password, hash it for all routes
  api
    .position('pre-store')
    .use(async (req, res, next) => {
      if (req.body.password) {
        // TODO: Fix security issue
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

  app.useRouter(contentType);
  app.useRouter(api);
};

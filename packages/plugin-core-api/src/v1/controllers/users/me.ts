import { Route } from '@origami/core-lib';

const r = new Route('/me');
module.exports = r;

r
  .position('pre-store')
  .use('auth')
  .get(async (req, res, next) => {
    res.locals.content.set(
      await res.app.get('store').model('user').find({
        id: req.jwt.data.userId
      })
    );
    next();
  });

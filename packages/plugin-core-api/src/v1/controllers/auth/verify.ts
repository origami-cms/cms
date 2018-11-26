import { auth, Route } from '@origami/core-lib';

const r = new Route('/verify');
module.exports = r;

/*
* Validates the JWT token
* it's expiry.
*/
r
  .position('store')
  .use('auth')
  .get(async (req, res, next) => {
    auth.jwtVerify(req.jwt.token, req.app.get('secret'));

    res.locals.responseCode = 'auth.success.verified';
    res.locals.content.set({ valid: true });

    next();
  });

import { auth, Route } from '@origami/core-lib';

const r = new Route('/refresh');
module.exports = r;

/*
* Gives a new JWT based on the current one
*/
r
  .use('auth')
  .post(async (req, res, next) => {
    // @ts-ignore
    const secret = req.app.get('secret');

    const existing = auth.jwtVerify(req.jwt.token, secret);
    delete existing.iat;
    delete existing.exp;

    const token = auth.jwtSign(existing, secret);
    const { exp: expires } = auth.jwtVerify(token, secret);

    res.locals.content.set({ token, expires });

    next();
  });

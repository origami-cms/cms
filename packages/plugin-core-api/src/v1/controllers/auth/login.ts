import { auth, Route } from '@origami/core-lib';

const r = new Route('/login');
module.exports = r;
/*
* Validates the email and password of a user, then returns a JWT token, and
* it's expiry.
*/
r.post(async (req, res, next) => {
  try {
    const model = await res.app.get('store').model('user');
    // @ts-ignore
    const secret = res.app.get('secret');

    // Find the user
    const [user] = await model.find({ email: req.body.email }, { hidden: true });
    if (!user) {
      next(new Error('auth.errors.noUser'));
      return;
    }

    // Compare password
    if (!await auth.compare(req.__initialPassword || '', user.password)) {
      next(new Error('auth.errors.noUser'));
      return;
    }

    // If successful, sign JWT
    const token = auth.jwtSign({
      userId: user.id,
      email: user.email
    }, secret);
    const { exp: expires } = auth.jwtVerify(token, secret);


    res.locals.content.set({ token, expires });
    res.locals.content.responseCode = 'auth.success.login';

    next();

  } catch (e) {
    next(e);
  }
});


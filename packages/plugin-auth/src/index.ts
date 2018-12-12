import { auth as authLib, Origami, Server } from '@origami/core';

// tslint:disable-next-line variable-name
const Auth: Origami.Server.RequestHandler = async (req, res, next) => {
  try {
    const head = req.headers.authorization;

    const _auth = head as string;

    if (!head) throw new Error('auth.errors.noHeader');
    const jwtRegex: RegExp = /Bearer\s(.+)/;
    const regexResult = jwtRegex.exec(_auth);
    if (!regexResult) throw new Error('auth.errors.invalidHead');
    const [, jwt] = regexResult;

    let data;
    try {
      data = authLib.jwtVerify(jwt, res.app.get('secret'));
    } catch (e) {
      if (e.name === 'JsonWebTokenError') {
        throw new Error('auth.errors.invalidJWT');
      }
      if (e.name === 'TokenExpiredError') {
        throw new Error('auth.errors.expired');
      }
      throw e;
    }
    req.jwt = {
      token: jwt,
      data
    };

    next();
  } catch (e) {
    next(e);
  }
};

// tslint:disable-next-line no-default-export export-name
export default (server: Server) => {
  server.namedMiddleware('auth', Auth);
};
export const auth = Auth;

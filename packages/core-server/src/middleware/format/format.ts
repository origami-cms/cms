import { Origami } from '@origami/core-lib';
import { NextFunction, RequestHandler } from 'express';
import { OK } from 'http-status-codes';
import { status } from '../../lib/status';
import { Formatter } from './lib/Formatter';

/**
 * End of the road middleware. Handles any custom response codes, and formats
 * the response back to the client.
 */
export const format = (): RequestHandler => {
  const fn = async (
    req: Origami.Server.Request,
    res: Origami.Server.Response,
    next: NextFunction
  ) => {
    if (res.headersSent) return;

    // Provided by the error middleware
    let message = res.locals.error;

    // If there is no error, and the content has a responseCode, parse it into
    // the response
    if (!message && res.locals.content.responseCode) {
      const parsed = status(res.get('ln'), res.locals.content.responseCode, OK);
      if (parsed.message) message = parsed.message;
      if (parsed.code) res.status(parsed.code);
    }

    try {
      // Format the response with the accepted headers and custom message if present
      return await (new Formatter(res, req.headers.accept, message)).send();
    } catch (e) {
      const error = 500;
      res.redirect('/500', error);
    }
  };

  return fn as RequestHandler;
};

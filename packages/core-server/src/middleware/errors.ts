import { colors, error as logError, Origami } from '@origami/core-lib';
import { ErrorRequestHandler, NextFunction } from 'express';
import http from 'http-status-codes';
import { status } from '../lib/status';


/**
 * Error middleware that parses errors messages and attempts to load the response
 * code from the language file.
 */
export const error: ErrorRequestHandler = (async (
  err: Origami.Server.DataError,
  req: Origami.Server.Request,
  res: Origami.Server.Response,
  next: NextFunction
) => {

  if (err) {
    // Set the initial error code to 500
    let code = http.INTERNAL_SERVER_ERROR;
    // Load the message from the error, or set to general error
    // If the error message is a valid responseCode, the code and message
    // will be overridden by the response in the language file
    let message = err.message || 'general.errors.internal';

    // Attempt to override the code and message
    ({ message, code } = status(res.app.get('ln'), message, err.statusCode || code));

    // Set the status and the error.
    // These are passed to the format middleware
    res.status(code);
    res.locals.error = message;

    if (!res.locals.content.hasContent) {
      // If there is data present on the error, send it as data
      if (err.data) { res.locals.content.set(err.data); } else if (
        process.env.NODE_ENV !== 'production' &&
        err.stack
      ) { res.locals.content.set(err.stack.split('\n')); }

      // Otherwise clear all the data because of the error
    } else { res.locals.content.clear(); }

    logError(
      'Server',
      new Error(`${
        colors.yellow(`${req.method} ${req.url}`)} ${
        colors.red(res.statusCode.toString())
        } ${colors.red(message)}`
      )
    );
  }

  next();

}) as ErrorRequestHandler;

import { Origami } from '@origami/core-lib';
import { NextFunction, RequestHandler } from 'express';
import http from 'http-status-codes';
import { Writable } from 'stream';
import { status } from '../lib/status';


interface Returning {
  statusCode: number;
  data?: object | string | boolean | number;
  message?: string;
}

export const format = (): RequestHandler => {
  const fn = async (
    req: Origami.Server.Request,
    res: Origami.Server.Response,
    next: NextFunction
  ) => {
    next();
    if (res.headersSent) { return; }

    let message: string;

    // If there is already an error, status is set
    if (res.locals.error) {
      message = res.locals.error;
    } else if (res.locals.content.responseCode) {
      let code;
      ({ message, code } = status(res.app.get('ln'), res.locals.content.responseCode, http.OK));

      res.status(code);
    }

    res.format({
      json() { sendJSON(message, req, res); },
      html() { sendHTML(message, req, res); },
      text() { sendText(message, req, res); }
    });

    // // If it's a json request, wrap the data as json
    // // NOTE: Attempted req.is(), however there seemed to be a bug
    // if (
    //     req.accepts('application/json') ||
    //     req.originalUrl.startsWith('/api') ||
    //     typeof body === 'object'
    // ) {
    //     const returning: Returning = {
    //         statusCode: res.statusCode
    //     };
    //     if (message) returning.message = message;
    //     if (body) returning.data = message;

    //     if (res.text || res.data) {
    //         if (res.text) returning.message = res.text;
    //         if (res.data) returning.data = res.data;

    //     } else {
    //         res.status(http.NOT_FOUND);
    //         returning.statusCode = http.NOT_FOUND;
    //         returning.message = 'Not found';
    //     }

    //     res.send(returning);
    //     return;

    // }

    // if (!body) {
    //     res.status(http.NOT_FOUND);
    //     // If it's a page request, redirect
    //     if (typeof req.headers.accept !== 'string') {
    //         error('accept header should be a string');
    //     }
    //     if (req.headers.accept && req.headers.accept.includes('text/html')) {
    //         if (req.url !== '404') res.redirect('/404');
    //         // if (req.url === '/404') res.send('Not found');
    //     }
    //     // Otherwise send nothing
    //     else res.send();
    // } else {
    //     if (res.statusCode !== http.OK) {
    //         const br = '<br />';
    //         // Show the error
    //         if (res.data) body += br + res.data;
    //     }
    //     res.send(body);
    // }
  };


  return fn as RequestHandler;
};

type SendFunction = (
  message: string,
  req: Origami.Server.Request,
  res: Origami.Server.Response,
  force?: boolean
) => void;


const sendJSON: SendFunction = (message, req, res, force) => {
  const body = res.locals.content.get();

  // If no body, return 404
  if (!body && !message) {
    return res
      .status(http.NOT_FOUND)
      .json({
        statusCode: http.NOT_FOUND,
        message: 'Not found'
      } as Returning);
  }

  // Convert string to JSON response...
  if (typeof body === 'string' && !force) {
    let _body = body;

    // Attempt to parse the body as JSON, otherwise send as string in data
    try {
      _body = JSON.parse(_body);
    } catch { }

    return res.json({
      statusCode: res.statusCode,
      message,
      data: _body
    } as Returning);


    // If body is a stream, send it as a stream instead
  } else if (body instanceof Writable) {
    sendStream(message, req, res, true);
    return;

    // Else send as normal JSON
  } else {
    return res.json({
      statusCode: res.statusCode,
      message,
      data: body
    } as Returning);
  }
};


const sendHTML: SendFunction = (message, req, res, force) => {
  const body = res.locals.content.get();

  // If no body, return 404
  if (!body) {
    res.redirect('/404');
    return;
  }

  // Send as HTML
  if (typeof body === 'string') {
    res.send(body);
  } else if (body instanceof Writable) {
    sendStream(message, req, res, true);
    return;
  } else {
    sendJSON(message, req, res, true);
    return;
  }
};


const sendText: SendFunction = (message, req, res, force) => {
  const body = res.locals.content.get();
  res.send(body);
};


const sendStream: SendFunction = (message, req, res, force) => {
  const body = res.locals.content.get() as Writable;
  res.pipe(body);
};

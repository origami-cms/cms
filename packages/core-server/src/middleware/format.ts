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
    if (res.headersSent) return;

    let message: string = '';

    // If there is already an error, status is set
    if (res.locals.error) {
      message = res.locals.error;
    } else if (res.locals.content.responseCode) {
      let code;
      ({ message, code } = status(
        res.app.get('ln'),
        res.locals.content.responseCode,
        http.OK
      ));

      res.status(code);
    }

    let type =
      req.headers.accept ||
      res.get('Content-Type') ||
      req.get('Content-Type');

    const body = res.locals.content.get();

    if (!type) {
      type = typeof body === 'string' ? 'text/plain' : 'application/json';
    } else type = type.split(',')[0].split(';')[0];

    let func;
    switch (type.toLowerCase()) {
      case 'application/json':
        func = sendJSON;
        break;

      case 'text/html':
        func = sendHTML;
        break;

      case 'application/xml':
        func = sendXML;
        break;

      case 'text/plain':
      case 'text/css':
      default:
        func = sendText;
    }

    res.contentType(type);

    func(message, req, res);
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
    return res.status(http.NOT_FOUND).json({
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
    } catch {}

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
  if (res.locals.error) {
    res.redirect('/500');
    return;
  }
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

const sendXML: SendFunction = (message, req, res, force) => {
  const body = res.locals.content.get();
  res.send(body);
};

const sendStream: SendFunction = (message, req, res, force) => {
  const body = res.locals.content.get() as Writable;
  res.pipe(body);
};

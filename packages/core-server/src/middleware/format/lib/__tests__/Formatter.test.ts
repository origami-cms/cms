import express from 'express';
// @ts-ignore
import getPort from 'get-port';
import { Server } from 'http';
import { INTERNAL_SERVER_ERROR, NOT_FOUND, OK } from 'http-status-codes';
import request, { RequestPromiseOptions } from 'request-promise-native';
import { Content } from '../../../../lib/Content';
import { status } from '../../../../lib/status';
import { error as errorMW } from '../../../errors';
import { Formatter } from '../Formatter';

const MIMES = {
  star: '*/*',
  json: 'application/json',
  html: 'text/html',
  csv: 'text/csv',
  xml: 'text/xml',
  appXml: 'application/xml',
  plain: 'text/plain',
  css: 'text/css',
  browserGet:
    'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8'
};

const BODY = {
  text: 'Foobar',
  json: { foo: 'bar' },
  jsonAsText: '{"foo":"bar"}'
};
const RESPONSE = {
  textAsJson: {
    statusCode: OK,
    data: 'Foobar'
  },
  jsonNotFound: {
    statusCode: NOT_FOUND,
    message: 'Not found'
  },
  jsonInternalError: {
    statusCode: INTERNAL_SERVER_ERROR,
    message: 'Internal error'
  },
  jsonTextToJson: {
    statusCode: OK,
    data: BODY.json,
  }
};

let f: Formatter;
let app = express();
let server: Server;
let port: number;

/**
 * Helper function
 * @param body Body to send on the request
 * @param expectType Mime type to expect back on the request
 * @param acceptType Send an Accept header on the request
 * @param responseType Override the res.contentType (before Formatter)
 * @param error Throw an error to catch (error response codes, etc)
 */
const send = async (
  body: any,
  expectType: string,
  acceptType?: string | false,
  responseType?: string | false,
  error?: Error
) => {
  // Mimic content middleware and throw error if provided
  app.use((req, res, next) => {
    res.locals.content = new Content();

    try {
      if (error) throw error;
      if (responseType) res.contentType(responseType);
      if (body) res.locals.content.set(body);
      next();
    } catch (e) {
      next(e);
    }
  });

  app.use(errorMW);

  // Send the formatted response
  app.use((req, res, next) => {
    if (res.headersSent) return;

    let message = res.locals.error;

    if (!res.locals.error && res.locals.content.responseCode) {
      const parsed = status(res.get('ln'), res.locals.content.responseCode, OK);
      if (parsed.message) message = parsed.message;
      if (parsed.code) res.status(parsed.code);
    }

    f = new Formatter(res, req.headers.accept, message);
    return f.send();
  });

  // Update the ports and server for cleanup
  port = await getPort();
  server = app.listen(port);

  let res;
  // Send a request with an optional Accept header
  const opts: RequestPromiseOptions = { resolveWithFullResponse: true };
  if (acceptType) opts.headers = { accept: acceptType };
  try {
    res = await request(`http://localhost:${port}/`, opts);
  } catch (e) {
    return e.response;
  }

  // Compare the expected type on the Formatter AND the response
  expect(f.type).toEqual(expectType);
  expect(res.headers['content-type']).toStartWith(expectType);

  return res;
};

// Spin up and kill new express apps for each test
beforeEach(async () => (app = express()));
afterEach(() => server.close());

describe('core-server.Formatter.constructor', () => {
  it('should create Formatter with correct default properties', async () => {
    await send(BODY.text, MIMES.plain);
    expect(f.body).toEqual(BODY.text);
    expect(f.accept).toBeUndefined();
    expect(f.type).toEqual(MIMES.plain);
  });

  it('should create Formatter with type set to res.contentType', async () => {
    await send(BODY.text, MIMES.html, false, MIMES.html);
  });

  it('should create Formatter with type set to req.accept', async () => {
    await send(BODY.text, MIMES.html, MIMES.html);
  });

  it('should create Formatter with type set to default if req.accept is */*', async () => {
    await send(BODY.text, MIMES.plain, MIMES.star);
  });

  it('should create Formatter with first type in multiple req.accept', async () => {
    await send(BODY.text, MIMES.html, MIMES.browserGet);
  });

  it('should create Formatter with type json req.accept is unknown and body is json', async () => {
    await send(BODY.json, MIMES.json);
  });

  it('should create Formatter with type json req.accept is */* and body is json', async () => {
    await send(BODY.json, MIMES.json, MIMES.star);
  });
});

describe('core-server.Formatter.send', () => {
  it('should return response with header application/json', async () => {
    await send(BODY.text, MIMES.json, false, MIMES.json);
  });
  it('should return response with header text/html', async () => {
    await send(BODY.text, MIMES.html, false, MIMES.html);
  });
  it('should return response with header text/csv', async () => {
    await send(BODY.text, MIMES.csv, false, MIMES.csv);
  });
  it('should return response with header text/xml', async () => {
    await send(BODY.text, MIMES.xml, false, MIMES.xml);
  });
  it('should return response with header application/xml', async () => {
    await send(BODY.text, MIMES.appXml, false, MIMES.appXml);
  });
  it('should return response with header text/plain', async () => {
    await send(BODY.text, MIMES.plain, false, MIMES.plain);
  });
  it('should return response with header text/css', async () => {
    await send(BODY.text, MIMES.css, false, MIMES.css);
  });
});

describe('core-server.Formatter.sendJSON', () => {
  it('should return json', async () => {
    await send(BODY.json, MIMES.json);
  });

  it('should wrap string body in json', async () => {
    let { body } = await send(BODY.text, MIMES.json, MIMES.json);
    body = JSON.parse(body);
    expect(body).toEqual(RESPONSE.textAsJson);
  });

  it('should return 404 json for no body or message', async () => {
    let { body, statusCode } = await send(null, MIMES.json, MIMES.json);
    body = JSON.parse(body);
    expect(body).toEqual(RESPONSE.jsonNotFound);
    expect(statusCode).toEqual(NOT_FOUND);
  });

  it('should return 500 for unknown error with correct message', async () => {
    let { body, statusCode } = await send(
      null,
      MIMES.json,
      MIMES.json,
      false,
      new Error()
    );
    body = JSON.parse(body);
    expect(body).toMatchObject(RESPONSE.jsonInternalError);
    expect(body).toHaveProperty('data');
    expect(statusCode).toEqual(INTERNAL_SERVER_ERROR);
  });

  it('should return 500 for custom unknown error with correct message', async () => {
    const error = 'Unknown';
    let { body, statusCode } = await send(
      null,
      MIMES.json,
      MIMES.json,
      false,
      new Error(error)
    );

    body = JSON.parse(body);
    expect(body).toMatchObject({
      ...RESPONSE.jsonInternalError,
      message: error
    });
    expect(body).toHaveProperty('data');
    expect(statusCode).toEqual(INTERNAL_SERVER_ERROR);
  });

  it('should convert JSON string to JSON', async () => {
    let { body } = await send(BODY.jsonAsText, MIMES.json, MIMES.json);
    body = JSON.parse(body);
    expect(body).toEqual(RESPONSE.jsonTextToJson);
  });
});

describe('core-server.Formatter.sendHTML', () => {
  // TODO: core-server.Formatter.sendHTML
});
describe('core-server.Formatter.sendText', () => {
  // TODO: core-server.Formatter.sendText
});
describe('core-server.Formatter.sendXML', () => {
  // TODO: core-server.Formatter.sendXML
});
describe('core-server.Formatter.sendCSV', () => {
  // TODO: core-server.Formatter.sendCSV
});
describe('core-server.Formatter.sendStream', () => {
  // TODO: core-server.Formatter.sendStream
});

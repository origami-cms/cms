import { Route } from '@origami/core-lib';

import 'jest-extended';
import { TestServer } from '../../../../../../lib/testing';
import { statuses as ln } from '../../../statuses';
const statuses = ln.enUS;

describe('core-server.middleware.format', () => {
  let ts: TestServer;

  beforeEach(async () => {
    ts = new TestServer();
    await ts.init();
    await ts.serve();
  });

  afterEach(() => ts.stop());

  it('skip formatting if headers are already sent', async () => {
    const content = 'Hello';
    ts.server!.useRouter(
      new Route('/').get((req, res, next) => {
        res.send(content);
        next();
      })
    );
    const body = await ts.request('/');
    expect(body).toEqual(content);
  });

  it('response with res.locals.content.set(responseCode)', async () => {
    const responseCode = 'auth.success.login';
    ts.server!.useRouter(
      new Route('/').get((req, res, next) => {
        res.locals.content.responseCode = responseCode;
        res.contentType('json');
        next();
      })
    );
    const response = await ts.request('/', true);
    ts.expectResponseCode(response, responseCode);
  });

  it('sends HTML from ...set(string) and Accept: text/html', async () => {
    const content = 'Hello';
    ts.server!.useRouter(
      new Route('/').get((req, res, next) => {
        res.locals.content.set(content);
        next();
      })
    );
    const response = await ts.requestHTML('/', true);
    expect(response.body).toEqual(content);
    expect(response.headers).toContainKey('content-type');
    expect(response.headers['content-type']).toMatch(/^text\/html/);
  });

  it('sends JSON from ...set(string) and Accept: application/json', async () => {
    const content = 'Hello';
    ts.server!.useRouter(
      new Route('/').get((req, res, next) => {
        res.locals.content.set(content);
        next();
      })
    );
    const response = await ts.requestJSON('/', true);

    ts.expectJSON(response, undefined, undefined, {
      data: content
    });
    expect(response.headers).toContainKey('content-type');
    expect(response.headers['content-type']).toMatch(/^application\/json/);
  });

  it('sends Text from ...set(string) and Accept: text/plain', async () => {
    const content = 'Hello';
    ts.server!.useRouter(
      new Route('/').get((req, res, next) => {
        res.locals.content.set(content);
        next();
      })
    );
    const response = await ts.request('/', true, {
      headers: { Accept: 'text/plain' }
    });
    expect(response.body).toEqual(content);
    expect(response.headers).toContainKey('content-type');
    expect(response.headers['content-type']).toMatch(/^text\/plain/);
  });
});

import { Origami, OrigamiError, Route } from '@origami/core-lib';
// @ts-ignore
import getPort from 'get-port';
import http from 'http-status-codes';
import 'jest-extended';
import { Headers } from 'request';
import request, { RequestPromiseOptions } from 'request-promise-native';
import { status } from '../../packages/core-server/src/lib/status';
import { Server } from '../../packages/core-server/src/Server';
import { storeCreate } from './store';

export class ErrorTestServerNotInitialized extends OrigamiError {
  constructor() {
    super(
      'Test',
      'ServerNotInitialized',
      'Test server is not initialized. Try calling init() first'
    );
  }

}

export interface RequestResponse {
  statusCode: number;
  headers: Headers;
  // response: Response,
  body: string | object;
}

export class ErrorRequestResponse extends Error implements Partial<RequestResponse> {
  constructor(
    public statusCode: number,
    // public response: Response,
    public body: string | object
  ) {
    super();
  }
}

export class TestServer {

  get port() {
    return this._config!.port!;
  }
  set port(v: number) {
    this._config!.port = v;
    // @ts-ignore
    if (this.server) this.server._options.port = v;
  }
  public server?: Server;
  public store?: Origami.Store.Store;


  private _config?: Partial<Origami.ConfigServer> = {};
  private _forcePort?: number;

  public async init(
    config: Partial<Origami.ConfigServer> = {},
    store: boolean | string = true,
    plugins: string[] | false = false
  ) {

    this._config = config;
    if (process.env.PORT) this._forcePort = parseInt(process.env.PORT);
    else if (this._config.port) this._forcePort = this._config.port;

    if (store) this.store = await storeCreate(store);
    this.server = new Server(this._config, this.store);
    if (plugins) {
      await Promise.all(
        plugins.map((p) => this.server!.plugin(p))
      );
    }

    return this.server;
  }

  public async serve() {
    if (!this.server) throw new ErrorTestServerNotInitialized();
    try {
      if (!this._forcePort) await this._refreshPort();
      return await this.server.serve();
    } catch {
      // @ts-ignore
      await this._refreshPort();
      return this.server.serve();
    }
  }

  public async stop() {
    if (!this.server) throw new ErrorTestServerNotInitialized();
    this.server.stop();
  }

  public sleep(time = 100) {
    new Promise((res) => setTimeout(res, time));
  }

  public mountErrorMW(
    error: string | Error = 'general.errors.internal',
    statusCode?: number,
    url: string = '/',
    async: boolean = true
  ) {
    if (!this.server) throw new ErrorTestServerNotInitialized();

    const err = error instanceof Error
      ? error
      : new Error(error) as Origami.Server.DataError;

    if (statusCode) (err as Origami.Server.DataError).statusCode = statusCode;

    this.server.useRouter(
      // @ts-ignore
      new Route(url).get((req, res, next) => {
        if (async) throw err;
        else next(err);
      })
    );
  }

  public request(url?: string): Promise<string>;
  public request(url: string, complex: true): Promise<RequestResponse>;
  public request(url: string, complex: true, options?: Partial<RequestPromiseOptions>): Promise<RequestResponse>;
  public async request(
    url?: string,
    complex?: boolean,
    options?: Partial<RequestPromiseOptions>
  ): Promise<RequestResponse | string> {
    return this._request(url, complex, options);
  }

  public requestHTML(url?: string): Promise<string>;
  public requestHTML(url?: string, complex?: boolean): Promise<RequestResponse>;
  public async requestHTML(url?: string, complex?: boolean): Promise<RequestResponse | string> {
    return this._request(url, complex, {
      headers: {
        Accept: 'text/html'
      }
    });
  }

  public requestJSON(url?: string): Promise<object>;
  public requestJSON(url?: string, complex?: boolean): Promise<RequestResponse>;
  public async requestJSON(url?: string, complex?: boolean): Promise<RequestResponse | object> {
    return this._request(url, complex, { json: true });
  }


  public expectJSON(
    response: RequestResponse,
    message?: string,
    statusCode: number = http.OK,
    extra: object = {}
  ) {
    return this._matchResponse(response, message, statusCode, extra);
  }

  public expectResponseCode(
    response: RequestResponse,
    responseCode: string,
    extra: object = {}
  ) {
    const { code: statusCode, message } = status('enUS', responseCode);

    return this._matchResponse(response, message, statusCode, extra);
  }

  public expectError(
    error: ErrorRequestResponse,
    message?: string | Error | false,
    statusCode: number = http.INTERNAL_SERVER_ERROR,
    extra: object = {}
  ) {
    let m = message;
    if (message) m = (message instanceof Error) ? message.message : message;
    return this._matchResponse(error, m as string, statusCode, extra);
  }

  private async _refreshPort(): Promise<number> {
    return this.port = await getPort(this._forcePort);
  }

  private async _request(
    url: string = '/',
    complex?: boolean,
    options: Partial<RequestPromiseOptions> = {}
  ) {
    try {
      const res = await request.get({
        url: `http://localhost:${this._config!.port}${url}`,
        resolveWithFullResponse: true,
        ...options
      });

      return complex ? res.toJSON() : res.body;

    } catch (e) {
      const _e = e as any;
      throw new ErrorRequestResponse(
        _e.statusCode,
        _e.error,
        //  _e.response
      );
    }
  }


  private _matchResponse(
    response: RequestResponse | ErrorRequestResponse,
    message?: string,
    statusCode?: number,
    extra: object = {}
  ) {
    expect(response.statusCode).toEqual(statusCode);
    let body = response.body;

    // If error is a string, try casting to JSON
    if (typeof body === 'string') {
      try { body = JSON.parse(body); } catch { }
    }
    const match: any = {
      statusCode,
      ...extra
    };
    if (message) match.message = message;

    expect(body).toBeObject();
    expect(body).toMatchObject(match);
  }
}

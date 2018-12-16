import { Origami } from '@origami/core-lib';
import {
  FORBIDDEN,
  INTERNAL_SERVER_ERROR,
  NOT_FOUND,
  UNAUTHORIZED
} from 'http-status-codes';
import js2xmlParser from 'js2xmlparser';
// @ts-ignore
import json2csv from 'json-2-csv';
import { Writable } from 'stream';
import { promisify } from 'util';
import { ResponseContent } from '../../../lib/Content';
import { jsonToTable } from './jsonToTable';
import { wrapHTML } from './wrapHTML';
const json2csvPromise = promisify(json2csv.json2csv);

interface ReturningJSON {
  statusCode: number;
  data?: object | string | boolean | number;
  message?: string;
}

export class Formatter {
  public body: ResponseContent | false;
  public type: string;

  constructor(
    public res: Origami.Server.Response,
    public accept?: string,
    public message?: string
  ) {
    this.body = res.locals.content.get();

    // Set the type to the returning data, or the accepted data
    let t = res.get('Content-Type') || accept;
    // If there's no type, or it's set to accept anything, set it to plain text
    if (!t || t === '*/*') t = 'text/plain';
    // If the type is multiple, select the first one as preferred
    if (t) t = t.split(',')[0].split(';')[0];

    // Force casting depending on body type if req does not need specific type
    if (!accept || accept === '*/*') {
      switch (typeof this.body) {
        case 'object':
          t = 'application/json';
      }
    }

    res.contentType(t);
    this.type = t;
  }

  public async send() {
    switch (this.type.toLowerCase()) {
      case 'application/json':
        return this.sendJSON();

      case 'text/html':
        return this.sendHTML();

      case 'text/csv':
        return this.sendCSV();

      case 'text/xml':
      case 'application/xml':
        return this.sendXML();

      case 'text/plain':
      case 'text/css':
      default:
        return this.sendText();
    }
  }

  /**
   * Send JSON response
   */
  public async sendJSON() {
    const body = this.body;
    const message = this.message;
    const res = this.res;

    // If no body, return JSON 404
    if (!body && !message) {
      return res.status(NOT_FOUND).json({
        statusCode: NOT_FOUND,
        message: 'Not found'
      } as ReturningJSON);
    }

    // Convert string to JSON response...
    if (typeof body === 'string') {
      // Attempt to parse the body as JSON, otherwise send as string in data
      const _body = this._isJSON(body);
      return this._sendJSON(_body || body);

      // If body is a stream, send it as a stream instead
    } else if (body instanceof Writable) {
      return this.sendStream();
      return;

      // Else send as normal JSON
    } else return this._sendJSON(body);
  }

  /**
   * Send HTML response
   */
  public async sendHTML() {
    const body = this.body;
    const message = this.message;
    const res = this.res;

    // If there is no body
    if (!body) {
      if (res.statusCode === NOT_FOUND) res.redirect(`/${NOT_FOUND}`);
      else if (res.statusCode === NOT_FOUND) res.redirect(`/${NOT_FOUND}`);
      else if (res.statusCode === FORBIDDEN) res.redirect(`/${FORBIDDEN}`);
      else if (res.statusCode === UNAUTHORIZED) {
        res.redirect(`/${UNAUTHORIZED}`);
      } else if (message) {
        if (process.env.NODE_ENV !== 'production') {
          res.redirect(`/${INTERNAL_SERVER_ERROR}`);
        } else this._sendHTML(message);
      } else res.redirect(`/${NOT_FOUND}`);

      return;
    }

    // Send as HTML
    if (typeof body === 'string') res.send(body);
    // Cast it
    else {
      if (this._isJSON(body)) this._sendHTML(jsonToTable(body));
      else if (body instanceof Writable) return this.sendStream();
      else return this.sendJSON();
    }
  }

  /**
   * Send Text response
   */
  public async sendText() {
    this.res.send(this.body || this.message);
  }

  /**
   * Send XML response
   */
  public async sendXML() {
    const body = this.body;
    const res = this.res;

    if (this._isJSON(body)) res.send(js2xmlParser.parse('result', body));
    else res.send(body);
  }

  /**
   * Send CSV response
   */
  public async sendCSV() {
    const body = this.body;
    const res = this.res;

    if (this._isJSON(body)) {
      res.send(await json2csvPromise(body));
    } else res.send(body);
  }

  /**
   * Send Stream response
   */
  public async sendStream() {
    this.res.pipe(this.body as Writable);
  }

  private _isJSON(obj: any) {
    try {
      return JSON.parse(obj);
    } catch (e) {
      return false;
    }
  }

  private _sendJSON(data: any) {
    const obj = {
      statusCode: this.res.statusCode
    } as ReturningJSON;

    if (data || data === 0) obj.data = data;

    if (this.message) obj.message = this.message;

    return this.res.json(obj);
  }

  private _sendHTML(html: string) {
    this.res.send(wrapHTML(`${this.res.statusCode} - ${this.message}`, html));
  }
}

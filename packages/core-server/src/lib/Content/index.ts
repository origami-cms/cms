import { Writable } from 'stream';
import { ErrorContentHasCode, ErrorContentHasContent } from './errors';

export interface ResponseData {
  [key: string]: any;
}

export type ResponseContent = string | ResponseData | Writable;


export class Content {
  private _content?: ResponseContent;
  private _responseCode: string | false = false;

  get responseCode(): string | false {
    return this._responseCode;
  }
  set responseCode(code: string | false) {
    if (this._responseCode) { throw new ErrorContentHasCode(); }
    this._responseCode = code;
  }

  get hasContent(): boolean {
    return Boolean(this._content);
  }

  public override(content: ResponseContent): void {
    this._content = content;
  }

  public set(content: ResponseContent): void {
    if (this.hasContent) { throw new ErrorContentHasContent(); }
    this._content = content;
  }

  public get(): ResponseContent | void {
    if (!this.hasContent) { return; }
    return this._content!;
  }

  public clear() {
    this._content = undefined;
    this._responseCode = false;
  }
}

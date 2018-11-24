import { Readable, Writable } from 'stream';
import { OrigamiError } from './OrigamiError';

export class ErrorMissingKey extends OrigamiError {
  constructor(public key: string) {
    super(
      'Lib',
      'MissingKey',
      `Missing key '${key}'`
    );
  }
}


/**
 * Ensure all the keys are present on the object
 */
export const requireKeys = (arr: string[], obj: { [key: string]: any }): true => {
  arr.forEach((i) => {
    if (!Object.keys(obj).includes(i)) throw new ErrorMissingKey(i);
  });
  return true;
};


// export const streamToString = (
//     stream: Writable | Readable,
//     enc?: 'string'
// ): Promise<string> => new Promise((res, rej) => {
//     let str = '';
//     stream.on('data', data => {
//         str += (typeof enc === 'string') ? data.toString(enc) : data.toString();
//     });
//     stream.on('end', () => res(str));
//     stream.on('error', e => rej(e));
// });

export class ErrorRegexConcatType extends TypeError {
  public name = 'RegexConcatType';
  constructor(value: any) {
    super();
    this.message = `Value '${value.toString()}' (${
      typeof value}) is not a valid concatenation value`;
  }
}

export const regexConcat = (r1: RegExp | string | number, r2: RegExp | string | number) => {
  if ((!(r1 instanceof RegExp)) && typeof r1 !== 'string' && typeof r1 !== 'number') {
    throw new ErrorRegexConcatType(r1);
  }
  if ((!(r2 instanceof RegExp)) && typeof r2 !== 'string' && typeof r2 !== 'number') {
    throw new ErrorRegexConcatType(r2);
  }

  const _r1 = (!(r1 instanceof RegExp)) ? new RegExp(r1.toString()) : r1;
  const _r2 = (!(r2 instanceof RegExp)) ? new RegExp(r2.toString()) : r2;
  return new RegExp(
    _r1.source + _r2.source,
    (_r1.flags + _r2.flags).split('').sort().join('').replace(/(.)(?=.*\1)/g, '')
  );
};

export const flatten = (arr: any[]) => [].concat.apply([], arr);

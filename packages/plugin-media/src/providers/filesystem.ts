import { Origami } from '@origami/core';
import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import { PluginOptionsFileSystem } from '../';
import { thumbnail } from '../lib/thumbnail';

// @ts-ignore
import { mkdir as mkdirAsync } from 'mkdir-recursive';
import { Readable, Stream, Writable } from 'stream';
const writeFile = promisify(fs.writeFile);
const stat = promisify(fs.stat);
const mkdir = promisify(mkdirAsync);

let location: string;

export const initialize = async (options: PluginOptionsFileSystem) => {
  location = path.resolve(process.cwd(), options.location || 'media');

  try {
    await stat(location);
  } catch (e) {
    mkdir(location);
  }
};

// @ts-ignore
export interface Req extends Origami.Server.Request {
  files?: {
    [key: string]: {
      name: string;
      mimetype: string;
      provider?: string;
      data: Buffer;
    };
  };
}

export const handlerCreate = (
  options: PluginOptionsFileSystem
  // @ts-ignore
): Origami.Server.RequestHandler => async (req: Req, res, next) => {
  if (!req.files) {
    next(new Error('No files uploaded'));
    return;
  }

  const [, file] = Object.entries(req.files)[0];

  const m = res.app.get('store').model('media');

  try {
    const data = (await m.create({
      name: file.name,
      type: file.mimetype,
      provider: file.provider,
      author: req.jwt.data.userId
    })) as { id: string };

    const fp = path.resolve(location, data.id);
    // tslint:disable-next-line no-floating-promises
    writeFile(fp, file.data);
    res.locals.content.set(data);

    next();
  } catch (e) {
    next(e);
  }
};

export const handlerGet = (
  options: PluginOptionsFileSystem
): Origami.Server.RequestHandler => async (req, res, next) => {
  const m = res.app.get('store').model('media');
  interface MediaResource {
    id: string;
    type: string;
  }
  const file = (await m.find({ id: req.params.mediaId })) as MediaResource;
  if (!file) {
    res.locals.responseCode = 'resource.errors.notFound';
    next();
    return;
  }
  res.header('content-type', file.type);


  try {
    let stream: Readable = fs.createReadStream(path.resolve(location, file.id));

    if (req.query.width) {
      const width = parseInt(req.query.width);
      if (typeof width === 'number') {
        stream = stream.pipe(thumbnail(width)) as Readable;
      }
    }

    res.locals.content.set(stream);
    next();


  } catch (e) {
    next(e);
  }
};

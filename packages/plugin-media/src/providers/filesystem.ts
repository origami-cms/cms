import { Origami } from '@origami/core';
import fs from 'fs';
// @ts-ignore
import { mkdir as mkdirAsync } from 'mkdir-recursive';
import path from 'path';
import { Readable } from 'stream';
import { promisify } from 'util';
import { MediaResource, PluginOptionsFileSystem } from '../';
import { parseImg } from '../lib/parseImg';

const writeFile = promisify(fs.writeFile);
const deleteFile = promisify(fs.unlink);
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

  const file = (await m.find({ id: req.params.mediaId })) as MediaResource;
  if (!file) {
    res.locals.responseCode = 'resource.errors.notFound';
    next();
    return;
  }
  res.header('content-type', file.type);


  const stream: Readable = fs.createReadStream(path.resolve(location, file.id));
  stream.on('error', (err) => {
    next(err);
    return;
  });

  // @ts-ignore Is a stream
  parseImg(file, stream, req, res, next);
};


/**
 * Delete a media resource from the filesystem and mark as deleted in DB
 */
export const handlerDelete = (options: PluginOptionsFileSystem): Origami.Server.RequestHandler =>
  async (req, res, next) => {
    // Lookup file in database first
    const m = res.app.get('store').model('media') as Origami.Store.Model;

    const file = (await m.find({ id: req.params.mediaId })) as MediaResource;

    if (!file) {
      next();
      return;
    }

    await deleteFile(path.resolve(location, file.id));


    try {
      await m.delete(file.id);
      res.locals.content.responseCode = 'resource.success.deleted';
      next();
    } catch (e) {
      next(e);
    }
  };

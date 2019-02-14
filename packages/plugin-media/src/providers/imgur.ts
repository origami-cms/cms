import { Origami } from '@origami/core';
// tslint:disable-next-line match-default-export-name
import request from 'request-promise-native';
import { MediaPostReq, PluginOptionsImgur } from '..';
import { parseImg } from '../lib/parseImg';


export const initialize = async (options: PluginOptionsImgur) => {};


interface MediaResource {
  id: string;
  type: string;
  providerInfo: {
    id: string;
    deleteHash: string;
  };
}


export const handlerCreate = (
  options: PluginOptionsImgur
  // @ts-ignore
): Origami.Server.RequestHandler => async (req: MediaPostReq, res, next) => {
  if (!req.files) {
    next(new Error('No files uploaded'));
    return;
  }

  const [, file] = Object.entries(req.files)[0];

  // tslint:disable-next-line await-promise
  const r = await request({
    uri: 'https://api.imgur.com/3/image',
    method: 'POST',
    headers: {
      Authorization: `Client-ID ${options.clientID}`
    },

    formData: {
      image: file.data,
      type: 'file'
    },
    json: true
  });

  const m = res.app.get('store').model('media');

  try {
    const data = (await m.create({
      name: file.name,
      type: file.mimetype,
      provider: 'imgur',
      author: req.jwt.data.userId,
      providerInfo: {
        id: r.data.id,
        deleteHash: r.data.deletehash
      }
    })) as { id: string };

    res.locals.content.set(data);

    next();

  } catch (e) {
    next(e);
  }
};


export const handlerGet = (
  options: PluginOptionsImgur
): Origami.Server.RequestHandler => async (req, res, next) => {
  const m = res.app.get('store').model('media');


  const file = (await m.find({ id: req.params.mediaId })) as MediaResource;
  if (!file) {
    res.locals.responseCode = 'resource.errors.notFound';
    next();
    return;
  }
  res.header('content-type', file.type);


  const fileID = file.providerInfo.id;
  const fileType = file.type.split('/').pop();
  const stream = request(`https://imgur.com/${fileID}.${fileType}`);

  stream.on('response', (r) => {
    res.setHeader('etag', r.headers.etag as string);
    res.setHeader('content-type', r.headers['content-type']!);
    res.setHeader('content-length', r.headers['content-length']!);
    res.setHeader('cache-control', 'public, max-age=31536000');
  });

  stream.catch((err) => {
    next(err);
    return;
  });

  // @ts-ignore Is a stream
  parseImg(file, stream, req, res, next);
};


/**
 * Delete a media resource from Imgur and mark as deleted in DB
 */
export const handlerDelete = (options: PluginOptionsImgur): Origami.Server.RequestHandler =>
  async (req, res, next) => {
    // Lookup file in database first
    const m = res.app.get('store').model('media') as Origami.Store.Model;

    const file = (await m.find({ id: req.params.mediaId })) as MediaResource;

    if (!file) {
      next();
      return;
    }

    // tslint:disable-next-line await-promise
    const r = await request({
      uri: `https://api.imgur.com/3/image/${file.providerInfo.deleteHash}`,
      method: 'DELETE',
      headers: {
        Authorization: `Client-ID ${options.clientID}`
      },
      json: true
    });

    try {
      await m.delete(file.id);
      res.locals.content.responseCode = 'resource.success.deleted';
      next();
    } catch (e) {
      next(e);
    }
  };

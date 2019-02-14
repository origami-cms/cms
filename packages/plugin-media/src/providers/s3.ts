import { Origami } from '@origami/core';
import aws from 'aws-sdk';
// tslint:disable-next-line no-submodule-imports
import { HeadObjectRequest } from 'aws-sdk/clients/s3';
import { MediaPostReq, MediaResource, PluginOptionsS3 } from '..';
import { parseImg } from '../lib/parseImg';
let s3: aws.S3;


/**
 * Setup AWS S3 bucket
 */
export const initialize = async (options: PluginOptionsS3) => {
  s3 = new aws.S3({
    region: options.region,
    accessKeyId: options.key,
    secretAccessKey: options.secret,
    params: {
      Bucket: options.bucket
    }
  });
};


/**
 * Upload to S3 and create the DB entry
 */
export const handlerCreate = (): Origami.Server.RequestHandler =>
  // @ts-ignore
  async (req: MediaPostReq, res, next) => {
    if (!req.files) {
      next(new Error('No files uploaded'));
      return;
    }

    const [, file] = Object.entries(req.files)[0];
    const m = res.app.get('store').model('media');

    // Create the object in the database first for the ID
    let data: MediaResource;
    try {
      data = (await m.create({
        name: file.name,
        type: file.mimetype,
        provider: 's3',
        author: req.jwt.data.userId
      })) as MediaResource;

    } catch (e) {
      next(e);
      return;
    }

    if (!data) {
      next();
      return;
    }

    // Create in S3 with the generated file id
    await new Promise((resolve, rej) => {
      s3.putObject({
        // @ts-ignore It does exist
        Body: file.data,
        Key: data.id,
        ContentType: file.mimetype
      })

        .on('httpUploadProgress', (progress: aws.S3.ProgressEvent) => { })

        .send((err: string, d: object) => {
          if (err) rej(err);
          resolve(d);
        });
    });

    if (data) res.locals.content.set(data);
    next();
  };


/**
 * Retrieve a media resource and stream from S3
 */
export const handlerGet = (): Origami.Server.RequestHandler =>
  async (req, res, next) => {
    // Lookup file in database first
    const m = res.app.get('store').model('media');

    const file = (await m.find({ id: req.params.mediaId })) as MediaResource;

    if (!file) {
      next();
      return;
    }

    const params = {
      Key: file.id
    } as HeadObjectRequest;

    let data: aws.S3.HeadObjectOutput;
    try {
      data = await s3.headObject(params).promise();
    } catch (e) {
      next(e);
      return;
    }

    if (data.ContentType) res.contentType(data.ContentType);

    // TODO: Investigate if data.LastModified is actually a date
    // @ts-ignore
    if (data.LastModified) res.set('Last-Modified', data.LastModified as string);
    if (data.ETag) res.set('ETag', data.ETag);

    const stream = s3.getObject(params).createReadStream();

    // forward errors
    stream.on('error', (err) => {
      next(err);
      return;
    });

    parseImg(file, stream, req, res, next);
  };

/**
 * Delete a media resource from S3 and mark as deleted in DB
 */
export const handlerDelete = (options: PluginOptionsS3): Origami.Server.RequestHandler =>
  async (req, res, next) => {
    // Lookup file in database first
    const m = res.app.get('store').model('media') as Origami.Store.Model;

    const file = (await m.find({ id: req.params.mediaId })) as MediaResource;

    if (!file) {
      next();
      return;
    }

    // tslint:disable-next-line await-promise
    const r = await s3.deleteObject({Key: file.id, Bucket: options.bucket});

    try {
      await m.delete(file.id);
      res.locals.content.responseCode = 'resource.success.deleted';
      next();
    } catch (e) {
      next(e);
    }
  };

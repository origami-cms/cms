import { Origami } from '@origami/core';
import Color from 'color';
import sharp from 'sharp';
import { Readable } from 'stream';

export const parseImg = (
  stream: Readable,
  req: Origami.Server.Request,
  res: Origami.Server.Response,
  next: Origami.Server.NextFunction
) => {
  let s = stream;

  try {
    let _modify = sharp();
    _modify.on('error', (err) => {
      next(err);
      return;
    });


    let width;
    if (req.query.width) width = parseInt(req.query.width);

    let height;
    if (req.query.height) height = parseInt(req.query.height);

    let left;
    if (req.query.left) left = parseInt(req.query.left);

    let top;
    if (req.query.top) top = parseInt(req.query.top);

    let fit;
    if (req.query.fit) fit = req.query.fit;

    let position;
    if (req.query.position) position = req.query.position.replace(/-/gm, ' ');

    let background = 'black';
    if (req.query.bg) background = Color(req.query.bg).hex();

    // Crop image
    if (top !== undefined && left !== undefined && width !== undefined && height !== undefined) {
      _modify = _modify.extract({top, left, width, height});

    // Resize image
    } else if (width || height) {
      const resize: sharp.ResizeOptions = {};
      if (fit) resize.fit = fit;
      if (position) resize.position = position;
      if (background) resize.background = background;

      _modify = _modify.resize(width, height, resize);
    }


    s = s.pipe(_modify);

    res.locals.content.set(s);
    next();

  } catch (e) {
    next(e);
  }
};

import { Origami } from '@origami/core-lib';
import { Content } from '../lib/Content';

export const content: Origami.Server.RequestHandler = async (req, res, next) => {
    // @ts-ignore TODO: Merge
  res.locals.content = new Content();
  next();
};

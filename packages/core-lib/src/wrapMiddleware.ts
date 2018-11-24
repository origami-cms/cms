import { Origami } from './types/Origami';

/**
 * Wrap middleware to catch async errors
 * @param mw Middleware to wrap and catch all async errors
 */
export const wrapMiddleware = (mw: Origami.Server.RequestHandler): Origami.Server.RequestHandler =>
  async (req, res, next) => {
    try {
      await mw(req, res, next);
    } catch (e) {
      next(e);
    }
  };

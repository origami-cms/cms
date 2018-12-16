import { Origami } from '@origami/core';

/*
 * Set the initial data array to add pages to
 */
export const store = (): Origami.Server.RequestHandler => async (
  req,
  res,
  next
) => {
  const sm = res.locals.content.get() as any;

  // Get 'page' resources (origami-app-theme)
  try {
    const pages = await res.app
      .get('store')
      .model('page')
      .find();
    pages.map((p: any) => sm.add({ url: p.url }));
  } catch (e) {}

  next();
};

import { Origami } from '@origami/core';
// @ts-ignore
import Sitemap from 'sitemap';
import { SitemapPluginSettings } from '..';

/*
 * Inject the sitemap into the response
 */
export const preStore = (
  sitemap: any,
  settings: SitemapPluginSettings
): Origami.Server.RequestHandler => (req, res, next) => {
  const sm = Sitemap.createSitemap({
    urls: sitemap.urls
  });
  res.locals.content.set(sm);
  next();
};

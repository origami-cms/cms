import { Origami } from '@origami/core';
import { SitemapItem, SitemapPluginSettings } from '..';

/*
 * Render the Sitemap to the response
 */
export const render = (
  settings: SitemapPluginSettings
): Origami.Server.RequestHandler => (req, res, next) => {
  const sm = res.locals.content.get() as any;
  if (sm && sm.toString) {
    switch (settings.format) {
      case 'txt':
        res.locals.content.override(
          sm.urls.map((item: SitemapItem) => settings.hostname + item.url).join('\n')
        );
        res.contentType('text/plain');
        break;

      default:
      case 'xml':
        res.locals.content.override(sm.toString());
        res.contentType('xml');
    }
  }
  next();
};

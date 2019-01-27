import { Origami } from '@origami/core';
import path from 'path';
// tslint:disable-next-line match-default-export-name
import readdir from 'recursive-readdir';
import { SitemapItem } from '..';

/**
 * Publicly hosted directories
 * Load all html pages from public locations recursively
 */
export const publicFiles = async (
  config: Origami.Config
): Promise<SitemapItem[] | false> => {
  let staticDir;
  if (config.server && config.server.static) staticDir = config.server.static;

  if (!staticDir || staticDir === true) staticDir = 'public';
  if (!(staticDir instanceof Array)) staticDir = [staticDir];

  let items: SitemapItem[] = [];

  await Promise.all(staticDir.map(async (d) => {
    const dir = path.resolve(process.cwd(), d);

    items = items.concat(await Promise.all(
      (await readdir(dir))
        // Remove non html files
        .filter((f) => f.endsWith('.html'))
        // Convert to SitemapItem
        .map(async (f) => {
          // Remove HTML extension
          let url = path.relative(dir, f).slice(0, '.html'.length * -1);
          // Remove the /index
          if (url.endsWith('index')) url = url.slice(0, 'index'.length * -1);

          return {
            url: `/${url}`,
            changeFreq: 'daily',
            lastmodfile: f
          } as SitemapItem;
        })
    ));
  }));

  return items;
};

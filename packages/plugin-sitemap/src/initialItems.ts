import { config } from '@origami/core';
import { SitemapItem } from '.';
import { appPages } from './integrations/appPages';
import { publicFiles } from './integrations/publicFiles';

const integrations = [appPages, publicFiles];

export const initialItems = async (sm: any): Promise<SitemapItem[]> => {
  let items: SitemapItem[] = [];
  const conf = await config.read();

  if (conf) {
    await Promise.all(
      integrations.map(async (i) => {
        try {
          const newItems = await i(conf);

          if (newItems) items = items.concat(newItems);
        } catch {}
      })
    );
  }

  items.forEach(sm.add.bind(sm));
  return items;
};

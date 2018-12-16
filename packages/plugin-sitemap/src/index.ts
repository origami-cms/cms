import { Route, Server } from '@origami/core';
// @ts-ignore
import sitemap from 'sitemap';
import { initialItems } from './initialItems';
import { preStore } from './positions/preStore';
import { render } from './positions/render';
import { store } from './positions/store';

export type ChangeFreqType =
  | 'always'
  | 'hourly'
  | 'daily'
  | 'weekly'
  | 'monthly'
  | 'yearly'
  | 'never';

export type SitemapItem = {
  url: string;
  changeFreq?: ChangeFreqType;
  priority?: number;
  lastmodfile?: string;
};

export interface SitemapPluginSettings {
  hostname: string;
  cacheTime?: number;
  format?: 'xml' | 'txt';
  items?: SitemapItem[];
}

const DEFAULT_SETTINGS: Partial<SitemapPluginSettings> = {
  format: 'xml',
  cacheTime: 600000,
  items: []
};

// tslint:disable-next-line no-default-export export-name
export default async (
  server: Server,
  settings: Partial<SitemapPluginSettings> = DEFAULT_SETTINGS
) => {
  const _settings = {
    ...DEFAULT_SETTINGS,
    ...settings
  } as SitemapPluginSettings;

  const sm = sitemap.createSitemap({
    hostname: settings.hostname,
    cacheTime: settings.cacheTime
  });

  await initialItems(sm);

  if (!_settings.hostname) {
    throw new Error('SitemapPlugin: no hostname provided');
  }
  if (!_settings.format) throw new Error('SitemapPlugin: no format provided');

  server.useRouter(
    new Route(`/sitemap.${_settings.format}`)

      /*
       * Set the initial data array to add pages to
       */
      .position('pre-store')
      .get(preStore(sm, _settings))

      /*
       * Fetch the actual pages
       */
      .position('store')
      .get(store())

      /*
       * Render the list of pages into a xml format
       */
      .position('render')
      .get(render(_settings))
  );
};

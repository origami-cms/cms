import { Origami } from '@origami/core';
import fs from 'fs';
import path from 'path';
import { SitemapItem } from '..';

/**
 * ORIGAMI-APP-PAGES
 * Attempt to load pages from theme directory
 */
export const appPages = async (
  config: Origami.Config
): Promise<SitemapItem[] | false> => {
  if (
    config.apps &&
    typeof config.apps.pages === 'object' &&
    // @ts-ignore
    config.apps.pages.theme
  ) {
    // @ts-ignore
    const theme: string = config.apps.pages.theme;
    let pagesDir: string;
    if (theme.startsWith('/') || theme.startsWith('./')) {
      pagesDir = path.join(process.cwd(), theme, 'views/pages');
    } else {
      pagesDir = path.join(process.cwd(), 'node_modules', theme, 'views/pages');
    }

    // List all files without extensions and convert to SitemapItem
    return (
      fs
        .readdirSync(pagesDir)
        // [Short path, full path]
        .map((f) => [f, path.join(pagesDir, f)])
        // Filter only for files
        .filter(([, full]) => fs.statSync(full).isFile())
        // Remove extensions
        .map(([f, full]) => [
          f
            .split('.')
            .slice(0, -1)
            .join('.'),
          full
        ])
        // Convert to SitemapItem
        .map(
          ([f, full]) =>
            ({
              url: `/${f}`,
              lastmodfile: full,
              priority: 0.8
            } as SitemapItem)
        )
    );
  }

  return false;
};

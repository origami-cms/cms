import { colors, config, info, Origami } from '@origami/core';
import { Origami as OrigamiApp } from '@origami/origami';
import opn from 'opn';
import path from 'path';

/**
 * Load and run the .origami file from a file or directory
 * @param entry Directory or file to load the Origami file from
 * @param open Open the project once it's running
 */
export const run = async (entry: string, open: boolean) => {
  let c: Origami.Config | false;

  c = await config.read(entry);

  if (c) {
    let origami = OrigamiApp;

    // Attempt to load a local instance of Origami in place of the CLI's default version
    try {
      origami = require(path.resolve(process.cwd(), 'node_modules/@origami/origami')).Origami;

    } catch (e) {
      // DEPRECATE: Remove origami-cms from CLI
      // Attempt to load old version
      try {
        origami = require(path.resolve(process.cwd(), 'node_modules/origami-cms')).Origami;
      } catch (e) {
        // No local installation
      }
    }

    // Run Origami
    const o = new origami(c);
    const port = c.server.port;

    // If there's a server port and the open option, load the project in
    // the browser
    if (port && open) {
      o.ready(async () =>
        opn(`http://localhost:${(c as Origami.Config).server.port}/`)
      );
    }

  } else {
    info(
      colors.grey('No Origami app found.\n    Try running:'),
      colors.purple('origami new'),
      colors.grey('to create a new app\n    See:'),
      colors.purple('origami --help'),
      colors.grey('for more details'));
  }
};

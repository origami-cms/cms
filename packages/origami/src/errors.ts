// tslint:disable export-name
import { colors, OrigamiError } from '@origami/core';

export class ErrorNoStoreType extends OrigamiError {
  constructor() {
    super('Origami', 'NoStoreType', 'No store type provided');
  }
}

export class ErrorStoreTypeNotFound extends OrigamiError {
  constructor(storeType: string) {
    const store = colors.yellow.bold(`origami-store-${storeType}`);
    super(
      'Origami',
      'StoreTypeNotFound',
      `Could not load store module ${store}. Are you sure you have it installed?`
    );
  }
}

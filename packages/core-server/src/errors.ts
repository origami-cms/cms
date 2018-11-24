import { OrigamiError } from '@origami/core-lib';

export class ErrorServerPortInUse extends OrigamiError {
          constructor(port: number | string) {
          super(
      'Server',
      'PortInUse',
      `Port '${port}' is already in use`
    );
        }
}

export class ErrorServerStoreNotConfigured extends OrigamiError {
          constructor() {
          super(
      'Server',
      'StoreNotConfigured',
      'Store is not configured'
    );
        }
}

export class ErrorServerUnknownNamedMiddleware extends OrigamiError {
          constructor(middleware: string) {
          super(
      'Server',
      'UnknownNamedMiddleware',
      `Named middleware '${middleware}' is not defined`
    );
        }
}

export class ErrorServerExistingNamedMiddleware extends OrigamiError {
          constructor(middleware: string) {
          super(
      'Server',
      'ExistingNamedMiddleware',
      `Middleware handler with name '${middleware}' already exists`
    );
        }
}


export class ErrorServerUnknownPlugin extends OrigamiError {
          constructor(plugin: string) {
          super(
      'Server',
      'UnknownPlugin',
      `Could not load plugin '${plugin}'`
    );
        }
}
export class ErrorServerPluginNotFunction extends OrigamiError {
          constructor(plugin: string) {
          super(
      'Server',
      'PluginNotFunction',
      `Plugin '${plugin}' does not export a function`
    );
        }
}

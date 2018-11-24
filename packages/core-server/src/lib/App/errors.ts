import { OrigamiError } from '@origami/core-lib';

export class ErrorAppManifestLoad extends OrigamiError {
  constructor(appName: string) {
    super(
      'App',
      'ManifestLoad',
      `There was an error loading app manifest for the '${appName}' app`
    );
  }
}

export class ErrorAppManifestPropertyMissing extends OrigamiError {
  constructor(appName: string, property: string) {
    super(
      'App',
      'ManifestPropertyMissing',
      `App '${appName}' is missing '${property}' in it's app manifest`
    );
  }
}

export class ErrorAppManifestIconInvalid extends OrigamiError {
  constructor(appName: string) {
    super(
      'App',
      'ManifestIconInvalid',
      `App '${appName}' has a wrong value for 'icon' in it's app manifest`
    );
  }
}

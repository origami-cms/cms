import {
  ErrorAppManifestIconInvalid,
  ErrorAppManifestLoad,
  ErrorAppManifestPropertyMissing
} from '../errors';

describe('core-server.App.errors', () => {
  const appName = 'foo';
  it('should create ErrorAppManifestLoad with right namespace, name and message', () => {
    expect(new ErrorAppManifestLoad(appName)).toMatchObject({
      namespace: 'App',
      name: 'ManifestLoad',
      message: `There was an error loading app manifest for the '${appName}' app`
    });
  });
  it('should create ErrorAppManifestPropertyMissing with right namespace, name and message', () => {
    const property = 'bar';
    expect(new ErrorAppManifestPropertyMissing(appName, property)).toMatchObject({
      namespace: 'App',
      name: 'ManifestPropertyMissing',
      message: `App '${appName}' is missing '${property}' in it's app manifest`
    });
  });
  it('should create ErrorAppManifestIconInvalid with right namespace, name and message', () => {
    expect(new ErrorAppManifestIconInvalid(appName)).toMatchObject({
      namespace: 'App',
      name: 'ManifestIconInvalid',
      message: `App '${appName}' has a wrong value for 'icon' in it's app manifest`
    });
  });
});

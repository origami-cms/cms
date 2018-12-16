import { Route, Server } from '@origami/core';
import { facebook } from './providers/facebook';


export interface SocialLoginSettings {
  host: string;
  facebook: {
    appId: string;
    appSecret: string;
    callbackUrl?: string;
  };
}

export const URI_PREFIX = '/api/v1/social-login';


// tslint:disable-next-line no-default-export export-name
export default (server: Server, settings: SocialLoginSettings) => {
  const socialLogin = new Route(URI_PREFIX);


  if (settings.facebook) {
    const fb = facebook(settings);
    if (fb) {
      fb.parent = socialLogin;
      socialLogin.nested.push(fb);
    }
  }


  server.useRouter(socialLogin);
};

import { Route, Server } from '@origami/core';
import { final } from './final/final';
import { facebook } from './providers/facebook';
import { google } from './providers/google';

export interface ProviderSettings {
  clientID: string;
  clientSecret: string;
  callbackUrl?: string;
}
export interface SocialLoginSettings {
  host: string;
  google: ProviderSettings;
  facebook: ProviderSettings;
}

export const URI_PREFIX = '/api/v1/social-login';


// tslint:disable-next-line no-default-export export-name
export default (server: Server, settings: SocialLoginSettings) => {
  const socialLogin = new Route(URI_PREFIX);

  // Nest the final route
  final.parent = socialLogin;
  socialLogin.nested.push(final);

  if (settings.facebook) {
    const fb = facebook(settings);
    if (fb) {
      fb.route.parent = socialLogin;
      socialLogin.nested.push(fb.route);
    }
  }

  if (settings.google) {
    const g = google(settings);
    if (g) {
      g.route.parent = socialLogin;
      socialLogin.nested.push(g.route);
    }
  }


  server.useRouter(socialLogin);
};

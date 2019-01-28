import { SocialLoginSettings } from '..';
import { Provider } from '../Provider';

export const facebook = (settings: SocialLoginSettings) => {
  if (!settings.facebook) return;

  return new Provider({
    provider: 'facebook',
    host: settings.host,
    clientID: settings.facebook.clientID,
    clientSecret: settings.facebook.clientSecret,
    authenticateURL: 'https://www.facebook.com/v3.2/dialog/oauth',
    getTokenURL: 'https://graph.facebook.com/v3.2/oauth/access_token',
    getUserURL: 'https://graph.facebook.com/v3.2/me',
    getUserQueryString: {
      fields: 'email,first_name,last_name'
    },
    mapUserData: {
      fname: 'first_name',
      lname: 'last_name',
      email: 'email',
    }
  });
};

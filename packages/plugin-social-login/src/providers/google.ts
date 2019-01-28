import { SocialLoginSettings } from '..';
import { Provider } from '../Provider';

export const google = (settings: SocialLoginSettings) => {
  if (!settings.google) return;

  return new Provider({
    provider: 'google',
    host: settings.host,
    clientID: settings.google.clientID,
    clientSecret: settings.google.clientSecret,
    authenticateURL: 'https://accounts.google.com/o/oauth2/v2/auth',
    authenticateQueryString: {
      response_type: 'code',
      scope: 'https://www.googleapis.com/auth/userinfo.profile+https://www.googleapis.com/auth/userinfo.email'
    },
    getTokenURL: 'https://www.googleapis.com/oauth2/v4/token',
    getUserURL: 'https://www.googleapis.com/oauth2/v1/userinfo?alt=json',
    mapUserData: {
      fname: 'given_name',
      lname: 'family_name',
      email: 'email'
    }
  });
};

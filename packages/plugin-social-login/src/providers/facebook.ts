import { error, Route } from '@origami/core';
import request from 'request-promise-native';
import { SocialLoginSettings, URI_PREFIX } from '..';

export const facebook = (settings: SocialLoginSettings) => {


  if (!settings.facebook.appId) {
    throw new Error('SocialLoginPlugin requires setting facebook.appId');
  } else if (!settings.facebook.appSecret) {
    throw new Error('SocialLoginPlugin requires setting facebook.appSecret');
  }

  const callback = '/callback';
  const callbackUrl = `${settings.host}${URI_PREFIX}/facebook${callback}`;

  const r = new Route('/facebook');


  // 1. Get a facebook code to convert into an access token
  r.get((req, res, next) => {
    // Redirect to facebook oauth
    res.redirect(`https://www.facebook.com/v3.2/dialog/oauth?client_id=${
      settings.facebook.appId
      }&redirect_uri=${callbackUrl}
      &scope=email
    `);
  });

  // 2. Convert to code into access token, and get user data
  r.route(callback).get(async (req, res, next) => {
    const {code} = req.query;

    // Convert code to access token
    const accessToken = await request({
      url: 'https://graph.facebook.com/v3.2/oauth/access_token',
      method: 'get',
      json: true,
      qs: {
        client_id: settings.facebook.appId,
        redirect_uri: callbackUrl,
        client_secret: settings.facebook.appSecret,
        code
      }
    });

    // Use access token to get user
    const user = await request({
      url: 'https://graph.facebook.com/v3.2/me',
      method: 'get',
      json: true,
      qs: {
        access_token: accessToken.access_token,
        fields: 'email,first_name,last_name'
      }
    });

    res.send(user);
  });


  return r;
};


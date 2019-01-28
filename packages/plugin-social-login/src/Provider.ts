// tslint:disable await-promise

import { auth, Origami, random, Route } from '@origami/core';
// tslint:disable-next-line match-default-export-name
import request from 'request-promise-native';
import { URI_PREFIX } from '.';


export interface ProviderOptions {
  host: string;
  provider: string;
  clientID: string;
  clientSecret: string;
  authenticateURL: string;
  authenticateQueryString?: object;
  getTokenURL: string;
  getUserURL: string;
  getUserQueryString?: object;
  mapUserData: MapUserData;
}

export interface MapUserData {
  fname: string;
  lname: string;
  email: string;
}

export interface User {
  id?: string;
  fname: string;
  lname: string;
  email: string;
}

export class Provider {
  public host: string;
  public provider: string;
  public route: Route;
  public clientID: string;
  public clientSecret: string;
  public authenticateURL: string;
  public authenticateQueryString?: object;
  public getTokenURL: string;
  public getUserURL: string;
  public getUserQueryString: object;
  public mapUserData: MapUserData;

  public socialUser?: User;
  public origamiUser?: User;

  constructor(options: ProviderOptions) {
    this.host = options.host;
    this.provider = options.provider;
    this.clientID = options.clientID;
    this.clientSecret = options.clientSecret;
    this.authenticateURL = options.authenticateURL;
    this.authenticateQueryString = options.authenticateQueryString || {};
    this.getTokenURL = options.getTokenURL;
    this.getUserURL = options.getUserURL;
    this.getUserQueryString = options.getUserQueryString || {};
    this.mapUserData = options.mapUserData;

    this.route = new Route(`/${this.provider}`);
    this.route.get(this.authenticate.bind(this));

    this.route.route('/callback').get(this.callback.bind(this));
  }

  get callbackURL() {
    return `${this.host}${URI_PREFIX}/${this.provider}/callback`;
  }

  /**
   * Redirect the user to the OAuth page for the provider to provide access.
   * This will redirect back again to the callback url with the OAuth code.
   * @param req Origami Request
   * @param res Origami Response
   * @param next Origami NextFunction
   */
  public authenticate(
    req: Origami.Server.Request,
    res: Origami.Server.Response,
    next: Origami.Server.NextFunction
  ) {
    const _qs = Object.entries({
      client_id: this.clientID,
      redirect_uri: this.callbackURL,
      ...this.authenticateQueryString
    }).reduce((str, [k, v]) => {
      // tslint:disable-next-line:no-parameter-reassignment
      str += `${k}=${v}&`;
      return str;
    }, '?');


    res.redirect(`${this.authenticateURL}${_qs}`);
  }

  public async callback(
    req: Origami.Server.Request,
    res: Origami.Server.Response,
    next: Origami.Server.NextFunction
  ) {
    const { code } = req.query;

    // Convert code to access token
    const accessToken = await request({
      url: this.getTokenURL,
      method: 'POST',
      json: true,
      qs: {
        client_id: this.clientID,
        redirect_uri: this.callbackURL,
        client_secret: this.clientSecret,
        code,
        grant_type: 'authorization_code'
      }
    });

    const socialUser = await request({
      url: this.getUserURL,
      method: 'get',
      json: true,
      qs: {
        access_token: accessToken.access_token,
        ...this.getUserQueryString
      }
    });

    this.socialUser = {
      fname: socialUser[this.mapUserData.fname],
      lname: socialUser[this.mapUserData.lname],
      email: socialUser[this.mapUserData.email]
    };

    await this.createUser(res);
    this.finalize(res);
  }

  /**
   * Lookup for existing user by email and create if it doesn't exist.
   *
   * @param res Redirect from 3rd party with user data
   */
  public async createUser(res: Origami.Server.Response): Promise<User> {
    if (!this.socialUser) return Promise.reject(false);

    const model = await res.app.get('store').model('user') as Origami.Store.Model;
    let [user] = await model.find({ email: this.socialUser.email }) as Origami.Store.Resource[];

    // Create the user with a random password if it doesn't exist
    if (!user) {
      user = await model.create({
        fname: this.socialUser.fname,
        lname: this.socialUser.lname,
        email: this.socialUser.email,
        password: await auth.hash(await random())
      });
    }

    return this.origamiUser = user as User;
  }


  /**
   * Redirect to the final page with token in the query string
   * @param res Redirect from 3rd party with user data
   */
  public finalize(res: Origami.Server.Response) {
    if (!this.origamiUser) return false;
    // Sign the JWT with the new user
    const secret = res.app.get('secret');
    // If successful, sign JWT
    const token = auth.jwtSign({
      userId: this.origamiUser.id,
      email: this.origamiUser.email
    }, secret);

    res.redirect(`${URI_PREFIX}/final?token=${token}`);
  }
}


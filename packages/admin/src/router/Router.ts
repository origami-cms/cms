// tslint:disable variable-name
// import Router, {RouterProps} from 'lib/Router';
import { customElement, html, LitElement, property } from 'lit-element';
import { connect } from 'pwa-helpers/connect-mixin';
import { navigate, updatePath } from '../actions/App';
import { refresh, verify } from '../actions/Auth';
import { getTheme } from '../actions/Organization';
import { BASE_URI } from '../const';
import { State, store } from '../store/store';


// Simple router for all main pages, and verifies token on page refresh.
// Boots to login if invalid verification or no JWT
@customElement('zen-app')
export class Router extends connect(store)(LitElement) {
  public base = '/admin';
  public notfound = 'page-not-found';

  public routes = [
    { path: '/login', element: 'page-login' },
    { path: '/logout', element: 'page-logout' },
    { path: '(.*)', element: 'page-admin' }
  ];

  private _verified: boolean = false;

  private get _verifyError() {
    return this.__verifyError;
  }

  private set _verifyError(v) {
    if (this.__verifyError === v) return;

    this.__verifyError = v;
    const url = `${BASE_URI}/login`;

    // @ts-ignore path added from Router
    if (v && this.path !== url) store.dispatch<any>(navigate(url));
  }
  private __verifyError: string | null = null;

  private _expireTimeout: number | null = null;

  private __tokenExpires: number | null = null;
  private get _tokenExpires() {
    return this.__tokenExpires;
  }
  private set _tokenExpires(v: number | null) {
    if (this.__tokenExpires === v) return;

    if (this._expireTimeout) window.clearTimeout(this._expireTimeout);
    this.__tokenExpires = v;

    if (v && !this._expireTimeout) {

      // Send the request before the expiry
      const sendBefore = 3;
      this._expireTimeout = window.setTimeout(
        this._refreshToken.bind(this),
        (v - sendBefore) * 1000 - (new Date()).getTime()
      );
    }
  }

  @property()
  private _loading: boolean = true;

  public render() {
    return html`
    <style>
      zen-loading{position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%)}
    </style>
    ${this._loading && !this._verified
        ? html`<zen-loading size="large"></zen-loading>`
        : html`<zen-router base=${this.base} .routes=${this.routes}></zen-router>`
      }
    `;
  }

  public connectedCallback() {
    super.connectedCallback();
    window.addEventListener('RouterPop', () => {
      store.dispatch<any>(updatePath(window.location.pathname));
    });
  }

  public firstUpdated(props: any) {
    super.firstUpdated(props);
    store.dispatch<any>(verify());
    this._refreshToken();
    store.dispatch<any>(getTheme());
  }

  public stateChanged(s: State) {
    this._verifyError = s.Auth.errors.verify;
    this._verified = Boolean(s.Auth.verified);
    // TODO: Convert to a better structure
    // Works around the flashing of showing the dashboard if not logged in
    setTimeout(() => {
      this._loading = s.Auth.loading.verifying;
    }, 10);

    this._tokenExpires = s.Auth.expires;
  }

  private _refreshToken() {
    this._expireTimeout = null;
    store.dispatch<any>(refresh());
  }
}

declare global {
  interface HTMLElementTagNameMap {
    // @ts-ignore
    'zen-router': Router;
  }
}

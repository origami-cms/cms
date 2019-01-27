// tslint:disable variable-name
// import Router, {RouterProps} from 'lib/Router';
import { customElement, html, LitElement, property } from 'lit-element';
import { connect } from 'pwa-helpers/connect-mixin';
import { navigate, updatePath } from '../actions/App';
import { verify } from '../actions/Auth';
import { getTheme } from '../actions/Organization';
import { BASE_URI } from '../const';
import { State, store } from '../store/store';


// Simple router for all main pages, and verifies token on page refresh.
// Boots to login if invalid verification or no JWT
@customElement('zen-app')
export class Router extends connect(store)(LitElement) {
  public base = '/admin';
  public notfound = 'page-not-found';

  public _verified: boolean = false;
  public __verifyError: string | null = null;

  @property()
  public _loading: boolean = true;

  public routes = [
    { path: '/login', element: 'page-login' },
    { path: '/logout', element: 'page-logout' },
    { path: '(.*)', element: 'page-admin' }
  ];

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
    store.dispatch<any>(getTheme());
  }

  get _verifyError() {
    return this.__verifyError;
  }

  set _verifyError(v) {
    if (this.__verifyError === v) return;

    this.__verifyError = v;
    const url = `${BASE_URI}/login`;

    // @ts-ignore path added from Router
    if (v && this.path !== url) store.dispatch<any>(navigate(url));
  }

  public stateChanged(s: State) {
    this._verifyError = s.Auth.errors.verify;
    this._verified = Boolean(s.Auth.verified);
    // TODO: Convert to a better structure
    // Works around the flashing of showing the dashboard if not logged in
    setTimeout(() => {
      this._loading = s.Auth.loading.verifying;
    }, 10);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    // @ts-ignore
    'zen-router': Router;
  }
}

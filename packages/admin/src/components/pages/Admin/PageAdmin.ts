import { ZenRoute } from '@origami/zen';
import { customElement, html, LitElement, property } from 'lit-element';
import { connect } from 'pwa-helpers/connect-mixin';
import { appsGet } from '../../../actions/Apps';
import { getMe } from '../../../actions/Me';
import { AppsMap, Me, State, store } from '../../../store/store';
import CSS from './page-admin-css';

interface PageAdminProps {
  me?: Me;
  _appSelectorOpen: boolean;
}

export * from './App/PageApp';
export * from './Settings/PageSettings';
export * from './Users/PageUsers';
export * from './Media/PageMedia';

@customElement('page-admin')
export class PageAdmin extends connect(store)(LitElement) implements PageAdminProps {

  get routes() {
    return [
      ...Object.keys(this.apps).map((name) => ({
        path: `/${name}`,
        element: 'page-app',
        attributes: { appName: name }
      })),
      ...this.baseRoutes
    ];
  }
  set routes(v) { }
  public base = '/admin';
  public me?: Me;

  @property()
  public _appSelectorOpen: boolean = false;

  public baseRoutes: ZenRoute[] = [
    { path: '/404/', element: 'page-not-found', exact: true },
    { path: '/users/(.*)', element: 'page-users' },
    { path: '/media/(.*)', element: 'page-media' },
    { path: '/settings/(.*)', element: 'page-settings' },
    { path: '/', element: 'page-dashboard', exact: true }
  ];

  @property()
  public apps: AppsMap = {};

  public notfound = 'page-not-found';


  public async firstUpdated() {
    store.dispatch<any>(getMe());
    store.dispatch<any>(appsGet());
  }

  public render() {
    // @ts-ignore
    return html`
    ${CSS}
    <ui-sidebar></ui-sidebar>
    <ui-header></ui-header>
    <zen-router .routes=${this.routes} .base=${this.base} notfound="page-not-found"></zen-router>
    <ui-app-selector .open=${this._appSelectorOpen}> </ui-app-selector>
    `;
  }

  public updated(p: any) {
    super.updated(p);
    // @ts-ignore
    this.shadowRoot.querySelector('zen-router').routes = this.routes;
  }


  public stateChanged(s: State) {
    this.me = s.Me;
    this._appSelectorOpen = s.App.appSelector.open;
    if (Object.keys(s.Apps.apps).length !== Object.keys(this.apps).length) {
      this.apps = s.Apps.apps;
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'page-admin': PageAdmin;
  }
}

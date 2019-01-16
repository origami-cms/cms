import { bindAttributes } from '@origami/zen-lib/decorators';
import Fuse from 'fuse.js';
import { customElement, html, LitElement, property } from 'lit-element';
import { repeat } from 'lit-html/directives/repeat';
// @ts-ignore
import { connect } from 'pwa-helpers/connect-mixin';
import { getSidebarItems, toggleAppSelector } from '../../../actions/App';
import { BASE_URI } from '../../../const';
import { SidebarItem, State, store } from '../../../store/store';
import CSS from './app-selector-css';


export interface Routes {
  [path: string]: string;
}


// @ts-ignore
@customElement('ui-app-selector')
@bindAttributes
export class AppSelector extends connect(store)(LitElement) {

  @property()
  get filter() {
    return this._filter;
  }
  set filter(v) {
    this._filter = v;
    if (!this._fuse || !v) this._filtered = [];
    else this._filtered = this._fuse.search(v);
  }

  public static _boundAttributes = ['open'];
  @property()
  public open: boolean = false;

  @property()
  public apps: SidebarItem[] = [];

  @property()
  public _filtered: SidebarItem[] = [];

  private _fuse?: Fuse<any>;
  private _filter?: string;

  constructor() {
    super();
    this._handleKeyDown = this._handleKeyDown.bind(this);
    this.close = this.close.bind(this);
  }

  public connectedCallback() {
    super.connectedCallback();
    document.addEventListener('keydown', this._handleKeyDown);
  }
  public disconnectedCallback() {
    document.removeEventListener('keydown', this._handleKeyDown);
    super.disconnectedCallback();
  }


  public firstUpdated() {
    store.dispatch<any>(getSidebarItems());
  }


  public render() {
    const { _filtered, apps } = this;
    let contents;

    if (this.filter && !_filtered.length) {
      contents = html`
        <span class="not-found">
          No apps found for '${this.filter}'. Try searching for something else.
        </span>`;

    } else {
      const _apps = _filtered.length ? _filtered : apps;
      const aniDelay = 0.13;
      const totalAniTime = 0.2;

      contents = html`
      <ul class="apps" @click=${this.close}>
        ${repeat(
          _apps,
          (i) => i.path,
          (a, i) => html`
            <li style="animation-delay: ${(i / _apps.length) * totalAniTime + aniDelay}s">
              <a href=${BASE_URI + a.path}>
                <ui-app-icon .icon=${a.icon} shadow></ui-app-icon>
                <small>${a.name}</small>
              </a>
            </li>
          `)
        }
      </ul>
      `;
    }

  return html`
    ${CSS}
    <zen-icon type="cross" @click=${this.close} color="grey-200" size="large"></zen-icon>
    <h1>Applications</h1>

    <div class="wrapper">
      <zen-input
        icon="search"
        placeholder="Search for an app…"
        @change="${
          (e: { target: { value: string }}) => this.filter = e.target.value
        }"
      ></zen-input>
      ${contents}
    </div>
    `;
  }

  public close() {
    if (this.open) store.dispatch<any>(toggleAppSelector(false));
  }


  private _stateChanged(state: State) {
    const _apps = Object.entries(state.Apps.apps).map(([name, a]) => ({
      icon: a.icon,
      path: a.uriBase,
      name: a.name
    }));
    this.apps = [..._apps, ...state.App.sidebar.items];
    this.open = state.App.appSelector.open;
    this._fuse = new Fuse(this.apps, {
      keys: ['name']
    });
  }

  // tslint:disable-next-line:function-name
  private updated() {
    // @ts-ignore Shadow root exists
    if (this.open) this.shadowRoot.querySelector('zen-input').focus();
  }


  private _handleKeyDown(e: KeyboardEvent) {
    switch (e.key) {
      case 'Escape':
        this.close();
    }
  }
}


import { customElement, html, LitElement, property } from 'lit-element';
import { connect } from 'pwa-helpers/connect-mixin';
import { getSidebarItems, toggleAppSelector } from '../../../actions/App';
import { BASE_URI } from '../../../const';
import { SidebarItem } from '../../../store/state';
import { State, store } from '../../../store/store';
import CSS from './sidebar-css';


@customElement('ui-sidebar')
export class Sidebar extends connect(store)(LitElement) {
  @property()
  public apps: SidebarItem[] = [];

  @property()
  public logo?: number;

  public connectedCallback() {
    super.connectedCallback();
    store.dispatch<any>(getSidebarItems());
  }

  public render() {
    const { apps, logo } = this;
    return html`
    ${CSS}

    <a href='${BASE_URI}/' class="top-link">
      <img class="logo" src="${BASE_URI}/images/logo?${logo}" alt="Logo" />
    </a>

    <div class="search">
      <zen-icon type="search" color="grey-300" size="main"></zen-icon>
    </div>

    <ul class="apps">
      ${apps.map((a) => html`
      <li>
        <a href=${BASE_URI + a.path}>
          <ui-app-icon .icon=${a.icon} .shadow=${true}></ui-app-icon>
        </a>
      </li>
      `)}

    </ul>

    <div class="apps-button" @click=${() => store.dispatch<any>(toggleAppSelector(true))}>
      <zen-icon type="grid" size="main" color="grey-300"></zen-icon>
    </div>
    `;
  }

  public updated(p: any) {
    super.updated(p);
    // @ts-ignore
    (Array.from((this).shadowRoot.querySelectorAll('a'))).forEach((a: HTMLAnchorElement) => {
      const href = a.getAttribute('href')!;
      const path = window.location.pathname;

      if (href === BASE_URI || href === `${BASE_URI}/`) {
        a.classList.toggle('active', path === BASE_URI || path === `${BASE_URI}/`);
      } else a.classList.toggle('active', path.startsWith(href));
    });
  }

  public stateChanged(state: State) {
    const _apps = Object.entries(state.Apps.apps).map(([name, a]) => ({
      icon: a.icon,
      path: a.uriBase,
      name: a.name
    }));
    this.apps = [..._apps, ...state.App.sidebar.items];

    if (state.Organization.logo) this.logo = state.Organization.logo;
  }
}


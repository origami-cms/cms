import { customElement, html, LitElement, property } from '@polymer/lit-element';
import { getSidebarItems, toggleAppSelector } from 'actions/App';
import { BASE_URI } from 'const';
// @ts-ignore
import { connect } from 'pwa-helpers/connect-mixin';
import { State, store } from 'store';
import { SidebarItem } from 'store/state';
import CSS from './sidebar-css';

interface props {
  apps: SidebarItem[];
  logo?: number;
}


// @ts-ignore
@customElement('ui-sidebar')
export class Sidebar extends connect(store)(LitElement) implements props {
  @property()
  public apps: SidebarItem[] = [];

  @property()
  public logo?: number;

  public _stateChanged(state: State) {
    const _apps = Object.entries(state.Apps.apps).map(([name, a]) => ({
      icon: a.icon,
      path: a.uriBase,
      name: a.name
    }));
    this.apps = [..._apps, ...state.App.sidebar.items];

    if (state.Organization.logo) this.logo = state.Organization.logo;
  }

  public connectedCallback() {
    super.connectedCallback();
    store.dispatch(getSidebarItems());
  }

  public render() {
    const { apps, logo } = this;
    return html`
            ${CSS}

            <a href='${BASE_URI}/' class="top-link display-b">
              <img class="logo" src="${BASE_URI}/images/logo?${logo}" alt="Logo" />
            </a>

            <div class="search position-r">
              <zen-icon type="search" color="grey-300" size="main" class="center"></zen-icon>
            </div>

            <ul class="apps">
              ${apps.map((a) => html`
              <li class="position-r">
                <a class="covers" href=${BASE_URI + a.path}>
                  <ui-app-icon .icon=${a.icon} .shadow=${true}></ui-app-icon>
                </a>
              </li>
              `)}

            </ul>

            <div class="apps-button" @click=${() => store.dispatch(toggleAppSelector(true))}>
              <zen-icon type="grid" size="main" color="grey-300"></zen-icon>
            </div>
        `;
  }

  public updated(p: any) {
    super.updated(p);
    // @ts-ignore
    (Array.from((this).shadowRoot.querySelectorAll('a')) as HTMLAnchorElement[]).forEach((a) => {
      const href = a.getAttribute('href')!;
      const path = window.location.pathname;

      if (href === BASE_URI || href === `${BASE_URI}/`) {
        a.classList.toggle('active', path === BASE_URI || path === `${BASE_URI}/`);
      } else a.classList.toggle('active', path.startsWith(href));
    });
  }
}


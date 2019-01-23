import { customElement, html, LitElement, property } from 'lit-element';
// @ts-ignore
import { connect } from 'pwa-helpers/connect-mixin';
import { Me, State, store } from '../../../../store/store';
import CSS from './header-user-css';

@customElement('ui-header-user')
export class HeaderUser extends connect(store)(LitElement) {

  public static styles = [CSS];

  @property()
  public me: Me | null = null;

  @property()
  private _open: boolean = false;

  constructor() {
    super();
    this.toggle = this.toggle.bind(this);
  }

  public render() {
    const id = this.me ? this.me.id : 'default';

    return html`
      <ui-avatar .user=${id} @click=${this.toggle}></ui-avatar>
      ${this.me
        ? html`
          <zen-tooltip ?show=${this._open} position="bottom-left">
            <h5>${this.me.fname}</h5>
            <ul>
              <li>
                <a href="/admin/logout">
                  <zen-icon type="lock" size="medium" color="grey-600"></zen-icon>
                  <span>Logout</span>
                </a>
              </li>
            </ul>
          </zen-tooltip>
        `
        : null
      }
    `;
  }

  public toggle() {
    // if (!this._open) window.addEventListener('click', this.toggle);
    // else window.removeEventListener('click', this.toggle);
    this._open = !this._open;
  }

  public stateChanged(s: State) {
    this.me = s.Me;
  }
}

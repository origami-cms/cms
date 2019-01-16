import { customElement, html, LitElement } from 'lit-element';
import { navigate } from '../../../actions/App';
import { logout } from '../../../actions/Auth';

import { store } from '../../../store/store';


// @ts-ignore
@customElement('page-logout')
export class PageLogout extends LitElement {
  public async connectedCallback() {
    super.connectedCallback();
    store.dispatch<any>(logout());
    store.dispatch<any>(navigate('/admin/login'));
  }

  public render() {
    const cssCenter = 'position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%)';
    return html`<zen-loading .style=${cssCenter} size="large"></zen-loading>`;
  }
}

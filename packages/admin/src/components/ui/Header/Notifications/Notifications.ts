
import { customElement, html, LitElement } from 'lit-element';
import CSS from './notifications-css';

@customElement('ui-header-notifications')
export class Notifications extends LitElement {

  public static styles = [CSS];

  public render() {
    return html`<zen-icon type="bell" color="main" class="center"></zen-icon>`;
  }
}

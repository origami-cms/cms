import { customElement, html, LitElement, property } from 'lit-element';
import CSS from './avatar-css';

@customElement('ui-avatar')
export class Avatar extends LitElement {

  public static styles = [CSS];

  @property()
  public user?: string;

  public render() {
    return html`
      <img .src=${`/content/profiles/${this.user}`} alt="User avatar" />
    `;
  }
}

import { customElement, html, LitElement, property } from '@polymer/lit-element';
import CSS from './avatar-css';

// @ts-ignore
@customElement('ui-avatar')
export class Avatar extends LitElement {
  @property()
  public user?: string;

  public render() {
    return html`
      ${CSS}
      <img .src=${`/content/profiles/${this.user}`} alt="User avatar" />
    `;
  }
}

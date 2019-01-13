import { customElement, html, LitElement, property } from '@polymer/lit-element';
import CSS from './avatar-css';

interface props {
  user?: string;
}

// @ts-ignore
@customElement('ui-avatar')
export class Avatar extends LitElement implements props {
  @property()
  public user?: string;

  public render() {
    return html`
            ${CSS}
            <img .src=${`/content/profiles/${this.user}`} alt="User avatar" />
        `;
  }
}

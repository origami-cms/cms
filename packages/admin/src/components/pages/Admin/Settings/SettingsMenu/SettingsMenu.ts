import { customElement, html, LitElement } from 'lit-element';

import CSS from './page-settings-menu-css';

interface Link {
  icon?: string;
  text?: string;
  to?: string;
}

@customElement('page-settings-menu')
export class SettingsMenu extends LitElement {

  public static styles = [CSS];

  private _links: Link[] = [
    {
      icon: 'organization',
      text: 'Organization',
      to: '/admin/settings/organization'
    },
    {
      icon: 'user',
      text: 'My settings',
      to: '/admin/settings/me'
    }
  ];

  public render() {
    // @ts-ignore
    return html`
        <ul>
          ${this._links.map((l) => html`
          <li>
            <a href=${l.to}>
              ${l.icon ? html`<zen-icon .type=${l.icon} color='grey-300' size="medium"></zen-icon>` : ''}
              <span>${l.text}</span>
            </a>
          </li>
          `)}
        </ul>
    `;
  }
}

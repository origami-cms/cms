import { customElement, html, LitElement, property } from '@polymer/lit-element/lit-element';
import CSS from './app-icon-css';


export type Icon = string | { type: string; color: string; background: string };

// @ts-ignore
@customElement('ui-app-icon')
export class AppIcon extends LitElement {
  @property()
  public icon?: Icon;

  @property({ reflect: true, type: Boolean })
  public shadow?: Icon;

  public render() {
    if (!this.icon) return html``;

    const icon = typeof this.icon === 'string'
      ? html`<img src=${this.icon} class="rounded" />`
      : html`
        <div class="rounded gradient-${this.icon.background}">
          <zen-icon
            type=${this.icon.type} color=${this.icon.color || 'white' } class="center" size="main"
          ></zen-icon>
        </div>
      `;

    return html`${CSS}${icon}`;
  }
}

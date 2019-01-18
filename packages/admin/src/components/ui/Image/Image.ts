import { customElement, html, LitElement, property } from 'lit-element';
import CSS from './image-css';

// @ts-ignore
@customElement('ui-image')
export class Image extends LitElement {
  @property()
  public alt?: string;

  @property()
  public src?: string;

  @property()
  private _loaded: boolean = false;

  public render() {
    return html`
      ${CSS}
      ${!this._loaded
        ? html`<zen-icon type="image" color="grey-200"></zen-icon>`
        : null
      }
      <img
        src="${this.src}"
        alt="${this.alt}"
        @load=${() => this._loaded = true}
        class=${this._loaded ? 'loaded' : ''}
      />
    `  ;
  }
}

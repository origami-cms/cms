import { customElement, html, LitElement } from 'lit-element';
import { connect } from 'pwa-helpers/connect-mixin';
import { titleSet } from '../../../../lib/decorators/titleSet';
import { store } from '../../../../store/store';
import CSS from './page-media-css';

@customElement('page-media')
export class PageMedia extends titleSet('Media')(connect(store)(LitElement)) {
  public static styles = [CSS];

  public render() {
    return html`<ui-media-grid></ui-media-grid>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'page-media': PageMedia;
  }
}

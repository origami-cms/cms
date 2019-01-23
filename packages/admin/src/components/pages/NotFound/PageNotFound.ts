import { customElement, html, LitElement } from 'lit-element';

import CSS from './page-not-found-css';

@customElement('page-not-found')
export class PageNotFound extends LitElement {

  public static styles = [CSS];

  public render() {
    return html`
      <h1>Page not found</h1>
      <a href='/admin/'>
        Return home
      </a>
    `;
  }
}

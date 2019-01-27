import { customElement, html, LitElement } from 'lit-element';
import { unsafeHTML } from 'lit-html/directives/unsafe-html';

// tslint:disable
export default (tagName: string, content: string, scripts: string[] = []) => {
  class GeneratedAppPage extends LitElement {
    public static page = tagName;

    public firstUpdated() {
      scripts.forEach((s) => {
        // tslint:disable-next-line no-function-constructor-with-string-args
        const f = new Function(s);
        f.call(this);
      });
    }

    public render() {
      return html`
                ${unsafeHTML(content)}
            `;
    }
  }
  window.customElements.define(tagName, GeneratedAppPage);

  return tagName;
};

import {LitElement, html, customElement} from '@polymer/lit-element';
import {unsafeHTML} from 'lit-html/directives/unsafe-html';

export default (tagName: string, content: string, scripts: string[] = []) => {
    class GeneratedAppPage extends LitElement {
        static page = tagName;

        firstUpdated() {
            scripts.forEach(s => {
                // tslint:disable-next-line no-function-constructor-with-string-args
                const f = new Function(s);
                f.call(this);
            });
        }

        render() {
            return html`
                ${unsafeHTML(content)}
            `;
        }
    }
    window.customElements.define(tagName, GeneratedAppPage);

    return tagName;
};

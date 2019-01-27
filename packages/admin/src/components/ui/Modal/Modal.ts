import { customElement, html, LitElement, property, TemplateResult } from 'lit-element';
import CSS from './modal-css';
import { ModalContainer } from './ModalContainer';

@customElement('ui-modal')
export class Modal extends LitElement {
  protected static modalCss = CSS;

  @property({ attribute: true, type: Boolean })
  public closeable: boolean = true;


  protected get _modal() {
    return document.querySelector('ui-modal-container') as ModalContainer;
  }

  public render() {
    // Default modal content. Could be overridden if this class is extended
    return html`
      ${this._renderHeader()}
      <slot></slot>
    `;
  }

  public close() {
    this._modal.close();
  }

  protected _renderHeader(title?: TemplateResult) {
    return html`<header>
      ${title ? title : html`<slot name="title"></slot>`}
      ${this.closeable
        ? html`<zen-icon type="cross" color="grey-200" @click=${this.close}></zen-icon>`
        : null
      }
    </header>`;
  }
}

import { customElement, html, LitElement, property, query } from 'lit-element';
import { TemplateResult } from 'lit-html';
import { unsafeHTML } from 'lit-html/directives/unsafe-html';
import CSS from './modal-container-css';

@customElement('ui-modal-container')
export class ModalContainer extends LitElement {

  public static styles = [CSS];

  @property({attribute: true, type: Boolean, reflect: true})
  public show: boolean = false;

  @property()
  private _modalTag: string | null = null;

  private get _modal(): null | TemplateResult {
    if (!this._modalTag) return null;
    return html`${unsafeHTML(`<${this._modalTag}></${this._modalTag}>`)}`;
  }

  private get _modalElement() {
    if (!this._modalTag) return null;
    return this.shadowRoot!.querySelector(this._modalTag);
  }

  public connectedCallback() {
    super.connectedCallback();

    // Enforce element is directly under the body. This is for CSS stacking purposes
    if (this.parentElement !== document.body) {
      document.body.appendChild(this);
    }
  }

  public render() {
    if (!this.show) return html``;
    return html`
      <div class="  back" @click=${this.close}></div>
      ${this._modal
        ? this._modal
        : html`<slot></slot>`
      }
    `;
  }

  /**
   * Open a custom modal
   * @param modal HTML tag of custom modal
   */
  public open(modal: string) {
    this._modalTag = modal;
    this.show = true;
  }

  public close() {
    if (!this.show) return;


    if (this._modalTag) {
      const modal = this.shadowRoot!.querySelector(this._modalTag)!;
      modal.classList.add('animation-exit');
      modal.remove();
      this._modalTag = null;
    }

    this.show = false;
  }


  /**
   * Wait for the open modal to trigger an event, and return the detail
   * @param eventName Name of event to wait for (default: 'answer')
   */
  public async waitFor<T>(eventName: string = 'answer'): Promise<T | false> {
    return new Promise((res) => {
      if (!this._modalTag) {
        res(false);
        return;
      }
      const modal = this._modalElement;

      if (!modal) {
        res(false);
        return;
      }

      // Wait for modal to return the event name, then resolve with the detail
      const handler = (e: CustomEventInit) => {
        res(e.detail);
        modal.removeEventListener(eventName, handler);
      };
      modal.addEventListener(eventName, handler);
    });
  }
}

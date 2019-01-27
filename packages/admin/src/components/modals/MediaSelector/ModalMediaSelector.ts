import { customElement, html, property } from 'lit-element';
import { connect } from 'pwa-helpers/connect-mixin';
import { Modal } from '../../../components/ui';
import { MediaResource, State, store } from '../../../store/store';
import CSS from './modal-media-selector-css';

@customElement('modal-media-selector')
export class ModalMediaSelector extends connect<State>(store)(Modal) {
  public static styles = [
    CSS,
    ModalMediaSelector.modalCss
  ];

  @property()
  private _selected: MediaResource[] = [];


  public render() {
    return html`
      ${this._renderHeader(html`
        <div class="icon gradient-green">
          <zen-icon type="image" color="green" size="medium"></zen-icon>
        </div>
        <h3>Select an image</h3>
      `)}

      <div class="content">
        <ui-media-grid
          previewSize="200"
          selectable
          multiple
          @change=${(e: CustomEvent) => this._selected = e.detail}
        ></ui-media-grid>
      </div>

      <footer>
        <zen-button
          color="blue"
          ?disabled=${this._selected.length === 0}
          @click=${this._answer}
        >
          Insert
        </zen-button>
      </footer>
    `;
  }

  private _answer() {
    this.dispatchEvent(new CustomEvent('answer', {
      detail: { resources: this._selected }
    }));
  }
}

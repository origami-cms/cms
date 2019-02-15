import { customElement, html, LitElement, property } from 'lit-element';
import { connect } from 'pwa-helpers/connect-mixin';
import { mediaRemove } from '../../../../actions/Media';
import { copy } from '../../../../lib/copy';
import { titleSet } from '../../../../lib/decorators/titleSet';
import { MediaResource, store } from '../../../../store/store';
import CSS from './page-media-css';

@customElement('page-media')
export class PageMedia extends titleSet('Media')(connect(store)(LitElement)) {
  public static styles = [CSS];

  @property()
  public selected: MediaResource[] = [];

  constructor() {
    super();
    this._actionCopy = this._actionCopy.bind(this);
    this._actionRemove = this._actionRemove.bind(this);
  }

  public render() {
    return html`
      <ui-media-grid
        searchable
        selectable
        multiple
        @change=${(e: CustomEvent) => this.selected = e.detail}
        .buttons=${this._buttons}
        ></ui-media-grid>
    `;
  }

  private get _buttons() {
    const s = this.selected;
    const buttons = [];

    if (s.length >= 1) {
      buttons.push({
        icon: 'remove', text: 'Remove', color: 'red', size: 'medium',
        onclick: this._actionRemove
      });

      if (s.length === 1) {
        buttons.push({
          icon: 'copy', text: 'Copy link', color: 'blue', size: 'medium',
          onclick: this._actionCopy
        });
      }
    }

    return buttons;
  }


  private _actionCopy() {
    const selected = this.selected;
    if (selected.length === 1) return copy(`/api/v1/media/${selected[0].id}`);
  }

  private _actionRemove() {
    store.dispatch(mediaRemove(this.selected.map((s) => s.id)));
  }


}

declare global {
  interface HTMLElementTagNameMap {
    'page-media': PageMedia;
  }
}

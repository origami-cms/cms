// @ts-ignore
import gjs from 'grapesjs';
import { customElement, html, LitElement, property, svg } from 'lit-element';
import { MediaResource } from 'src/store/state';
import { blocks } from './blocks';
import CSS from './wysiwyg-css';

@customElement('ui-wysiwyg')
export class WYSIWYG extends LitElement {
  public static styles = [CSS];

  // GJS Editor
  private _editor: any;
  private _initialValue: string = '';
  private _lastMediaSelected: MediaResource | null = null;

  get _modalContainer() {
    return document.querySelector('ui-modal-container')!;
  }

  public async selectMedia(): Promise<MediaResource | false> {
    this._modalContainer.open('modal-media-selector');
    const r = await this._modalContainer.waitFor<{ resources: MediaResource[] }>();
    if (r) return this._lastMediaSelected = r.resources[0];
    else return false;
  }


  get value() {
    if (!this._editor) return '';
    return this._editor.getHtml();
  }
  set value(v: string) {
    this._initialValue = v;
    // if (!this._editor) {
    //   this._initialValue = v;
    //   return;
    // } else this._editor.setComponents(v);
  }

  public render() {
    return html`
      <link rel="stylesheet" href="https://unpkg.com/grapesjs/dist/css/grapes.min.css">
      <div id="gjs"></div>
      <div id="blocks"></div>`;
  }

  public firstUpdated() {
    this._editor = gjs.init({
      // Indicate where to init the editor. You can also pass an HTMLElement
      container: this.shadowRoot!.querySelector('#gjs'),
      // Get the content for the canvas directly from the element
      // As an alternative we could use: `components: '<h1>Hello World Component!</h1>'`,
      components: this._initialValue,
      // Size of the editor
      height: '300px',
      width: 'auto',
      // Disable the storage manager for the moment
      storageManager: { type: null },
      // Avoid any default panel
      panels: { defaults: [] },

      rte: {
        actions: ['bold', 'italic', 'underline', 'strikethrough']
      },


      blockManager: {
        appendTo: this.shadowRoot!.querySelector('#blocks'),
        blocks: blocks
      }
    });

    // TODO: convert to better css injection
    this._editor.CssComposer.setRule('img', 'max-width: 100%');

    const self = this;


    this._editor.Commands.add('open-assets', {
      async run(editor: any, sender: any, opts: any = {}) {
        await self._setImageSrc(opts.target);
      }
    });

    this._editor.on('change:changesCount', () => {
      this.dispatchEvent(new CustomEvent('change'));
    });
  }

  private async _setImageSrc(model: any) {
    const media = await this.selectMedia();
    if (media) {
      const src = `/api/v1/media/${media.id}`;

      const img = this._editor.getSelected();
      img.set('src', src);
    }
  }
}

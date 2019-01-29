// @ts-ignore
import gjs from 'grapesjs';
import { customElement, html, LitElement, property, svg } from 'lit-element';
import CSS from './wysiwyg-css';

@customElement('ui-wysiwyg')
export class WYSIWYG extends LitElement {
  public static styles = [CSS];

  // GJS Editor
  private _editor: any;
  private _initialValue: string = '';

  get _modalContainer() {
    return document.querySelector('ui-modal-container')!;
  }

  public async selectMedia() {
    this._modalContainer.open('modal-media-selector');
    return this._modalContainer.waitFor();
  }


  get value() {
    if (!this._editor) return '';
    return this._editor.getHtml();
  }
  set value(v: string) {
    if (!this._editor) {
      this._initialValue = v;
      return;
    } else this._editor.setComponents(v);
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
        blocks: [
          {
            id: 'text',
            label: 'Text',
            content: '<div data-gjs-type="text">Insert your text here</div>',
          },
          {
            id: 'image',
            label: 'Image',
            // Select the component once it's dropped
            select: true,
            // You can pass components as a JSON instead of a simple HTML string,
            // in this case we also use a defined component type `image`
            content: { type: 'image' },
            // This triggers `active` event on dropped components and the `image`
            // reacts by opening the AssetManager
            activate: true,
          }
        ]
      }
    });

    const self = this;

    this._editor.Commands.add('open-assets', {
      async run(editor: any, sender: any) {
        const media = await self.selectMedia();
        if (media) {
          // @ts-ignore
          const src = `/api/v1/media/${media.resources[0].id}`;

          self._editor.getSelected().setAttributes({src});
        }

      }
    });

    this._editor.on('change', () => {
      // TODO: Make more efficient
      this.dispatchEvent(new CustomEvent('change'));
    });
  }
}

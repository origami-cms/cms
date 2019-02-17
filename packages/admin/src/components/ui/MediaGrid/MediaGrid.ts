import { ButtonOptions } from '@origami/zen';
import { customElement, html, LitElement, property } from 'lit-element';
import { repeat } from 'lit-html/directives/repeat';
import { connect } from 'pwa-helpers/connect-mixin';
import { mediaGet } from '../../../actions/Media';
import { uploadProgress } from '../../../actions/UploadMedia';
import { MediaResource, State, store, UploadingResource } from '../../../store/store';
import CSS from './media-grid-css';

export const EVENT_CHANGED = 'change';

type GridResource = GridResourceMedia | GridResourceUpload;

interface GridResourceBase {
  src: string | null;
  name: string;
  author: string;
  created: Date;
}

interface GridResourceUpload extends GridResourceBase {
  upload: true;
  uploadProgress: number;
  original: UploadingResource;
}

interface GridResourceMedia extends GridResourceBase {
  upload: false;
  original: MediaResource;
}

@customElement('ui-media-grid')
export class MediaGrid extends connect(store)(LitElement) {
  public static styles = [CSS];

  @property({ type: String, attribute: true })
  public previewSize: number = 400;

  @property({ type: Boolean, attribute: true })
  public selectable: boolean = false;

  @property({ type: Boolean, attribute: true })
  public multiple: boolean = false;

  @property({ type: Boolean, attribute: true })
  public searchable: boolean = false;

  @property()
  public buttons: ButtonOptions[] = [];

  public get value() {
    return this._value;
  }

  @property()
  // tslint:disable-next-line:variable-name
  private __value: MediaResource[] = [];
  private set _value(v) {
    this.__value = v;
    this.dispatchEvent(new CustomEvent(EVENT_CHANGED, {
      detail: this.__value
    }));
    // tslint:disable-next-line no-floating-promises
    this.requestUpdate();
  }
  private get _value() {
    return this.__value;
  }

  @property()
  private _loading: boolean = true;

  @property()
  private _media: MediaResource[] = [];

  @property()
  private _uploading: UploadingResource[] = [];

  @property()
  private _meID: null | string = null;

  @property()
  private _filteredResources: GridResource[] = [];

  @property({type: Boolean})
  private _dragging: boolean = false;


  private get _resources(): GridResource[] {
    let resources: GridResource[] = [];

    resources = resources.concat(
      this._uploading.map<GridResourceUpload>((r) => ({
        upload: true,
        uploadProgress: r.progress,
        name: r.name,
        author: this._meID!,
        src: r.preview,
        original: r,
        created: r.created
      }))
    );

    resources = resources.concat(
      this._media.map<GridResourceMedia>((r) => ({
        upload: false,
        name: r.name!,
        author: r.author!,
        src: `/api/v1/media/${r.id}?width=${this.previewSize}`,
        original: r,
        created: new Date(r.createdAt)
      }))
    );

    resources = resources.sort((a, b) => {
      if (a.created < b.created) return 1;
      else if (a.created > b.created) return -1;
      else return 0;
    });

    return resources;
  }


  constructor() {
    super();
    store.dispatch<any>(mediaGet()).then(() => {
      this._filteredResources = this._resources;
    });
  }


  public connectedCallback() {
    super.connectedCallback();

    this.addEventListener('drop', this._onDrop.bind(this));
    const prevent = (e: Event) => e.preventDefault();
    this.addEventListener('dragstart', prevent);
    this.addEventListener('dragleave', (e) => {
      e.preventDefault();
      this._dragging = false;
    });
    this.addEventListener('dragover', (e) => {
      e.preventDefault();
      this._dragging = true;
    });
  }

  public render() {
    if (this._loading) return html`<zen-loading></zen-loading>`;
    const _resources = this._resources;
    const resources = this.searchable ? this._filteredResources : _resources;
    const empty = _resources.length === 0 && resources.length === 0;

    return html`
      <header>
        ${this.searchable
          ? html`<ui-search
            .keys=${['name']}
            .items=${_resources}
            @filtered=${({ detail }: { detail: GridResource[]}) => this._filteredResources = detail}
            placeholder="Search for media…">
          </ui-search>`
          : null
        }

        ${this.buttons.length
          ? html`<zen-button-group .buttons=${this.buttons}></zen-button-group>`
          : null
        }
      </header>

      <ul>
        ${repeat(resources, (r) => r.src, (r, i) => html`
          <li
            class="card ${this._getClass(r)}"
            @click=${() => {
              if (!r.upload) this._onClick(r.original);
            }}
          >
            <div class="img">
              <ui-image src=${r.src} alt=${r.name} />
            </div>
            <div class="details">
              <span> ${r.name} </span>
              <ui-avatar user="${r.author}"></ui-avatar>
            </div>

            ${r.upload
              ? html`<ui-upload-progress
                progress=${r.uploadProgress}
                strokeWidth="10"
                stroke="white"
              ></ui-upload-progress>`
              : html`<zen-icon class="tick" type="tick" color="white"></zen-icon>`
            }
          </li>
        `)}
      </ul>
      <div class="drop-zone ${this._dragging ? 'show' : ''} ${empty ? 'empty' : ''}">
        <div class="center">
          <zen-icon type="upload" color=${this._dragging ? 'white' : 'grey-200'} size="huge"></zen-icon>
          <span>Drag and drop files here to upload</span>
        </div>
      </div>
    `;
  }


  public stateChanged(state: State) {
    const media = state.resources.media;
    if (this._loading !== media._loading.all) this._loading = media._loading.all;
    if (this._media !== media.media) {
      this._media = media.media;
      this._filteredResources = this._resources;
      this._flushRemovedMedia();
    }
    this._uploading = state.UploadingMedia.uploading;
    if (!this._meID && state.Me.id) this._meID = state.Me.id;
  }

  private _getClass(resource: GridResource) {
    if (resource.upload && resource.uploadProgress < 100) {
      return 'uploading';
    }

    if (this.value.find((r) => r.id === resource.original.id)) {
      return 'active';
    }
  }

  private _onClick(resource: MediaResource) {
    if (this.selectable) {
      if (this.multiple) {
        // If already selected, unselect it
        if (this._value.includes(resource)) {
          const filtered = this._value.filter((r) => r.id !== resource.id);
          this._value = filtered;

          // Otherwise add it to the selected values
        } else {
          const newValues = [...this._value];
          newValues.push(resource);
          this._value = newValues;
        }
      } else {
        this._value = [resource];
      }
    }
  }

  private _onDrop(e: DragEvent) {
    e.preventDefault();
    this._dragging = false;
    Array.from(e.dataTransfer!.files)
      .filter((f) =>
        f.type.startsWith('image/') ||
        f.type.startsWith('video/')
      )
      .forEach((f) => {
        store.dispatch<any>(uploadProgress(f));
      });
  }

  private _flushRemovedMedia() {
    this._value = this._value.filter((m) => {
      return Boolean(this._media.find((_m) => m.id === _m.id));
    });
  }
}

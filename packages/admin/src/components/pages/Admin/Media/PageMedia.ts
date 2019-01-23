import { customElement, html, LitElement, property } from 'lit-element';
import { repeat } from 'lit-html/directives/repeat';
import { until } from 'lit-html/directives/until';
import { connect } from 'pwa-helpers/connect-mixin';
import { mediaGet } from '../../../../actions/media';
import { titleSet } from '../../../../lib/decorators/titleSet';
import { MediaResource, State, store } from '../../../../store/store';
import CSS from './page-media-css';

@customElement('page-media')
// @ts-ignore
@titleSet('Media')
export class PageMedia extends connect(store)(LitElement) {
  @property()
  public resources: MediaResource[] = [];

  @property()
  private _loading: boolean = true;

  constructor() {
    super();
    store.dispatch<any>(mediaGet());
  }

  public render() {
    const animation = 0.0125;
    return html`
      ${CSS}
      ${this._loading
        ? html`<zen-loading></zen-loading>`
        : html`<ul>
          ${repeat(this.resources, (r) => r.id, (r, i) => html`
          <li class="card" style="animation-delay: ${i * animation}s">
            <div class="img">
              <ui-image src="/api/v1/media/${r.id}?width=400" />
            </div>
            <div class="details">
              <span>
                ${r.name}
              </span>
              <ui-avatar user="${r.author}"></ui-avatar>
            </div>
          </li>
        `)}
      </ul>`}
    `;
  }

  public stateChanged(s: State) {
    this.resources = s.resources.media.media;
    this._loading = s.resources.media._loading.all;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'page-media': PageMedia;
  }
}

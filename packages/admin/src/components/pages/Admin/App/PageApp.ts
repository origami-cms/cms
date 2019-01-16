import { customElement, html, LitElement, property } from 'lit-element';
import { unsafeHTML } from 'lit-html/directives/unsafe-html';
import { connect } from 'pwa-helpers/connect-mixin';
import { appGetEntry } from '../../../../actions/Apps';
import { SERVER_API } from '../../../../const';
import { AppConfig, State, store } from '../../../../store/store';
import CSS from './page-app-css';

// @ts-ignore
@customElement('page-app')
export class PageApp extends connect(store)(LitElement) {

  @property({ reflect: true, type: String })
  public appName?: string;

  @property()
  public entry?: string;

  @property()
  public app?: AppConfig;

  public render() {
    return html`
    ${CSS}
    ${this.entry
      ? unsafeHTML(this.entry)
      : html`<zen-loading></zen-loading>`
      }
    `;
  }

  public async updated(p: any) {
    super.updated(p);
    if (p.has('appName') && this.appName) {
      store.dispatch<any>(appGetEntry(this.appName));
      this._injectScripts();
    }
  }

  private _stateChanged(state: State) {
    if (!this.app && this.appName) this.app = state.Apps.apps[this.appName];
    if (!this.entry && this.appName) this.entry = state.Apps.entries[this.appName];
  }

  private _injectScripts() {
    if (!this.app || !this.appName) return;
    // @ts-ignore
    const shadow = this.shadowRoot as ShadowRoot;
    const existing = Array.from(
      (Array.from(shadow.querySelectorAll('scripts[src]'))))
      .map((s) => (s as HTMLScriptElement).src);

    this.app.scripts
      .filter((s) => !existing.includes(s))
      .forEach((s) => {
        const script = document.createElement('script');
        script.src = `${SERVER_API}/apps/${this.appName}/public${s}`;
        shadow.appendChild(script);
      });
  }
}


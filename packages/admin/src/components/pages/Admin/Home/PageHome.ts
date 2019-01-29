import { customElement, html, LitElement, property } from 'lit-element';
import { connect } from 'pwa-helpers/connect-mixin';
import { titleSet } from '../../../../lib/decorators/titleSet';
import { Me, State, store } from '../../../../store/store';
import CSS from './page-home-css';

@customElement('page-home')
export class PageHome extends titleSet('Home')(connect(store)(LitElement)) {

  public static styles = [CSS];

  @property()
  public me?: Me;

  public render() {
    return html`${this.me ? html`<h2>Welcome back, ${this.me.fname}</h2>` : null}`;
  }

  public stateChanged(s: State) {
    this.me = s.Me;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'page-home': PageHome;
  }
}

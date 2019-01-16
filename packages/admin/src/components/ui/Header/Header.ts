import { ButtonOptions } from '@origami/zen';
import { customElement, html, LitElement, property } from 'lit-element';
import { connect } from 'pwa-helpers/connect-mixin';
import { State, store } from '../../../store/store';
import CSS from './header-css';

export * from './Notifications/Notifications';
export * from './User/HeaderUser';


// @ts-ignore
@customElement('ui-header')
export class Header extends connect(store)(LitElement) {
  @property()
  public heading?: string;

  @property()
  public actions: ButtonOptions[] = [];

  public render() {
    return html`
      ${CSS}
      <h1 class="display-ib">${this.heading}</h1>
      ${this.actions.length
        ? html`<zen-button-group .buttons=${this.actions}></zen-button-group>`
        : null
      }
      <ui-header-notifications></ui-header-notifications>
      <ui-header-user></ui-header-user>
    `;
  }

  private _stateChanged(state: State) {
    this.heading = state.App.page.title;
    this.actions = state.App.page.actions;
  }
}


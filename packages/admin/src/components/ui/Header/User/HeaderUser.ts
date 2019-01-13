import { customElement, html, LitElement, property } from '@polymer/lit-element';
// @ts-ignore
import { connect } from 'pwa-helpers/connect-mixin';
import { State, store } from 'store';
import CSS from './header-user-css';

interface props {
  user: string | null;
}

// @ts-ignore
@customElement('ui-header-user')
export class HeaderUser extends connect(store)(LitElement) implements props {
  @property()
  public user: string | null = null;

  public render() {
    return html`${CSS}<ui-avatar .user=${this.user}>`;
  }

  private _stateChanged(s: State) {
    this.user = s.Me.id;
  }
}

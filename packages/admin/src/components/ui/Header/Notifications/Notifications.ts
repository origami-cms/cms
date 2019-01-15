
import {customElement, html, LitElement} from '@polymer/lit-element';
import CSS from './notifications-css';

// @ts-ignore
@customElement('ui-header-notifications')
export class Notifications extends LitElement {
    public render() {
        return html`${CSS}<zen-icon type="bell" color="main" class="center"></zen-icon>`;
    }
}

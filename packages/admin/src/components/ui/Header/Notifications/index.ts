
import {LitElement, html, customElement} from '@polymer/lit-element';
import CSS from './notifications-css';

// @ts-ignore
@customElement('ui-header-notifications')
export default class Notifications extends LitElement {
    render() {
        return html`${CSS}<zen-icon type="bell" color="main" class="center"></zen-icon>`;
    }
}

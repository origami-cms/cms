import {html, LitElement, customElement} from '@polymer/lit-element';



// @ts-ignore
@customElement('page-users-list')
export default class PageUsersList extends LitElement {
    static columns = ['fname', 'lname', 'email'];

    render() {
        // @ts-ignore
        return html`<ui-resource-table resource="users" .columns=${this.constructor.columns}></ui-resource-table>`;
    }
}

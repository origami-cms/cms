import {customElement, html, LitElement} from '@polymer/lit-element';


// @ts-ignore
@customElement('page-users-list')
export class PageUsersList extends LitElement {
    public static columns = ['fname', 'lname', 'email'];

    public render() {
        // @ts-ignore
        return html`<ui-resource-table resource="users" .columns=${this.constructor.columns}></ui-resource-table>`;
    }
}

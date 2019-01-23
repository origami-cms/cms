import { customElement, html, LitElement } from 'lit-element';
import { User } from '../../../../../store/state';
@customElement('page-users-list')
export class PageUsersList extends LitElement {
    public static columns = ['fname', 'lname', 'email'];

    public render() {
        // @ts-ignore
        return html`
          <ui-resource-table resource="users">
            <zen-table-column
              key="fname"
              heading="Name"
              .template=${this._renderUser.bind(this)}
              icon="user"
              sortable
            ></zen-table-column>
          </ui-resource-table>
        `;
    }

    private _renderUser(data: User) {
      return `<div style="display: flex; align-items: center;">
        <ui-avatar user="${data.id}" size="medium"></ui-avatar>
        <span style="margin-left: var(--size-tiny)">
          <strong>${data.fname} ${data.lname}</strong>
          <br />
          <small class="color-grey-300">${data.email}</small>
        </span>
      </div>`;
    }
}

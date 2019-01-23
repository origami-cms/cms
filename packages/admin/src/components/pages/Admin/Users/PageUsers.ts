import { customElement, html, LitElement } from 'lit-element';
import { connect } from 'pwa-helpers/connect-mixin';
import { titleSet } from '../../../../lib/decorators/titleSet';
import { store } from '../../../../store/store';

export * from './Create/PageUserCreate';
export * from './Edit/PageUserEdit';
export * from './List/PageUsersList';


@customElement('page-users')
@titleSet('Users')
export class PageUsers extends connect(store)(LitElement) {
  public routes = [
    { path: '/create', element: 'page-user-create' },
    { path: '/:userID', element: 'page-user-edit' },
    { path: '/', element: 'page-users-list', exact: true }
  ];

  public render() {
    return html`<zen-router base="/admin/users" .routes=${this.routes}></zen-router>`;
  }

  public updated(p: any) {
    super.updated(p);
    // @ts-ignore
    this.shadowRoot.querySelector('zen-router').routes = this.routes;
  }

  public stateChanged() { }
}

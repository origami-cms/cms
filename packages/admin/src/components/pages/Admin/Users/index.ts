import {customElement, html, LitElement} from '@polymer/lit-element';
import {connect} from 'pwa-helpers/connect-mixin';
import { store } from 'store';

export * from './Create/PageUserCreate';
export * from './Edit/PageUserEdit';
export * from './List/PageUsersList';


// @ts-ignore
@customElement('page-users')
export default class PageUsers extends connect(store)(LitElement) {
    routes = [
        {path: '/create', element: 'page-user-create'},
        {path: '/:userID', element: 'page-user-edit'},
        {path: '/', element: 'page-users-list', exact: true}
    ];

    _stateChanged() {}

    render() {
        return html`<zen-router base="/admin/users" .routes=${this.routes}></zen-router>`;
    }

    updated(p: any) {
        super.updated(p);
        // @ts-ignore
        this.shadowRoot.querySelector('zen-router').routes = this.routes;
    }
}

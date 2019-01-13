import {html, LitElement, customElement} from '@polymer/lit-element';
import {Field} from '@origami/zen-lib/FormValidator';



interface props {
}

// @ts-ignore
@customElement('page-user-edit')
export default class PageUsersEdit extends LitElement implements props {
    get fields(): Field[] {
        return [
            {
                name: 'fname',
                placeholder: 'First name',
                type: 'text',
                width: 'half',
                icon: 'user',
                iconColor: 'grey-300'
            },
            {
                name: 'lname',
                placeholder: 'Last name',
                type: 'text',
                width: 'half',
                icon: 'user',
                iconColor: 'grey-300'
            },
            {
                name: 'email',
                placeholder: 'Email',
                type: 'email',
                icon: 'mail',
                iconColor: 'grey-300'
            }
        ];
    }

    render() {
        return html`<form-resource-edit resource="user" .fields=${this.fields}></form-resource-edit>`;
    }
}

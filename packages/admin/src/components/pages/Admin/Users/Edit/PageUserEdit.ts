import { Field } from '@origami/zen-lib/FormValidator';
import { customElement, html, LitElement } from 'lit-element';

// @ts-ignore
@customElement('page-user-edit')
export class PageUserEdit extends LitElement {
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

  public render() {
    return html`<form-resource-edit resource="user" .fields=${this.fields}></form-resource-edit>`;
  }
}

import { Field } from '@origami/zen-lib/FormValidator';
import { customElement, html, LitElement } from 'lit-element';


@customElement('page-user-create')
export class PageUserCreate extends LitElement {
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
      },
      {
        name: 'password',
        placeholder: 'Password',
        type: 'password',
        icon: 'lock',
        iconColor: 'grey-300'
      }
    ];
  }

  public render() {
    return html`<form-resource-create resource="user" .fields=${this.fields}></form-resource-create>`;
  }
}

import { APIActions } from '@origami/zen-lib/API';
import { Field, FormValues } from '@origami/zen-lib/FormValidator';
import { customElement, html, LitElement, property } from '@polymer/lit-element';
// @ts-ignore
import { connect } from 'pwa-helpers/connect-mixin';
import { API } from '../../../../lib/API';
import { State, store } from '../../../../store/store';
import CSS from './create-css';

// @ts-ignore
@customElement('form-user-create')
export class FormUserCreate extends connect(store)(LitElement) {

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
      },
      {
        type: 'submit',
        name: '',
        icon: 'add',
        value: 'Create',
        color: 'green'
      }
    ];
  }
  @property()
  public error: string | boolean = false;

  @property()
  public loading: boolean = false;

  @property()
  public values: FormValues = {};

  private _actions = APIActions('users', API);

  constructor() {
    super();
    this.submit = this.submit.bind(this);
  }


  public submit(e: { target: { values: object } }) {
    store.dispatch(this._actions.usersCreate(e.target.values));
  }


  public render() {
    const { error, values } = this;
    return html`
    ${CSS}
    <div class="card shadow-main center-h">
      <img class="width-super margin-b-main margin-r-main display-ib float-left" src="/admin/images/icons/user/create.svg" />
      <h3 class="margin-t-small">Add ${values.fname
          ? html`<strong>${values.fname}</strong>`
          : 'a user'} to Origami
      </h3>
      <div class="clear">
        <zen-form .error=${error} .fields=${this.fields} @change=${(e: { target: { values: object } }) => this.values =
          e.target.values}
          @submit=${this.submit}
          ></zen-form>
      </div>
      `;
  }


  private _stateChanged(s: State) {
    this.error = s.resources.users._errors.post;
    this.loading = Boolean(s.resources.users._loading.post);
  }
}

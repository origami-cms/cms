import { Field, FormValues } from '@origami/zen-lib/FormValidator';
import { customElement, html, LitElement, property } from 'lit-element';
import { connect } from 'pwa-helpers/connect-mixin';
import { navigate } from '../../../actions/App';
import { login } from '../../../actions/Auth';
import { State, store } from '../../../store/store';
import CSS from './page-login-css';


@customElement('page-login')
export class PageLogin extends connect(store)(LitElement) {

  public static styles = [CSS];

  public static fields: Field[] = [
    {
      type: 'email',
      name: 'email',
      placeholder: 'Email',
      icon: 'mail'
    },
    {
      name: 'password',
      type: 'password',
      placeholder: 'Password',
      icon: 'lock'
    },
    {
      type: 'submit',
      value: 'Login',
      icon: 'arrow-right',
      name: ''
    }
  ];
  @property()
  public error?: string | null;

  @property()
  public loggedIn?: boolean;

  @property()
  public values?: FormValues = {};

  @property()
  public _email?: string | null;

  constructor() {
    super();
    this.submit = this.submit.bind(this);
  }

  public submit(e: { target: { values: { email: string; password: string } } }) {
    const { email, password } = e.target.values;
    store.dispatch<any>(login(email, password));
  }

  public render() {
    const { error, values } = this;
    const v = {
      ...{ email: this._email },
      ...values
    };
    // @ts-ignore
    const fields = this.constructor.fields;

    // TODO: Loading state for login form
    return html`
    <div class="card">
      <img class="logo" src="/admin/images/logo" />
      <zen-form .fields=${fields} @submit=${this.submit} .error=${error} .values=${v} />
    </div>
    `;
  }

  public updated(p: any) {
    super.updated(p);

    if (this.loggedIn) store.dispatch<any>(navigate('/admin/'));
  }

  public stateChanged(s: State) {
    this.error = s.Auth.errors.loggingIn;
    this.loggedIn = s.Auth.loggedIn;
    this._email = s.Me.email;
  }
}

import {APIActions} from '@origami/zen-lib/API';
import {Field, FormValues} from '@origami/zen-lib/FormValidator';
import {customElement, html, LitElement, property} from '@polymer/lit-element';
import {API} from 'lib/API';
// @ts-ignore
import {connect} from 'pwa-helpers/connect-mixin';
import { State, store } from 'store';
import CSS from './create-css';

interface props {
    error: string | boolean;
    loading: boolean;
    values: FormValues;
}

// @ts-ignore
@customElement('form-user-create')
export default class FormUserCreate extends connect(store)(LitElement) implements props {
    @property()
    error: string | boolean = false;

    @property()
    loading: boolean = false;

    @property()
    values: FormValues = {};

    private _actions = APIActions('users', API);

    constructor() {
        super();
        this.submit = this.submit.bind(this);
    }


    _stateChanged(s: State) {
        this.error = s.resources.users._errors.post;
        this.loading = Boolean(s.resources.users._loading.post);
    }


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


    submit(e: {target: {values: object} }) {
        store.dispatch(this._actions.usersCreate(e.target.values));
    }


    render() {
        const {error, values} = this;
        return html`
            ${CSS}
            <div class="card shadow-main center-h">
                <img class="width-super margin-b-main margin-r-main display-ib float-left" src="/admin/images/icons/user/create.svg" />
                <h3 class="margin-t-small">Add ${values.fname
                    ? html`<strong>${values.fname}</strong>`
                    : 'a user'} to Origami
                </h3>
                <div class="clear">
                <zen-form
                    .error=${error}
                    .fields=${this.fields}
                    @change=${(e: {target: {values: object}}) => this.values = e.target.values}
                    @submit=${this.submit}
                ></zen-form>
            </div>
        `;
    }
}

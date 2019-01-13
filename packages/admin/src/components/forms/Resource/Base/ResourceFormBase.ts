import { APIActions } from '@origami/zen-lib/API';
import { Field, FormValues } from '@origami/zen-lib/FormValidator';
import { customElement, html, LitElement, property } from '@polymer/lit-element';
import { navigate } from 'actions/App';
import { BASE_URI } from 'const';
import {API} from 'lib/API';
import lodash from 'lodash';
import pluralize from 'pluralize';
// @ts-ignore
import { connect } from 'pwa-helpers/connect-mixin';
import { State, store } from 'store';
import CSS from './resource-form-css';


interface props {
  type?: 'create' | 'edit';
  resource?: string;

  fields: Field[];
  values: FormValues;
  error: string | boolean;
  loading: boolean;
}


export class ResourceFormBase extends connect(store)(LitElement) implements props {
  @property()
  public type?: 'create' | 'edit';

  @property()
  public resource?: string;


  @property()
  public error: string | boolean = false;

  @property()
  public loading: boolean = false;

  @property()
  public fields: Field[] = [];

  @property()
  public values: FormValues = {};

  protected _store = store;
  protected get _actions() {
    if (!this._resPlural) return {};
    return APIActions(this._resPlural, API);
  }


  protected get _resPlural() {
    return pluralize(this.resource || '');
  }

  protected get _resSingular() {
    return pluralize.singular(this.resource || '');
  }

  protected get _resPluralUpper() {
    return lodash.upperFirst(this._resPlural);
  }

  protected get _typeUpper() {
    return lodash.upperFirst(this.type);
  }


  constructor() {
    super();
    this.submit = this.submit.bind(this);
  }


  public _stateChanged(s: State) {
    const type = this.type === 'create' ? 'post' : 'edit';

    const res = s.resources[this._resPlural];
    // @ts-ignore Is a resource
    if (!res._errors || !res._loading) throw new Error('Not a resource');
    // @ts-ignore Is a resource
    this.error = res._errors[type];
    // @ts-ignore Is a resource
    this.loading = Boolean(res._loading[type]);
  }


  public async submit(e: { target: { values: object } }) {
    let type = this._typeUpper;
    if (type === 'Edit') type = 'Update';

    switch (type) {
      case 'Update':
        store.dispatch(
          // @ts-ignore Is a valid resource
          this._actions
          // @ts-ignore
          [`${this._resPlural}${type}`](this.id, e.target.values)
        );
        break;

      case 'Create':
        const res = await store.dispatch(
          // @ts-ignore Is a valid resource
          this._actions
          [`${this._resPlural}${type}`](e.target.values)
        );

        if (res && res.id) {
          store.dispatch(
            navigate(`${BASE_URI}/${this._resPlural}/${res.id}`)
          );
        }
    }
  }


  public render() {
    const { error, values, fields } = this;
    const f = [...fields, {
      type: 'submit',
      name: '',
      icon: this.type === 'create' ? 'add' : 'tick',
      value: this.type === 'create' ? 'Create' : 'Save',
      color: 'green'
    }];

    return html`
            ${CSS}
            <div class="card shadow-main center-h">
              <h3 class="margin-t-small">${this._typeUpper} a ${this._resSingular}</h3>
              <zen-form .error=${error} .fields=${f} .values=${values} @change=${(e: { target: { values: object } }) => this.values =
                e.target.values}
                @submit=${this.submit}
                ></zen-form>
            </div>
        `;
  }
}

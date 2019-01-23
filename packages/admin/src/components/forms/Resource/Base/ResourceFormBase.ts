import { APIActions } from '@origami/zen-lib/API';
import { Field, FormValues } from '@origami/zen-lib/FormValidator';
import { html, LitElement, property } from 'lit-element';
import upperFirst from 'lodash-es/upperFirst';
import pluralize from 'pluralize';
// @ts-ignore
import { connect } from 'pwa-helpers/connect-mixin';
import { navigate } from '../../../../actions/App';
import { BASE_URI } from '../../../../const';
import { API } from '../../../../lib/API';
import { State, store } from '../../../../store/store';
import CSS from './resource-form-css';


export class ResourceFormBase extends connect(store)(LitElement) {
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
    return upperFirst(this._resPlural);
  }

  protected get _typeUpper() {
    return upperFirst(this.type);
  }

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


  constructor() {
    super();
    this.submit = this.submit.bind(this);
  }


  public async submit(e: { target: { values: object } }) {
    let type = this._typeUpper;
    if (type === 'Edit') type = 'Update';

    switch (type) {
      case 'Update':
        store.dispatch<any>(
          // @ts-ignore Is a valid resource
          this._actions
          // @ts-ignore
          [`${this._resPlural}${type}`](this.resourceID, e.target.values)
        );
        break;

      case 'Create':
        const res = await store.dispatch<any>(
          // @ts-ignore Is a valid resource
          this._actions
          [`${this._resPlural}${type}`](e.target.values)
        );

        if (res && res.id) {
          store.dispatch<any>(
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
        <zen-form .error=${error} .fields=${f} .values=${values} @change=${(e: { target: { values: object } }) => this.values
          =
        e.target.values}
          @submit=${this.submit}
          ></zen-form>
      </div>
    `;
  }


  protected _stateChanged(s: State) {
    const type = this.type === 'create' ? 'post' : 'edit';

    const res = s.resources[this._resPlural];
    // @ts-ignore Is a resource
    if (!res._errors || !res._loading) throw new Error('Not a resource');
    // @ts-ignore Is a resource
    this.error = res._errors[type];
    // @ts-ignore Is a resource
    this.loading = Boolean(res._loading[type]);
  }
}

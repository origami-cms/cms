import { customElement, property } from '@polymer/lit-element';
import { navigate } from '../../../../actions/App';
import {matchPath} from '../../../../lib/matchPath';
import { State, store } from '../../../../store/store';
import { ResourceFormBase } from '../Base/ResourceFormBase';

// @ts-ignore
@customElement('form-resource-edit')
export class FormResourceEdit extends ResourceFormBase {
  @property()
  get id() {
    return this._id;
  }
  set id(v) {
    if (this._id === v || !v) return;
    this._id = v;
    this._get();
  }
  public _id?: string;

  @property()
  public uri?: string;

  public _redirecting: boolean = false;
  public _errorGet: string | boolean = false;
  public _errorEdit: string | boolean = false;
  public _loadingGet: string | boolean = false;
  public _loadingEdit: string | boolean = false;

  constructor() {
    super();
    this.type = 'edit';
  }

  protected _stateChanged(s: State) {
    super._stateChanged(s);
    // @ts-ignore
    const res = s.resources[this._resPlural];

    if (this._errorGet && !this._redirecting) {
      this._redirecting = true;
      if (window.location.pathname !== '/admin/404') store.dispatch(navigate('/admin/404'));
      return;
    }

    this._errorGet = res._errors.get;
    this._errorEdit = res._errors.edit;
    this._loadingEdit = Boolean(res._loading.edit);
    this._loadingGet = Boolean(res._loading.single);

    const match = matchPath(s.App.page.path, this.uri || `/admin/${this._resPlural}/:id`);

    if (match) {
      // tslint:disable
      if (this.id != match.params.id) this.id = match.params.id;
      const u = res[this._resPlural].find((r: any) => r.id === this.id);

      if (u) this.values = u;
    }
  }

  _get() {
    if (!this.id) return;
    if (!this._loadingGet) {
      // @ts-ignore Is a valid resource
      store.dispatch(this._actions[`${this._resPlural}Get`](this.id))
    }
  }
}

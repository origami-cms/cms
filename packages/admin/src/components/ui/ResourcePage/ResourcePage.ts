import { ZenRoute } from '@origami/zen';
import { APIReducer } from '@origami/zen-lib/API';
import { Field } from '@origami/zen-lib/FormValidator';
import { customElement, html, LitElement, property } from '@polymer/lit-element';
import _ from 'lodash';
import pluralize from 'pluralize';
import { injectReducer } from 'redux-injector';
import { FormResourceCreate, FormResourceEdit } from '../../forms/Resource';
import {ResourceTable} from '../ResourceTable/ResourceTable';

interface Schema {
  properties: {
    [key: string]: any;
  };
}

// @ts-ignore
@customElement('ui-resource-page')
export class ResourcePage extends LitElement {
  @property()
  public resource?: string;

  @property()
  public fieldsList?: string[];

  @property()
  public fieldsCreate?: string[];

  @property()
  public fieldsEdit?: string[];

  @property()
  public model?: Schema;

  @property()
  public uriBase?: string;

  @property()
  public listElement: string = 'ui-resource-table';

  @property()
  public editElement: string = 'form-resource-edit';

  @property()
  public createElement: string = 'form-resource-create';


  @property()
  get routes(): ZenRoute[] {
    if (!this.resource) return [];
    const base = this.uriBase || `/${this._resPlural}`;
    return [
      {
        path: `${base}`,
        element: this.listElement,
        exact: true,
        attributes: { resource: this.resource, uribase: base }
      },
      {
        path: `${base}/create`,
        element: this.createElement,
        attributes: { resource: this.resource }
      },
      {
        path: `${base}/:id`,
        element: this.editElement,
        attributes: { resource: this.resource, uri: `/admin${base}/:id` }
      }
    ];
  }
  set routes(v) { }

  private get _resPlural() {
    return pluralize(this.resource || '');
  }


  public render() {
    return html`
            <zen-router .routes=${this.routes} .base=${this.uriBase}></zen-router>
        `;
  }


  public connectedCallback() {
    super.connectedCallback();
    injectReducer(`resources.${this._resPlural}`, APIReducer(this._resPlural));
  }


  public updated() {
    const { fieldsList, fieldsCreate, fieldsEdit, model } = this;
    if (!model) return;

    const properties = model.properties;


    // @ts-ignore Shadow root exists
    const sr = this.shadowRoot as ShadowRoot;
    // @ts-ignore
    const list = sr.querySelector(this.listElement) as ResourceTable;
    // @ts-ignore
    const create = sr.querySelector(this.createElement) as FormResourceCreate;
    // @ts-ignore
    const edit = sr.querySelector(this.editElement) as FormResourceEdit;


    const getFields = (fields: string[]) => fields.map((f) => {

      let field = properties[f] as Field;
      // @ts-ignore
      if (typeof field === 'string') field = { type: field };
      // @ts-ignore
      if (field.asMutable) field = field.asMutable({ deep: true });

      // @ts-ignore
      if (field.type === 'uuid') {
        field.type = 'text';
        field.disabled = true;
      }

      field.name = f;
      // @ts-ignore
      if (!field.placeholder) field.placeholder = _.startCase(f);
      field.validate = { required: field.required };
      return field;
    });


    // TODO: Repair list columns on ResourceTable
    // if (list && fieldsList) list.columns = fieldsList;
    if (create && fieldsCreate) create.fields = getFields(fieldsCreate);
    if (edit && fieldsEdit) edit.fields = getFields(fieldsEdit);
  }
}

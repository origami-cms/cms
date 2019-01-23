// tslint:disable member-order
import { ButtonOptions } from '@origami/zen';
import { APIActions } from '@origami/zen-lib/API';
import { customElement, html, LitElement, property } from 'lit-element';
import pluralize from 'pluralize';
import { connect } from 'pwa-helpers/connect-mixin';
import { navigate } from '../../../actions/App';
import { API } from '../../../lib/API';
import { State, store } from '../../../store/store';
import CSS from './resource-table-css';


type ResourceTableData = {
  id: string;
  [key: string]: any;
};

@customElement('ui-resource-table')
export class ResourceTable extends connect(store)(LitElement) {


  private get _resPlural() {
    return pluralize(this.resource || '');
  }

  @property()
  public uriBase?: string;

  @property()
  // Update actions
  public resource?: string;

  @property()
  public idKey = 'id';

  @property()
  public selected: number[] = [];

  @property()
  public _data: ResourceTableData[] = [];

  @property()
  public _buttons: ButtonOptions[] = [];

  @property()
  public _actions: { [action: string]: Function } = {};


  constructor() {
    super();
    this._actionCreate = this._actionCreate.bind(this);
    this._actionEdit = this._actionEdit.bind(this);
    this._actionRemove = this._actionRemove.bind(this);
    this._handleRowClick = this._handleRowClick.bind(this);
  }


  public render() {
    return html`
        ${CSS}
        <zen-button-group .buttons=${this._buttons}></zen-button-group>
        <zen-table
          .data=${this._data}
          hoverable
          selectable
          @rowclick=${this._handleRowClick} @select=${this._handleSelect.bind(this)}
        >
          <slot></slot>
        </zen-table>
    `;
  }


  public updated(p: any) {
    if (p.has('resource')) this._updateActions();
    if (p.has('selected')) this._updateButtons();
  }

  public firstUpdated() {
    this._updateActions();
    this._get();
  }

  public stateChanged(s: State) {
    // @ts-ignore
    this._data = s.resources[this._resPlural][this._resPlural].asMutable();
  }

  private _get() {
    store.dispatch<any>(this._actions.get());
  }


  private async _actionCreate() {
    const base = `/admin${this.uriBase || `/${this._resPlural}`}`;
    store.dispatch<any>(navigate(`${base}/create`));
  }


  private async _actionEdit(id: string) {
    if (!id) throw new Error('No ID specified');

    const base = `/admin${this.uriBase || `/${this._resPlural}`}`;
    store.dispatch<any>(navigate(`${base}/${id}`));
  }


  private async _actionRemove() {
    store.dispatch<any>(
      this._actions.remove(
        this.selected.map((i) => this._data[i][this.idKey])
      )
    );
    // @ts-ignore
    this.shadowRoot!.querySelector('zen-table').selected = [];
  }


  private _updateActions() {
    const a = APIActions(this._resPlural, API);

    this._actions = {
      create: a[`${this._resPlural}Create`],
      get: a[`${this._resPlural}Get`],
      remove: a[`${this._resPlural}Remove`],
      update: a[`${this._resPlural}Update`]
    };
  }


  private _updateButtons() {

    const buttons = [];

    const s = this.selected;
    if (s.length >= 1) {
      buttons.push({
        icon: 'remove', text: 'Remove', color: 'red', size: 'medium',
        onclick: this._actionRemove
      });

      if (s.length === 1) {
        buttons.push({
          icon: 'edit', text: 'Edit', color: 'blue', size: 'medium',
          onclick: async() => this._actionEdit(this._data[s[0]].id)
        });
      }
    } else {
      buttons.push({
        icon: 'add', text: 'Create', color: 'green', size: 'medium',
        onclick: this._actionCreate
      });
    }

    this._buttons = buttons;
  }


  private _handleSelect(e: CustomEvent) {
    this.selected = e.detail;
    this._updateButtons();
  }


  private async _handleRowClick(e: CustomEvent) {
    // Disable opening a row if any rows are selected
    if (this.selected.length) return;

    await this._actionEdit(e.detail[this.idKey]);
  }
}

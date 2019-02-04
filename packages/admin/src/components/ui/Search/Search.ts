import { ZenInput } from '@origami/zen';
import Fuse from 'fuse.js';
import { customElement, html, LitElement, property } from 'lit-element';
import CSS from './search-css';

export const SEARCH_EVENT_FILTERED = 'filtered';

@customElement('ui-search')
export class Search<FilterItem> extends LitElement {
  public static styles = [CSS];


  /**
   * The items to filter
   */
  @property()
  public set items(v) {
    this._items = v;
  }
  public get items() {
    return this._items;
  }

  /**
   * The text entered to filter the items
   */
  @property()
  get filter() {
    return this._filter;
  }
  set filter(v) {
    this._filter = v;
    if (!this._fuse || !v) this._filtered = [];
    else this._filtered = this._fuse.search(v);

    this.dispatchEvent(new CustomEvent(
      SEARCH_EVENT_FILTERED,
      {detail: this.filter ? this._filtered : this.items}
    ));
  }


  get filtered() {
    if (!this.filter) return this.items;
    return this._filtered;
  }


  @property({type: String})
  public placeholder: string = 'Search…';

  /**
   * Keys to pass into Fuse.js to lookup on the items
   */
  @property({type: Array})
  public keys: (keyof FilterItem)[] = [];

  @property()
  private _filtered: FilterItem[] = [];

  private _items: FilterItem[] = [];

  @property()
  private _fuse?: Fuse<FilterItem>;
  private _filter: string | null = null;


  public render() {
    return html`
    <zen-input
      icon="search"
      iconColor="red"
      placeholder=${this.placeholder}
      @change=${this._onChange}
    ></zen-input>`;
  }


  public updated(props: Map<keyof Search<FilterItem>, string>) {
    if (props.has('items') || props.has('keys')) {
      this._fuse = new Fuse(this.items, {
        keys: this.keys
      });
    }
  }

  private _onChange(e: Event) {
    this.filter = (e.target as ZenInput).value;
  }
}


declare global {
  interface HTMLElementTagNameMap {
    'ui-search': Search<any>;
  }
}

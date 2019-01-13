import {bindAttributes} from '@origami/zen-lib/decorators';
import {customElement, html, LitElement, property} from '@polymer/lit-element';
import {getSidebarItems, toggleAppSelector} from 'actions/App';
import {BASE_URI} from 'const';
import fuse from 'fuse.js';
import {unsafeHTML} from 'lit-html/directives/unsafe-html';
// @ts-ignore
import {connect} from 'pwa-helpers/connect-mixin';
import { State, store } from 'store';
import {SidebarItem} from 'store/state';
import CSS from './app-selector-css';


export interface Routes {
    [path: string]: string;
}

interface props {
    apps: SidebarItem[];
    _filtered: SidebarItem[];
}


// @ts-ignore
@customElement('ui-app-selector')
@bindAttributes
export class AppSelector extends connect(store)(LitElement) implements props {

    @property()
    get filter() {
        return this._filter;
    }
    set filter(v) {
        this._filter = v;
        if (!this._fuse || !v) this._filtered = [];
        else this._filtered = this._fuse.search(v);
    }

    public static _boundAttributes = ['open'];
    @property()
    public open: boolean = false;

    @property()
    public apps: SidebarItem[] = [];

    @property()
    public _filtered: SidebarItem[] = [];

    private _fuse?: fuse<any>;
    private _filter?: string;

    constructor() {
        super();
        this._handleKeyDown = this._handleKeyDown.bind(this);
        this.close = this.close.bind(this);
    }

    public connectedCallback() {
        super.connectedCallback();
        document.addEventListener('keydown', this._handleKeyDown);
    }
    public disconnectedCallback() {
        document.removeEventListener('keydown', this._handleKeyDown);
        super.disconnectedCallback();
    }


    public _stateChanged(state: State) {
        this.apps = state.App.sidebar.items;
        this.open = state.App.appSelector.open;
        this._fuse = new fuse(this.apps, {
            keys: ['name']
        });
    }


    public firstUpdated() {
        store.dispatch(getSidebarItems());
    }


    public render() {
        const {_filtered, apps}  = this;
        let contents;

        if (this.filter && !_filtered.length) {
            contents = html`<span class="not-found">No apps found for '${this.filter}'. Try searching for something else.</span>`;

        } else {
            const _apps = _filtered.length ? _filtered : apps;
            const aniDelay = 0.13;
            const totalAniTime = 0.2;

            contents = html`
                <ul class="apps" @click=${this.close}>
                    ${_apps.map((a, i) => {
                        return unsafeHTML(`
                            <li style="animation-delay: ${(i / _apps.length) * totalAniTime + aniDelay}s">
                                <a href=${BASE_URI + a.path}>
                                    <ui-app-icon .icon=${a.icon}></ui-app-icon>
                                    <small>${a.name}</small>
                                </a>
                            </li>
                        `);
                    })}
                </ul>
            `;
        }


        // TODO: Add click event listener to the list item and not the list
        return html`
            ${CSS}
            <zen-icon type="cross" @click=${this.close} color="grey-200" size="large"></zen-icon>
            <h1>Applications</h1>

            <div class="wrapper">
                <zen-input icon="search"
                    placeholder="Search for an app…"
                    @change="${(e: {target: {value: string}}) => this.filter = e.target.value}"
                ></zen-input>

                ${contents}
            </div>
        `;
    }

    public close() {
        if (this.open) store.dispatch(toggleAppSelector(false));
    }

    private updated() {
        // @ts-ignore Shadow root exists
        if (this.open) this.shadowRoot.querySelector('zen-input').focus();
    }


    private _handleKeyDown(e: KeyboardEvent) {
        switch (e.key) {
            case 'Escape':
                this.close();
        }
    }
}


import { Form } from '@origami/zen';
import { Field } from '@origami/zen-lib/FormValidator';
import { customElement, html, LitElement, property } from '@polymer/lit-element';
import { setLogo, setTheme } from 'actions/Organization';
import { connect } from 'pwa-helpers/connect-mixin';
import { State, store } from 'store';
import { OrganizationTheme } from 'store/state';
import CSS from './organization-css';


// @ts-ignore
@customElement('page-settings-organization')
export class PageSettingsOrganization extends connect(store)(LitElement) {
  @property()
  theme?: OrganizationTheme;
  static _formGeneral: Field[] = [
    {
      type: 'text',
      label: 'Organization name',
      placeholder: 'Organization name',
      name: 'name',
      icon: 'organization'
    },
    {
      type: 'text',
      label: 'Website',
      placeholder: 'Website',
      name: 'website',
      icon: 'web'
    }
  ];
  static _formTheme: Field[] = [
    {
      type: 'color',
      label: 'Main color',
      name: 'colorMain',
      width: 'half'
    },
    {
      type: 'color',
      label: 'Secondary color',
      name: 'colorSecondary',
      width: 'half'
    },
    {
      name: 'submit',
      type: 'submit',
      value: 'Save',
      icon: 'tick',
      color: 'green'
    }
  ];

  constructor() {
    super();
    this._saveTheme = this._saveTheme.bind(this);
    this._handleUpload = this._handleUpload.bind(this);
  }

  private _stateChanged(s: State) {
    this.theme = s.Organization.theme;
  }

  render() {
    const { theme } = this;
    // @ts-ignore
    const formG: Fields[] = this.constructor._formGeneral;
    // @ts-ignore
    const formT: Fields[] = this.constructor._formTheme;

    return html`
            ${CSS}
            <div class="general">
              <h4>General settings</h4>
              <div class="logo">
                <zen-button color="blue" icon="upload">Update logo</zen-button>
                <ui-file-uploader placeholder="/admin/images/logo" @upload=${this._handleUpload}></ui-file-uploader>
              </div>
              <zen-form .fields=${formG}></zen-form>
            </div>

            <hr />

            <div class="theme">
              <h4>Theme</h4>
              <zen-form .values=${theme} .fields=${formT} @submit=${this._saveTheme}></zen-form>
            </div>
        `;
  }

  private _saveTheme(e: { target: Form }) {
    const { colorMain, colorSecondary } = e.target.values;

    store.dispatch(setTheme(colorMain, colorSecondary));
  }

  private async _handleUpload(e: CustomEvent) {
    if (e.detail && e.detail.id) {
      const setting = await store.dispatch(setLogo(e.detail.id));
    }
  }
}

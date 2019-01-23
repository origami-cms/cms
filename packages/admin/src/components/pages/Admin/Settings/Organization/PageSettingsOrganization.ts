import { Form } from '@origami/zen';
import { Field } from '@origami/zen-lib/FormValidator';
import { customElement, html, LitElement, property } from 'lit-element';
import { connect } from 'pwa-helpers/connect-mixin';
import { setLogo, setTheme } from '../../../../../actions/Organization';
import { } from '../../../../../store/state';
import { OrganizationTheme, State, store } from '../../../../../store/store';
import CSS from './organization-css';


@customElement('page-settings-organization')
export class PageSettingsOrganization extends connect(store)(LitElement) {
  public static _formGeneral: Field[] = [
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
  public static _formTheme: Field[] = [
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
  @property()
  public theme?: OrganizationTheme;

  constructor() {
    super();
    this._saveTheme = this._saveTheme.bind(this);
    this._handleUpload = this._handleUpload.bind(this);
  }

  public render() {
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

  public stateChanged(s: State) {
    this.theme = s.Organization.theme;
  }

  private _saveTheme(e: { target: Form }) {
    const { colorMain, colorSecondary } = e.target.values;

    store.dispatch<any>(setTheme(colorMain, colorSecondary));
  }

  private async _handleUpload(e: CustomEvent) {
    if (e.detail && e.detail.id) {
      const setting = store.dispatch<any>(setLogo(e.detail.id));
    }
  }
}

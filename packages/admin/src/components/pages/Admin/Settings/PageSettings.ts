
import { ZenRoute } from '@origami/zen';
import { customElement, html, LitElement } from 'lit-element';
import { titleSet } from '../../../../lib/decorators/titleSet';
import { Me } from '../../../../store/state';
import CSS from './page-settings-css';

interface PageSettingsProps {
  me?: Me;
}

export * from './Organization/PageSettingsOrganization';
export * from './SettingsMenu/SettingsMenu';

@customElement('page-settings')
@titleSet('Settings')
export class PageSettings extends LitElement implements PageSettingsProps {
  public me?: Me;
  public base = '/admin/settings';

  public routes: ZenRoute[] = [
    {
      path: '/organization',
      element: 'page-settings-organization'
    },
    {
      path: '/me',
      element: 'page-settings-me'
    }
  ];

  public render() {
    return html`
            ${CSS}
            <page-settings-menu></page-settings-menu>
            <zen-router base=${this.base} .routes=${this.routes}></zen-router>
        `;
  }
}

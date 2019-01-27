import { APIReducer } from '@origami/zen-lib/API';
import { App } from './App';
import { Apps } from './Apps';
import { Auth } from './Auth';
import { Me } from './Me';
import { Organization } from './Organization';
import { Setup } from './Setup';
import { UploadingMedia } from './UploadingMedia';

// tslint:disable-next-line export-name
export const reducers = {
    Auth,
    App,
    Apps,
    Me,
    Setup,
    Organization,
    UploadingMedia,
    resources: {
        users: APIReducer('users'),
        media: APIReducer('media'),
    }
};

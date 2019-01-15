import { AnyAction } from 'redux';
// tslint:disable-next-line match-default-export-name
import immutable from 'seamless-immutable';
import { APP_ENTRY_SET, APPS_SET } from '../actions/Apps';
import { Apps as StateApps } from '../store/state';


const initialState = immutable.from<StateApps>({
    apps: {},
    entries: {}
});

// tslint:disable-next-line variable-name
export const Apps = (state = initialState, action: AnyAction) => {
    const existingApp = state.apps[action.appName] || {};

    switch (action.type) {
        case APPS_SET:
            return state.set('apps', action.apps);
            // // Wrap the apps in a {manifest} object
            // const apps = (Object.entries(action.apps).map(
            //     ([name, manifest]) => ([
            //         name, {manifest, pages: {}},
            //     ])
            // ) as [string, any][])
            // // Convert back to object
            // .reduce(
            //     (_apps, [name, manifest]) => {
            //         _apps[name] = manifest;
            //         return _apps;
            //     }, {} as {[name: string]: any});

            // return state.set('apps', deepmerge(
            //     state.set,
            //     apps
            // ));


        case APP_ENTRY_SET:
            return state.setIn(['entries', action.app], action.html);

        // case APP_SET:
        //     let manifest = existingApp || {};
        //     // Stop pages from being loaded multiple times
        //     // @ts-ignore
        //     if (manifest.pages) manifest = manifest.set('pages', []);

        //     return state.setIn(['apps', action.appName, 'manifest'], deepmerge(
        //         manifest,
        //         action.app
        //     ));


        // case APPS_PAGE_SET:
        //     if (existingApp) {
        //         return state.setIn(['apps', action.appName, 'pages', action.path], action.tagName);
        //     }

        default:
            return state;

    }
};

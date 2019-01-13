import {API} from 'lib/API';
import { Dispatch } from 'redux';

export const APPS_SET = 'APPS_SET';
export const APP_ENTRY_SET = 'APP_ENTRY_SET';


export const appsGet = () =>
  async (dispatch: Dispatch) => {
      const { data } = await API.get('/apps/');
      if (data) dispatch({ type: APPS_SET, apps: data });
      return data;
  };

export const appGetEntry = (app: string) =>
  async (dispatch: Dispatch) => {

      const html = await API.get(`/apps/${app}/entry`, true, 'text');

      if (html) {
      // @ts-ignore
        dispatch({ type: APP_ENTRY_SET, app, html });
        return html;
    }
  };


// export const appGetPage = (appName: string, page: Origami.AppManifestPage) =>
//     async (dispatch: Dispatch) => {
//         // @ts-ignore is a string from 'text'
//         const content = await API.get(
//             `/apps/${appName}/pages/${page.page}`, true, 'text'
//         ) as string;

//         const scriptPromises: Promise<any>[] = [];

//         if (page.scripts) {
//             page.scripts.forEach(s => {
//                 scriptPromises.push(API.get(`/apps/${appName}/scripts/${s}`, true, 'text'));
//             });
//         }

//         const scripts = (await Promise.all(scriptPromises)).filter(s => s);


//         const tagName = AppGenerator.generate(appName, page.page, content, scripts);
//         dispatch({type: APPS_PAGE_SET, appName, path: page.path, tagName});
//     };

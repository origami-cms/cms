import { ButtonOptions } from '@origami/zen';
import { Dispatch } from 'redux';


export const APP_SIDEBAR_ITEMS_SET = 'APP_JEWEL_ITEMS_SET';
export const APP_PATH_UPDATE = 'APP_PATH_UPDATE';
export const APP_TABS_NEW = 'APP_TABS_NEW';
export const APP_TABS_CLOSE = 'APP_TABS_CLOSE';
export const APP_TABS_NAME = 'APP_TABS_NAME';
export const APP_TITLE_SET = 'APP_TITLE_SET';
export const APP_ACTIONS_SET = 'APP_ACTIONS_SET';
export const APP_SELECTOR_SET = 'APP_SELECTOR_SET';


export const getSidebarItems = () =>
  (dispatch: Dispatch) => {
    // TODO: Convert to endpoint
    dispatch({
      type: APP_SIDEBAR_ITEMS_SET, items: [
        // {
        //     icon: {type: 'page', background: 'red'},
        //     path: '/pages',
        //     name: 'Pages'
        // },
        // {
        //     icon: {type: 'dollar', background: 'green'},
        //     path: '/app/sales',
        //     name: 'Sales'
        // },
        // {
        //     icon: {type: 'messages', background: 'orange'},
        //     path: '/app/engagement',
        //     name: 'Engagement'
        // },
        {
          icon: { type: 'user', background: 'blue' },
          path: '/users/',
          name: 'Users'
        },
        {
            icon: {type: 'image', background: 'green'},
            path: '/media/',
            name: 'media'
        },
        {
          icon: { type: 'settings', background: 'white', color: 'grey-700' },
          path: '/settings/',
          name: 'Settings'
        }
      ]
    });
  };


export const titleSet = (title: string) =>
  (dispatch: Dispatch) => dispatch({ type: APP_TITLE_SET, title });


export const pageActionsSet = (actions: ButtonOptions) =>
  (dispatch: Dispatch) => dispatch({ type: APP_ACTIONS_SET, actions });


export const navigate = (path: string) =>
  async (dispatch: Dispatch) => {

    if (window.location.pathname !== path) {
      window.history.pushState({}, '', path);
      dispatchEvent(new PopStateEvent('popstate', { state: {} }));
    }

    updatePath(path);
  };


export const updatePath = (path: string) =>
  (dispatch: Dispatch) => {
    dispatch({ type: APP_PATH_UPDATE, path });
  };


export const toggleAppSelector = (open: boolean) =>
  async (dispatch: Dispatch) => dispatch({ type: APP_SELECTOR_SET, open });

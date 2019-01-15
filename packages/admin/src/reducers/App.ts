import {AnyAction} from 'redux';
// tslint:disable-next-line match-default-export-name
import immutable from 'seamless-immutable';
import {
  APP_ACTIONS_SET,
  APP_PATH_UPDATE,
  APP_SELECTOR_SET,
  APP_SIDEBAR_ITEMS_SET,
  APP_TITLE_SET
} from '../actions/App';
import {TITLE_PREFIX} from '../const';
import {App as StateApp} from '../store/state';

const initialState = immutable.from<StateApp>({
    sidebar: {
        items: []
    },
    page: {
        title: '',
        path: window.location.pathname,
        actions: []
    },
    appSelector: {
        open: false
    }
});

// tslint:disable-next-line variable-name
export const App = (state = initialState, action: AnyAction) => {
    switch (action.type) {
        case APP_PATH_UPDATE:
            return state.setIn(['page', 'path'], action.path);

        case APP_SIDEBAR_ITEMS_SET:
            return state.setIn(['sidebar', 'items'], action.items);

        case APP_TITLE_SET:
            document.title = `${TITLE_PREFIX}${action.title}`;
            return state.setIn(['page', 'title'], action.title);

        case APP_ACTIONS_SET:
            return state.setIn(['page', 'actions'], action.actions);

        case APP_SELECTOR_SET:
            return state.setIn(['appSelector', 'open'], action.open);

        default:
            return state;
    }
};

import * as actions from 'actions/index';
import { API } from 'lib/API';
import { injectReducer } from 'redux-injector';
import { store } from 'store';

declare global {
  interface Window { Origami: OrigamiAdmin; }
}


export default class OrigamiAdmin {
  api = API;
  store = store;
  actions = actions;

  injectReducer = injectReducer;
}

window.Origami = window.Origami || new OrigamiAdmin();

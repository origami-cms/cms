import * as actions from './actions/index';
import { API } from './lib/API';
import { injectReducer } from './lib/reduxInjector';
import { store } from './store/store';

declare global {
  interface Window { Origami: OrigamiAdmin; }
}


export class OrigamiAdmin {
  public api = API;
  public store = store;
  public actions = actions;

  public injectReducer = injectReducer;
}

window.Origami = window.Origami || new OrigamiAdmin();

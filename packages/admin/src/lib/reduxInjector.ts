/**
 * Clone of redux-injector without lodash dependency (so it can be treeshaken)
 * https://www.npmjs.com/package/redux-injector
 */

//  TODO: Fix ts-ignores

import has from 'lodash-es/has';
import set from 'lodash-es/set';
import { combineReducers, createStore, Reducer, Store } from 'redux';

// @ts-ignore
let store: Store = {};
let combine = combineReducers;

export type Reducers = any;

const combineReducersRecurse = (reducers: Reducers | Function): Function => {
  // If this is a leaf or already combined.
  if (typeof reducers === 'function') {
    return reducers;
  }

  // If this is an object of functions, combine reducers.
  if (typeof reducers === 'object') {
    const combinedReducers: Reducers = {};
    for (const key of Object.keys(reducers)) {
      // @ts-ignore
      combinedReducers[key] = combineReducersRecurse(reducers[key]);
    }
    return combine(combinedReducers);
  }

  // If we get here we have an invalid item in the reducer path.
  // @ts-ignore
  throw new Error({
    message: 'Invalid item in reducer tree',
    item: reducers
  });
};

export const createInjectStore = (initialReducers: Reducers | Function, ...args: any) => {
  // If last item is an object, it is overrides.
  if (typeof args[args.length - 1] === 'object') {
    const overrides = args.pop();
    // Allow overriding the combineReducers function such as with redux-immutable.
    if (
      overrides.hasOwnProperty('combineReducers') &&
      typeof overrides.combineReducers === 'function'
    ) {
      combine = overrides.combineReducers;
    }
  }

  store = createStore(
    combineReducersRecurse(initialReducers) as Reducer,
    ...args
  );

  // @ts-ignore
  store.injectedReducers = initialReducers;

  return store;
};

export const injectReducer = (path: string, reducer: Function, force = false) => {
  // If already set, do nothing.
  // @ts-ignore
  if (has(store.injectedReducers, path) || force) return;

  // @ts-ignore
  set(store.injectedReducers, path, reducer);
  // @ts-ignore
  store.replaceReducer(combineReducersRecurse(store.injectedReducers));
};

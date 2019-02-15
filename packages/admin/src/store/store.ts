import { applyMiddleware, compose } from 'redux';
// tslint:disable-next-line match-default-export-name
import thunkMiddleware from 'redux-thunk';
import { createInjectStore } from '../lib/reduxInjector';
import { reducers } from '../reducers';


export const store = createInjectStore(
    reducers,
    compose(
      applyMiddleware(
        thunkMiddleware
      )
    )
);

export * from './state';


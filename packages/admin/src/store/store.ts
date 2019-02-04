import { applyMiddleware, compose } from 'redux';
// tslint:disable-next-line match-default-export-name
import thunkMiddleware from 'redux-thunk';
import { createInjectStore } from '../lib/reduxInjector';
import { reducers } from '../reducers';


export const store = createInjectStore(
    reducers,
    compose(
      applyMiddleware(
        thunkMiddleware,
      ),
      // @ts-ignore
      window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()
    )
);

export * from './state';


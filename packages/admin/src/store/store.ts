import {applyMiddleware} from 'redux';
import {createInjectStore} from 'redux-injector';
// tslint:disable-next-line match-default-export-name
import thunkMiddleware from 'redux-thunk';
import {reducers} from '../reducers';

export const store = createInjectStore(
    reducers,
    applyMiddleware(
        thunkMiddleware
    )
);

export * from './state';

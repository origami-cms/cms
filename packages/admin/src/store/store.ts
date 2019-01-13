import {applyMiddleware} from 'redux';
import {createInjectStore} from 'redux-injector';
import thunkMiddleware from 'redux-thunk';
import {reducers} from '../reducers';

export const store = createInjectStore(
    reducers,
    applyMiddleware(
        thunkMiddleware
    )
);

export * from './state';

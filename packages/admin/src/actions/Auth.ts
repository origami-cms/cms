import CODES from 'http-status-codes';
import {Dispatch} from 'redux';
import {API} from '../lib/API';


export const AUTH_LOADING_SET_VERIFYING = 'AUTH_LOADING_SET_VERIFYING';
export const AUTH_LOADING_SET_LOGGINGIN = 'AUTH_LOADING_SET_LOGGINGIN';
export const AUTH_CLEAR = 'AUTH_CLEAR';

export const AUTH_VERIFIED = 'AUTH_VERIFIED';
export const AUTH_VERIFIED_FAILED = 'AUTH_VERIFIED_FAILED';

export const AUTH_LOGIN = 'AUTH_LOGIN';
export const AUTH_LOGIN_FAILED = 'AUTH_LOGIN_FAILED';

export const AUTH_LOGOUT = 'AUTH_LOGOUT';


import {
    ME_EMAIL_SET
} from './Me';


export const login = (email: string, password: string) =>
    async (dispatch: Dispatch) => {
        dispatch({type: ME_EMAIL_SET, email});
        dispatch({type: AUTH_LOADING_SET_LOGGINGIN, loading: true});
        try {

            const {data} = await API.post('/auth/login', {
                email, password
            });
            dispatch({type: AUTH_LOGIN, ...data});
            dispatch({type: AUTH_LOADING_SET_LOGGINGIN, loading: false});

            return data;
        } catch (e) {

            dispatch({type: AUTH_LOADING_SET_LOGGINGIN, loading: false});

            return dispatch({type: AUTH_LOGIN_FAILED, message: e.message});
        }


    };

export const verify = () =>
    async (dispatch: Dispatch) => {
        try {
            const {data} = await API.get('/auth/verify');

            dispatch({type: AUTH_VERIFIED});

            return (data as {token: string}).token;

        } catch (e) {
            if (e.code === CODES.UNAUTHORIZED || e.code === CODES.BAD_REQUEST) {
                dispatch({type: AUTH_VERIFIED_FAILED, message: e.message});
                dispatch({type: AUTH_CLEAR});
            }

            return false;
        }
    };


export const logout = () =>
    (dispatch: Dispatch) => dispatch({type: AUTH_LOGOUT});

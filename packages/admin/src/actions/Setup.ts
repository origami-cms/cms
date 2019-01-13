import {API} from 'lib/API';
import {Dispatch} from 'redux';

export const SETUP_LOADING_SET = 'SETUP_LOADING_SET';
export const SETUP_SET = 'SETUP_SET';
export const SETUP_USER_ERROR_SET = 'SETUP_USER_ERROR_SET';
export const SETUP_USER_SET = 'SETUP_USER_SET';


export const isSetup = () =>
    async (dispatch: Dispatch) => {
        const {data} = await API.get(`/setup`);
        dispatch({type: SETUP_SET, setup: (data as {setup: boolean}).setup});
    };

export const setupUser = (user: object) =>
    async (dispatch: Dispatch) => {
        dispatch({type: SETUP_LOADING_SET, loading: true});

        try {
            const {data} = await API.post(`/setup/user`, user);
            dispatch({type: SETUP_USER_SET, user: data});
        } catch (e) {
            dispatch({type: SETUP_USER_ERROR_SET, error: e.message});
        }

        dispatch({type: SETUP_LOADING_SET, loading: false});
    };

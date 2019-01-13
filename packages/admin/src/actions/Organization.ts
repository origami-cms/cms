import {Dispatch} from 'redux';
import {API} from 'lib/API';

export const ORG_LOGO_SET = 'ORG_LOGO_SET';
export const ORG_THEME_SET = 'ORG_THEME_SET';


export const getTheme = () =>
    async (dispatch: Dispatch) => {
        const {data} = await API.get('/admin/theme');
        dispatch({type: ORG_THEME_SET, theme: data});
    };

export const setTheme = (colorMain: string, colorSecondary: string) =>
    async (dispatch: Dispatch) => {
        const {data} = await API.post('/admin/theme',  {
            colorMain, colorSecondary
        });

        dispatch({type: ORG_THEME_SET, theme: data});
    };

export const setLogo = (mediaId: string) =>
    async (dispatch: Dispatch) => {
        const {data} = await API.post('/admin/logo',  {
            logo: mediaId
        });
        dispatch({type: ORG_LOGO_SET});
        return true;
    };


import {API} from 'lib/API';
import {APIActions, APIResponse} from '@origami/zen-lib/API';
import {Dispatch} from 'redux';
import {Page} from 'store/state';

export const PAGES_SET = 'PAGES_SET';
export const PAGES_UPDATED = 'PAGES_UPDATED';
export const PAGES_REMOVED = 'PAGES_REMOVED';
export const PAGE_PROPERTIES_SET = 'PAGE_PROPERTIES_SET';
export const PAGE_DATA_SET = 'PAGE_DATA_SET';

export const PAGES_TREE_SET = 'PAGES_TREE_SET';
export const PAGES_GET_ERROR = 'PAGES_GET_ERROR';


export const {
    pagesCreate,
    pagesGet,
    pagesUpdate,
    pagesRemove
} = APIActions('pages', API);


export const pagesPropertiesGet = async (id: string) =>
    async (dispatch: Dispatch) => {
        const {data: properties} = await API.get(`/pages/${id}/properties`);
        dispatch({type: PAGE_PROPERTIES_SET, id, properties});
    };


export const pagesDataUpdate = async(id: string, data: object) =>
    async (dispatch: Dispatch) => {
        await API.put(`/pages/${id}/properties`, data);
        dispatch({type: PAGE_DATA_SET, id, data});
    };


export const pagesTreeGet = async(parent = '') =>
    async (dispatch: Dispatch) => {
        const {data: pages} = await API.get(`/pages/tree/${parent}`);
        dispatch({type: PAGES_TREE_SET, parent, pages});
    };


export const pagesTreeMove = (pages: Page[], parent: string) =>
    () => {
        const execs: Promise<APIResponse>[] = [];
        pages.forEach(p => {
            execs.push(API.post(`/pages/${p.id}/move`, {parent}));
        });

        return Promise.all(execs);
    };

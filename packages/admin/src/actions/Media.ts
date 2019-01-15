// tslint:disable export-name

import {Dispatch} from 'redux';
import {API} from '../lib/API';

export const upload = (file: File) =>
    async(dispatch: Dispatch) => {
        const fd = new FormData();
        fd.set('file', file);

        return API.post('/media', fd);
    };

import {API} from 'lib/API';
import {Dispatch} from 'redux';

export const upload = (file: File) =>
    async(dispatch: Dispatch) => {
        const fd = new FormData();
        fd.set('file', file);

        return API.post('/media', fd);
    };

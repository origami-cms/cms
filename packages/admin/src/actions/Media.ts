// tslint:disable export-name

import { APIActions } from '@origami/zen-lib/API';
import { Dispatch } from 'redux';
import { API } from '../lib/API';

export const {
  mediaGet,
  mediaUpdate,
  mediaRemove
} = APIActions('media', API);

export const upload = (file: File) =>
  async (dispatch: Dispatch) => {
    const fd = new FormData();
    fd.set('file', file);

    return API.post('/media', fd);
  };

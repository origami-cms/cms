import { Dispatch } from 'redux';
import { API } from '../lib/API';

export const UPLOADING_MEDIA_START = 'UPLOADING_MEDIA_START';
export const UPLOADING_MEDIA_PREVIEW = 'UPLOADING_MEDIA_PREVIEW';
export const UPLOADING_MEDIA_PROGRESS = 'UPLOADING_MEDIA_PROGRESS';
export const UPLOADING_MEDIA_ERROR = 'UPLOADING_MEDIA_ERROR';
export const UPLOADING_MEDIA_END = 'UPLOADING_MEDIA_END';

export const uploadProgress = (file: File) =>
  async (dispatch: Dispatch) => {
    const id = `${file.name}/${file.lastModified}-${file.size}-${Date.now()}`;
    const reader = new FileReader();
    reader.onload = (e: ProgressEvent) => {
      // @ts-ignore
      dispatch({ type: UPLOADING_MEDIA_PREVIEW, id, preview: e.target!.result});
    };
    reader.readAsDataURL(file);

    const formData = new FormData();
    formData.set('file', file);
    const request = new XMLHttpRequest();
    request.open('POST', '/api/v1/media');
    request.setRequestHeader('Authorization', API.token!);

    dispatch({type: UPLOADING_MEDIA_START, id, name: file.name});

    request.upload.onprogress = ((e: ProgressEvent) => {
      dispatch({
        type: UPLOADING_MEDIA_PROGRESS,
        id,
        progress: e.loaded / e.total * 100
      });
    });

    request.upload.onerror = ((e: ProgressEvent) => {
      dispatch({
        type: UPLOADING_MEDIA_ERROR,
        id
      });
    });

    request.upload.onloadend = ((e: ProgressEvent) => {
      dispatch({
        type: UPLOADING_MEDIA_END,
        id
      });
    });

    request.send(formData);

  };

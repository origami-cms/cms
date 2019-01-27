import { AnyAction } from 'redux';
// tslint:disable-next-line match-default-export-name
import immutable, { ImmutableObjectMixin } from 'seamless-immutable';
import { UPLOADING_MEDIA_PREVIEW, UPLOADING_MEDIA_PROGRESS, UPLOADING_MEDIA_START } from '../actions/UploadMedia';
import { UploadingMedia as StateUploadingMedia, UploadingResource } from '../store/state';

const initialState = immutable.from<StateUploadingMedia>({
  uploading: [],
  error: []
});
// tslint:disable-next-line variable-name
export const UploadingMedia = (
  state: ImmutableObjectMixin<StateUploadingMedia> = initialState,
  action: AnyAction
) => {
  switch (action.type) {
    case UPLOADING_MEDIA_START:
      const upload: UploadingResource = {
        id: action.id,
        error: null,
        name: action.name,
        preview: null,
        progress: 0,
        created: new Date()
      };

      return state.set('uploading', [...state.asMutable().uploading, upload]);


    case UPLOADING_MEDIA_PROGRESS:
      const index1 = state.asMutable().uploading.findIndex((r) => r.id === action.id);
      if (index1 < 0) return state;

      return state.setIn(['uploading', index1, 'progress'], action.progress);

    case UPLOADING_MEDIA_PREVIEW:
      const index2 = state.asMutable().uploading.findIndex((r) => r.id === action.id);
      if (index2 < 0) return state;

      return state.setIn(['uploading', index2, 'preview'], action.preview);


    default:
      return state;
  }
};

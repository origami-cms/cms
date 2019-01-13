import { SETUP_LOADING_SET, SETUP_SET, SETUP_USER_ERROR_SET, SETUP_USER_SET } from 'actions/Setup';
import { AnyAction } from 'redux';
import immutable, { ImmutableObjectMixin } from 'seamless-immutable';
import { Setup as StateSetup } from 'store/state';

const initialState = immutable.from<StateSetup>({
  setup: false,
  user: false,
  errors: {
    user: false
  },
  loading: {
    user: false
  }
});

// tslint:disable-next-line variable-name
export const Setup = (
  state: ImmutableObjectMixin<StateSetup> = initialState,
  action: AnyAction
) => {
  switch (action.type) {
    case SETUP_USER_ERROR_SET:
      return state.setIn(['errors', 'user'], action.error);


    case SETUP_LOADING_SET:
      return state.setIn(['loading', 'user'], action.loading);


    case SETUP_SET:
      return state.set('setup', action.setup);


    case SETUP_USER_SET:
      return state.set('user', action.user);


    default:
      return state;
  }
};

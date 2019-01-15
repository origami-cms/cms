import {AnyAction} from 'redux';
// tslint:disable-next-line match-default-export-name
import immutable, {ImmutableObjectMixin} from 'seamless-immutable';
import {ME_EMAIL_SET, ME_SET} from '../actions/Me';
import {LS_EMAIL} from '../const';
import {Me as StateMe} from '../store/state';


const initialState = immutable.from({
    id: null,
    fname: null,
    lname: null,
    email: localStorage.getItem(LS_EMAIL)
});

// tslint:disable-next-line variable-name
export const Me = (state: ImmutableObjectMixin<StateMe> = initialState, action: AnyAction) => {
    switch (action.type) {
        case ME_SET:
            return state.merge(action.me);


        case ME_EMAIL_SET:
            localStorage.setItem(LS_EMAIL, action.email);

            return state.set('email', action.email);


        default:
            return state;
    }
};

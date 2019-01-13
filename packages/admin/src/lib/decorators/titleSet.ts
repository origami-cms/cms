import { State, store } from 'store';
import {titleSet} from 'actions/App';


export default (title: string) =>
    <T extends { new(...args: any[]): {} }>(constructor: T) =>
        class TitleSet extends constructor {
            firstUpdated = () => {
                // @ts-ignore
                super.firstUpdated();
                store.dispatch(titleSet(title));
            }
        };

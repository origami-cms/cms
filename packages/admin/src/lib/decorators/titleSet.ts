import { titleSet as titleSetAction } from '../../actions/App';
import { store } from '../../store/store';


export const titleSet = (title: string) =>
  <T extends new(...args: any[]) => {}>(constructor: T) =>
    class TitleSet extends constructor {
      public firstUpdated = () => {
        // @ts-ignore
        super.firstUpdated();
        store.dispatch<any>(titleSetAction(title));
      }
    };

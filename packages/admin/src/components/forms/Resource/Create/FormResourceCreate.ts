import {customElement} from 'lit-element';
import {ResourceFormBase} from '../Base/ResourceFormBase';


@customElement('form-resource-create')
export class FormResourceCreate extends ResourceFormBase {
    constructor() {
        super();
        this.type = 'create';
    }
}

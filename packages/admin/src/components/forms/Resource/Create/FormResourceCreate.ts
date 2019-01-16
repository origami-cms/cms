import {customElement} from 'lit-element';
import {ResourceFormBase} from '../Base/ResourceFormBase';


// @ts-ignore
@customElement('form-resource-create')
export class FormResourceCreate extends ResourceFormBase {
    constructor() {
        super();
        this.type = 'create';
    }
}

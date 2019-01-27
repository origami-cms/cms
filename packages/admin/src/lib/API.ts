import {API as _API} from '@origami/zen-lib/API';
import {SERVER_API} from '../const';

export const API = new _API(SERVER_API, 'Authorization');

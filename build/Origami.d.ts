import 'colors';
import { Origami } from 'origami-core-lib';
import Server from 'origami-core-server';
export default class OrigamiInstance {
    server: Server | null;
    private _readyFuncs;
    private _config;
    private _store;
    private _admin;
    private _ready;
    constructor(config: Origami.Config);
    ready(func: Function): void;
    private _init;
    private _setup;
    private _setupStore;
    private _setupAdmin;
    private _setupServer;
}

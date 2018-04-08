import 'colors';
import Server from 'origami-core-server';
import { Origami } from 'origami-core-lib';
export default class OrigamiRunner {
    server: Server | null;
    private _readyFuncs;
    private _config;
    private _store;
    private _admin;
    constructor(config: Origami.Config);
    _init(c: Origami.Config): Promise<void>;
    _setup(): Promise<void>;
    _setupStore(): Promise<void>;
    _setupAdmin(): void;
    _setupServer(): Promise<void>;
    ready(func: Function): void;
}

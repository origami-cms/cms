import {App as AppNS} from '../index';
import {Server} from '../../../server';
import 'jest-extended';

const {App} = AppNS;


describe('core-server.App.constructor()', () => {
    let server: Server;

    beforeEach(() => {
        server = new Server();
    });
    it('should setup an App', () => {
        const name = 'test-app';
        const app = new App(name, server);
        expect(app.name).toEqual(name);
        expect(app.name).toBeString();
        expect(app.server).toEqual(server);
        expect(app);
    });

    it('should throw error if no server is passed', () => {
        // @ts-ignore Force error
        const app = new App('test-app');
    });
});

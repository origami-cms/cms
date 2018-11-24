import { Origami, Route } from '@origami/core-lib';
import http from 'http-status-codes';
import 'jest-extended';
import { TestServer } from '../../../../../lib/testing';
import { statuses as ln } from '../../statuses';
const statuses = ln.enUS;

const STATUS_E_INTERNAL = statuses.general.errors.internal[0];

describe('core-server.middleware.errors', () => {
    let ts: TestServer;

    beforeEach(async () => {
        ts = new TestServer();
        await ts.init();
        await ts.serve();
    });
    afterEach(() => ts.stop());

    it('should handle non async errors (next(err))', async() => {
        ts.mountErrorMW(undefined, undefined, undefined, false);
        try { await ts.requestJSON() }
        catch (e) { ts.expectError(e, STATUS_E_INTERNAL) }
    });

    it('should handle async errors', async () => {
        ts.mountErrorMW();
        try { await ts.requestJSON() }
        catch (e) { ts.expectError(e, STATUS_E_INTERNAL) }
    });

    it('should handle custom errors', async() => {
        const error = 'custom error';
        ts.mountErrorMW(error);
        try { await ts.requestJSON() }
        catch (e) { ts.expectError(e, error) }
    });

    it('should handle custom errors with custom err.statusCode', async() => {
        const error = 'custom error';
        ts.mountErrorMW(error, http.UNAUTHORIZED);
        try { await ts.requestJSON() }
        catch (e) { ts.expectError(e, error, http.UNAUTHORIZED) }
    });

    it('should show error data with err.data', async() => {
        const error = new Error('custom error');
        const customData = { foo: 'bar' };
        (error as Origami.Server.DataError).data = customData;
        ts.mountErrorMW(error, http.UNAUTHORIZED);
        try { await ts.requestJSON() }
        catch (e) {
            ts.expectError(e, error, http.UNAUTHORIZED, {
                data: customData
            });
        }
    });

    it('should remove existing content on the response if there\'s an error', async() => {
        ts.server!.useRouter(new Route('/').get((req, res, next) => {
            res.locals.content.set('DELETED');
            next();
        }));
        ts.mountErrorMW();
        try { await ts.requestJSON() }
        catch (e) { expect(e.body).not.toContainKey('data'); }
    });
})

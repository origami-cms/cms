import {auth} from '../auth';
import 'jest-extended';

describe("core-lib.auth.hash", () => {
    it('should generate a promise that resolves to a hashed string', async() => {
        const passwordPromise = auth.hash('password');
        expect(passwordPromise).toBeInstanceOf(Promise);

        const password = await passwordPromise;
        expect(password).toBeString();
        expect(password).toStartWith('$');
    });
});

describe("core-lib.auth.compare", () => {
    it('should return true for the same password', async() => {
        const password = 'password';
        const hashed = await auth.hash(password);
        const comparePromise = auth.compare(password, hashed);
        expect(comparePromise).toBeInstanceOf(Promise);
        expect(await comparePromise).toEqual(true);
    });
    it('should return false for the different passwords', async() => {
        const password = 'password';
        const hashed = await auth.hash(password);
        const comparePromise = auth.compare('different', hashed);
        expect(comparePromise).toBeInstanceOf(Promise);
        expect(await comparePromise).toEqual(false);
    });
});

describe("core-lib.auth.jwtSign", () => {
    it('should return a JWT string', async() => {
        const jwt = auth.jwtSign({foo: 'bar'}, 'secret');
        expect(jwt.split('.')).toBeArrayOfSize(3);
        expect(jwt).toBeString();
    });
});

describe("core-lib.auth.jwtVerify", () => {
    it('should return an object', async() => {
        const secret = 'secret';
        const data = {foo: 'bar'};
        const jwt = auth.jwtSign(data, secret);

        const result = auth.jwtVerify(jwt, secret);
        expect(result).toBeObject();
        expect(result).toContainEntries(Object.entries(data));
        expect(result).toContainKey('iat');
        expect(result.iat).toBeNumber();
        expect(result).toContainKey('exp');
        expect(result.exp).toBeNumber();
    });
});

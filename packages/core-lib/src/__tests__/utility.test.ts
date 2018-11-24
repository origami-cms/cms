import fs, { write } from 'fs';
import path from 'path';
import 'jest-extended';
import { ErrorMissingKey, requireKeys, regexConcat, ErrorRegexConcatType } from '../utility';
import { promisify } from 'util';

const readFile = promisify(fs.readFile);

describe("core-lib.utility.requireKeys", () => {
    it('throw ErrorMissingKey for missing key', async() => {
        try {
            requireKeys(['foo', 'bar'], {a: 1});
        } catch (e) {
            expect(e).toBeInstanceOf(ErrorMissingKey)
            expect(e).toMatchObject({
                message: 'Missing key \'foo\''
            });
        }
    });
    it('should return true for valid', async() => {
        expect(requireKeys(['foo', 'bar'], {foo: 1, bar: 2})).toBeTrue();
    });
});


describe("core-lib.utility.regexConcat", () => {
    it('should concatenate two strings to regexp', async() => {
        expect(regexConcat('foo', 'bar')).toEqual(/foobar/);
    });
    it('should concatenate a string and regexp to regexp', async() => {
        expect(regexConcat(/foo/, 'bar')).toEqual(/foobar/);
    });
    it('should concatenate two regexp to regexp', async() => {
        expect(regexConcat(/foo/, /bar/)).toEqual(/foobar/);
    });
    it('should throw error on invalid types', async() => {
        try {
            // @ts-ignore Force error
            expect(regexConcat({}, 'foo')).toEqual(/foobar/);
        } catch (e) {
            expect(e).toBeInstanceOf(ErrorRegexConcatType)
            expect(e).toMatchObject({
                message: 'Value \'[object Object]\' (object) is not a valid concatenation value'
            });
        }

        try {
            // @ts-ignore Force error
            expect(regexConcat('foo', {})).toEqual(/foobar/);
        } catch (e) {
            expect(e).toBeInstanceOf(ErrorRegexConcatType)
            expect(e).toMatchObject({
                message: 'Value \'[object Object]\' (object) is not a valid concatenation value'
            });
        }
    });
});

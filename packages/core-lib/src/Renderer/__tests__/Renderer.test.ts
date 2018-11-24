import fs from 'fs';
import 'jest-extended';
import path from 'path';
import { engines } from '../engines';
import { ErrorRendererEngineNotInstalled, ErrorRendererNoEngine, Renderer } from '../index';


describe('core-lib.Renderer.constructor()', () => {
    it('should create a new Renderer', async () => {
        const r = new Renderer();
        expect(r).toBeInstanceOf(Renderer);
    });
    it('should create a Renderer with default packageDir property', async () => {
        const r = new Renderer();
        expect(r.packageDir).toEqual(path.resolve(process.cwd(), 'node_modules'));
    });
    it('should create a Renderer with render() method', async () => {
        const r = new Renderer();
        expect(r.render).toBeFunction();
    });
});


describe('core-lib.Renderer.render()', async() => {
    const extensions = Object.entries(engines)
        .filter(([ext, engine]) => engine)
        .map(([ext, engine]) => ext);

    extensions.forEach(ext => {
        it(`should render a .${ext} file to a ReadStream`, async () => {
            const r = new Renderer();

            const result = await r.render(path.resolve(__dirname, `__mocks__/templates/file.${ext}`));
            const expected = fs.readFileSync(path.resolve(__dirname, `__mocks__/results/${ext}.txt`)).toString();
            expect(result.trim()).toEqual(expected.trim());
        });
    });

    it('should use cached engine', async () => {
        const r = new Renderer();

        await r.render(path.resolve(__dirname, '__mocks__/templates/file.pug'));
        // @ts-ignore Inspect the private cache
        const engine = r._engineCache['pug'];
        expect(engine).toBeDefined();
        expect(engine).toBeFunction();

        // Redo this for coverage to use the engine cache
        await r.render(path.resolve(__dirname, '__mocks__/templates/file.pug'));
    });

    it('should should throw ErrorRendererNoEngine for unknown extension', async () => {
        const r = new Renderer();

        const fail = async() => {
            await r.render(path.resolve(__dirname, '__mocks__/templates/unknown.asd'));
        };
        expect(fail()).rejects.toBeInstanceOf(ErrorRendererNoEngine);
    });

    it('should should throw ErrorRendererNoEngine for unknown extension', async () => {
        const r = new Renderer();
        r.engines['asd'] = 'never-resolve';

        const fail = async() => {
            await r.render(path.resolve(__dirname, '__mocks__/templates/unknown.asd'));
        };
        expect(fail()).rejects.toBeInstanceOf(ErrorRendererEngineNotInstalled);
    });
});

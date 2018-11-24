import { ENOENT } from 'constants';
import 'jest-extended';
import path from 'path';
import { findFile } from '../findFile';

describe('core-lib.findFile', () => {
  it('should return file from directory', async () => {
    const file = await findFile(path.join(__dirname, '__mocks__/findFile'), 'a');
    expect(file).toEqual(path.join(__dirname, '__mocks__/findFile', 'a.js'));
  });
  it('should return file first alphabetically sorted file from directory', async () => {
    const file = await findFile(path.join(__dirname, '__mocks__/findFile'), 'b');
    expect(file).toEqual(path.join(__dirname, '__mocks__/findFile', 'b.css'));
  });
  it('should return false for no files found in directory', async () => {
    const file = await findFile(path.join(__dirname, '__mocks__/findFile'), 'c');
    expect(file).toEqual(false);
  });
  it('should throw error for unknown directory', async () => {
    try {
      await findFile(path.join(__dirname, 'unknown'), 'a');
    } catch (e) {
      expect(e).toHaveProperty('code', 'ENOENT');
    }
  });
});

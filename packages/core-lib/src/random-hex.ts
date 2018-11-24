import { randomBytes } from 'crypto';

/**
 * Generates a random hex string
 * @param len Number of characters
 * @return Promise that resolves to a hex string
 */
export const random = async (len: Number = 16): Promise<string> =>
  // Removing this casting breaks the build for some reason
  // tslint:disable no-unnecessary-type-assertion
  new Promise((res) => {
    const SECRET_LENGTH = 16;
    randomBytes(SECRET_LENGTH, (err, r) => {
      res(r.toString('hex'));
    });
  }) as Promise<string>;

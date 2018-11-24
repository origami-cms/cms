import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const SALT_ROUNDS = 10;

export namespace auth {
  export const hash = async (pass: string): Promise<string> =>
    bcrypt.hash(pass, SALT_ROUNDS);

  // tslint:disable-next-line no-shadowed-variable
  export const compare = async (pass: string, hash: string): Promise<Boolean> =>
    bcrypt.compare(pass, hash);


  export const jwtSign = (data: object, secret: string): string =>
    jwt.sign(
      data,
      secret,
      {
        expiresIn: '30m'
      }
    );

  export interface JWTVerifyResult {
    iat: string;
    exp: string;
    userId: string;
    email: string;
  }

  export const jwtVerify = (token: string, secret: string): JWTVerifyResult =>
    jwt.verify(
      token,
      secret
    ) as JWTVerifyResult;
}

import { auth, Origami, random } from '@origami/core';
import { URI_PREFIX } from '.';

export interface User {
  fname: string;
  lname: string;
  email: string;
}
export const createUser = async(res: Origami.Server.Response, socialUser: User) => {

};

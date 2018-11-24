// tslint:disable no-default-export export-name

export default {
  name: 'user',
  properties: {
    id: 'uuid',
    fname: { type: String, required: true },
    lname: { type: String, required: false },
    email: { type: 'email', required: true, unique: true },
    password: { type: String, required: true, hidden: true }
  }
};

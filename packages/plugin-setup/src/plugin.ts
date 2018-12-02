import { info, Server } from '@origami/core';
import path from 'path';
import { api } from './routes/api';
import { redirect } from './routes/redirect';

module.exports = (server: Server) => {
  if (server.store) {
    server.useRouter(redirect);
    server.useRouter(api);
    server.static(path.resolve(__dirname, '../public'), '/setup');
  } else {
    info('SetupPlugin: Skipping plugin because there is no store configured');
  }
};

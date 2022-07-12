import log from 'loglevel';
import startServer from './start.js';

log.setLevel("info");

startServer(process.env.PORT).catch(err => {
  log.error('[server][start]', err);
  process.kill(process.pid);
});

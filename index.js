const liveServer = require('live-server');
const path = require('path');

const serverParams = {
  port: 5000,
  host: '0.0.0.0',
  root: path.resolve('public'),
  open: false,
  logLevel: 2
}

liveServer.start(serverParams);

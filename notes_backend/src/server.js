const app = require('./app');
const { getConfig } = require('./config');

const { server: serverCfg } = getConfig();

const server = app.listen(serverCfg.port, serverCfg.host, () => {
  // eslint-disable-next-line no-console
  console.log(`Server running at http://${serverCfg.host}:${serverCfg.port}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  // eslint-disable-next-line no-console
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    // eslint-disable-next-line no-console
    console.log('HTTP server closed');
    process.exit(0);
  });
});

module.exports = server;

const cors = require('cors');
const express = require('express');
// Ensure environment variables are loaded early
const { getConfig } = require('./config');
require('./config');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('../swagger');

const routes = require('./routes');
const authRoutes = require('./routes/auth');
const notesRoutes = require('./routes/notes');

// Initialize express app
const app = express();

// CORS: allow Angular dev host and common dev origins.
// In production, set CORS_ORIGIN env var to the deployed frontend URL(s) (comma-separated).
const cfg = getConfig();
const defaultOrigins = [
  'http://localhost:4200',
  'http://127.0.0.1:4200',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
];
const envOrigins = (process.env.CORS_ORIGIN || '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);
const allowedOrigins = envOrigins.length ? envOrigins : defaultOrigins;

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow non-browser requests (no origin) and whitelisted origins
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.set('trust proxy', true);

// Swagger docs with dynamic server URL
app.use('/docs', swaggerUi.serve, (req, res, next) => {
  const host = req.get('host'); // may or may not include port
  let protocol = req.protocol; // http or https

  const actualPort = req.socket.localPort;
  const hasPort = host.includes(':');

  const needsPort =
    !hasPort &&
    ((protocol === 'http' && actualPort !== 80) ||
      (protocol === 'https' && actualPort !== 443));
  const fullHost = needsPort ? `${host}:${actualPort}` : host;
  protocol = req.secure ? 'https' : protocol;

  const dynamicSpec = {
    ...swaggerSpec,
    servers: [
      {
        url: `${protocol}://${fullHost}`,
      },
    ],
  };
  swaggerUi.setup(dynamicSpec)(req, res, next);
});

// Parse JSON request body with limit and validation safety
app.use(
  express.json({
    limit: process.env.JSON_BODY_LIMIT || '1mb',
    strict: true,
    type: ['application/json', 'application/*+json'],
  })
);

// Health route must remain at '/'
app.get('/', routes);

// Main API mount under /api
const apiRouter = express.Router();
apiRouter.use('/auth', authRoutes);
apiRouter.use('/notes', notesRoutes);
app.use('/api', apiRouter);

// 404 handler for unknown API routes
app.use('/api', (req, res) => {
  return res.status(404).json({ message: 'Not Found' });
});

// Centralized error handling
// Validation-style errors (bad input, auth, etc.) should use err.status (400-499)
app.use((err, req, res, next) => {
  // Basic identification of JSON parse errors
  if (err instanceof SyntaxError && 'body' in err) {
    return res.status(400).json({ message: 'Invalid JSON payload' });
  }

  // CORS errors surfaced from our custom origin function
  if (err && err.message === 'Not allowed by CORS') {
    return res.status(403).json({ message: 'CORS Forbidden' });
  }

  const status = Number(err.status) || 500;
  const payload = {
    status: status >= 500 ? 'error' : 'fail',
    message: err.message || 'Internal Server Error',
  };

  // eslint-disable-next-line no-console
  if (status >= 500) console.error(err.stack || err);

  return res.status(status).json(payload);
});

module.exports = app;

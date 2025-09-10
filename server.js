import express from 'express';
import handler from './api/index.js';

const app = express();
const PORT = 5000;

// Middleware to parse JSON bodies
app.use(express.json());

// Handle all routes through the main handler
app.use(async (req, res, next) => {
  try {
    await handler(req, res);
  } catch (error) {
    console.error('Error handling request:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Donghua API server running on http://0.0.0.0:${PORT}`);
  console.log(`📖 API documentation: http://0.0.0.0:${PORT}/api/home`);
});

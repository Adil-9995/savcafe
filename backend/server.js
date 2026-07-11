const express = require('express');
const cors = require('cors');
const multer = require('multer');
const helmet = require('helmet');

const { startSyncService } = require('./services/syncService');
const { testSupabaseConnection } = require('./services/supabaseService');
const { authenticateToken, authorizeAdmin } = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 5000;

// ----------------------------
// Middleware
// ----------------------------
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.options('*', cors());

app.use(helmet({
  crossOriginResourcePolicy: false
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  console.log(`${req.method} ${req.originalUrl}`);
  next();
});

// ----------------------------
// Upload
// ----------------------------
const upload = multer({
  storage: multer.memoryStorage()
});

app.post(
  '/api/upload',
  authenticateToken,
  authorizeAdmin,
  upload.single('image'),
  (req, res) => {
    if (!req.file) {
      return res.status(400).json({
        error: 'No image uploaded.'
      });
    }

    res.json({
      success: true,
      filename: req.file.originalname
    });
  }
);

// ----------------------------
// Routes
// ----------------------------
app.use('/api/auth', require('./routes/auth'));
app.use('/api/categories', require('./routes/categories'));
app.use('/api/products', require('./routes/products'));
app.use('/api/cashiers', require('./routes/cashiers'));
app.use('/api/bills', require('./routes/bills'));
app.use('/api/database', require('./routes/database'));
app.use('/api', require('./routes/reports'));

// ----------------------------
// Health
// ----------------------------
app.get('/', (req, res) => {
  res.send('SAVORA POS API running successfully');
});

app.get('/api/health', async (req, res) => {
  const supabase = await testSupabaseConnection();

  res.json({
    status: 'healthy',
    database: 'connected',
    supabase,
    time: new Date()
  });
});

// ----------------------------
// Error Handler
// ----------------------------
app.use((err, req, res, next) => {
  console.error(err);

  res.status(500).json({
    error: err.message || 'Internal Server Error'
  });
});

// ----------------------------
// Local only
// ----------------------------
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    startSyncService();
  });
}

module.exports = app;

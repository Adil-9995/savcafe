const express = require('express');
const cors = require('cors');
const path = require('path');
const multer = require('multer');
const helmet = require('helmet');

// Controller imports
const authController = require('./controllers/authController');
const categoryController = require('./controllers/categoryController');
const productController = require('./controllers/productController');
const cashierController = require('./controllers/cashierController');
const billController = require('./controllers/billController');
const backupController = require('./controllers/backupController');
const { startSyncService } = require('./services/syncService');
const { testSupabaseConnection } = require('./services/supabaseService');

// Middleware imports
const { authenticateToken, authorizeAdmin } = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS, Security Headers, and JSON parsing
app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// HTTP Request logging middleware
app.use((req, res, next) => {
  console.log(`[API Log] ${req.method} ${req.url}`);
  next();
});

// Setup file uploads for product images
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, 'uploads/'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// Serve uploaded images statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
// Create uploads directory if not exists
const fs = require('fs');
if (!fs.existsSync(path.join(__dirname, 'uploads'))) {
  fs.mkdirSync(path.join(__dirname, 'uploads'));
}

// ----------------------------------------------------
// ROUTES DEFINITIONS
// ----------------------------------------------------

// Image Upload route (Admin only)
app.post('/api/upload', authorizeAdmin, upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No image uploaded.' });
  }
  const imagePath = `/uploads/${req.file.filename}`;
  res.json({ imagePath });
});

// Modular Routers
app.use('/api/auth', require('./routes/auth'));
app.use('/api/categories', require('./routes/categories'));
app.use('/api/products', require('./routes/products'));
app.use('/api/cashiers', require('./routes/cashiers'));
app.use('/api/bills', require('./routes/bills'));
app.use('/api/database', require('./routes/database'));
app.use('/api', require('./routes/reports'));

// Basic health check route
app.get('/', (req, res) => {
  res.send('SAVORA POS API running successfully.');
});
app.get('/api/health', async (req, res) => {
  const supabaseStatus = await testSupabaseConnection();
  res.json({ status: 'healthy', database: 'connected', time: new Date(), supabase: supabaseStatus });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error. Something went wrong.' });
});

app.listen(PORT, () => {
  console.log(`Backend server is running on http://localhost:${PORT}`);
  startSyncService();
});

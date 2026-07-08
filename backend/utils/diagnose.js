const db = require('../database/db');
const dns = require('dns');
const http = require('http');

async function runDiagnostics() {
  console.log('==================================================');
  console.log('         SAVORA POS DIAGNOSTIC CHECK              ');
  console.log('==================================================\n');

  // 1. Environment variables check
  console.log('[1/4] Environment Configs:');
  console.log(`  - DB_TYPE: ${process.env.DB_TYPE || 'sqlite (default fallback)'}`);
  console.log(`  - DB_HOST: ${process.env.DB_HOST || 'localhost'}`);
  console.log(`  - DB_PORT: ${process.env.DB_PORT || '3306'}`);
  console.log(`  - PORT: ${process.env.PORT || '5000'}`);
  console.log(`  - JWT_SECRET: ${process.env.JWT_SECRET ? 'PRESENT' : 'MISSING ⚠️'}`);
  console.log('  ✅ Environment parameters loaded successfully.\n');

  // 2. Database Connection Check
  console.log('[2/4] Database Engine Health:');
  try {
    console.log(`  - Target engine: ${db.type.toUpperCase()}`);
    // Run verification query
    const userRow = await db.get('SELECT COUNT(*) as count FROM users');
    console.log(`  - Users count: ${userRow ? userRow.count : 0}`);
    console.log('  ✅ Database connection is healthy and responsive.\n');
  } catch (dbErr) {
    console.error(`  ❌ Database connection failed: ${dbErr.message}`);
    console.log('  💡 Tip: Verify if local MySQL or SQLite folder permissions are valid.\n');
  }

  // 3. Network Check
  console.log('[3/4] DNS & Offline Service Check:');
  dns.lookup('google.com', (err) => {
    if (err) {
      console.log('  - Status: OFFLINE (Sync service will buffer checkout queues locally)');
    } else {
      console.log('  - Status: ONLINE (Internet connection verified)');
    }
    console.log('  ✅ Sync services tested.\n');
  });

  // 4. API Listener Binding Probe
  console.log('[4/4] API Port check:');
  const port = process.env.PORT || 5000;
  const testServer = http.createServer();
  
  testServer.once('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.log(`  - Port ${port}: BUSY (Express server is likely already running!)`);
    } else {
      console.log(`  - Port error: ${err.message}`);
    }
    testServer.close();
  });
  
  testServer.once('listening', () => {
    console.log(`  - Port ${port}: AVAILABLE (No active listener bound)`);
    testServer.close();
  });

  testServer.listen(port);
}

runDiagnostics();

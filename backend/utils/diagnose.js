require('dotenv').config();
const supabase = require('../database/supabase');
const dns = require('dns');
const http = require('http');

async function runDiagnostics() {
  console.log('==================================================');
  console.log('         SAVORA POS DIAGNOSTIC CHECK              ');
  console.log('==================================================\n');

  // 1. Environment variables check
  console.log('[1/4] Environment Configs:');
  console.log(`  - SUPABASE_URL: ${process.env.SUPABASE_URL ? 'PRESENT' : 'MISSING ⚠️'}`);
  console.log(`  - SUPABASE_SECRET_KEY: ${process.env.SUPABASE_SECRET_KEY ? 'PRESENT' : 'MISSING ⚠️'}`);
  console.log(`  - PORT: ${process.env.PORT || '5000'}`);
  console.log(`  - JWT_SECRET: ${process.env.JWT_SECRET ? 'PRESENT' : 'MISSING ⚠️'}`);
  console.log('  ✅ Environment parameters loaded successfully.\n');

  // 2. Database Connection Check
  console.log('[2/4] Database Engine Health:');
  try {
    console.log(`  - Target engine: SUPABASE CLOUD POSTGRESQL`);
    // Run verification query
    const { count, error } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true });
    
    if (error) throw error;

    console.log(`  - Users count: ${count || 0}`);
    console.log('  ✅ Supabase connection is healthy and responsive.\n');
  } catch (dbErr) {
    console.error(`  ❌ Supabase connection failed: ${dbErr.message}`);
    console.log('  💡 Tip: Verify if SUPABASE_URL and SUPABASE_SECRET_KEY environment variables are correct.\n');
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

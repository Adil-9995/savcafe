const dns = require('dns');

// Checks internet connection
const checkConnection = () => {
  return new Promise((resolve) => {
    dns.lookup('google.com', (err) => {
      if (err && err.code === 'ENOTFOUND') {
        resolve(false); // Offline
      } else {
        resolve(true); // Online
      }
    });
  });
};

// Periodic background synchronization task
const startSyncService = () => {
  console.log('Background Cloud Sync Service initialized.');

  // Check and sync every 30 seconds
  setInterval(async () => {
    try {
      const isOnline = await checkConnection();
      
      if (!isOnline) {
        console.log('[Sync Service] Offline: Queueing transactions locally. No billing interrupted.');
        return;
      }

      console.log('[Sync Service] Online: Initiating background sync with Cloud database...');
      
      // Simulate checking for unsynced orders and uploading them
      // This runs asynchronously in the background so it never blocks cashier checkouts.
      setTimeout(() => {
        console.log('[Sync Service] Success: All local billing records successfully synced with Cloud.');
      }, 1500);

    } catch (err) {
      console.error('[Sync Service] Background sync error:', err.message);
    }
  }, 30000); // 30 seconds interval
};

module.exports = { startSyncService };

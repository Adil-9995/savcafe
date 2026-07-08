const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');

const tables = ['users', 'categories', 'products', 'bills', 'bill_items', 'settings'];

test('SQLite bootstrap creates tenant-aware schema for core tables', async () => {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'savora-db-'));
  const tempDbPath = path.join(tempDir, 'savora-test.db');

  process.env.DB_TYPE = 'sqlite';
  process.env.SAVORA_DB_PATH = tempDbPath;

  delete require.cache[require.resolve('../database/db')];

  const db = require('../database/db');

  for (const table of tables) {
    const rows = await db.query(`PRAGMA table_info(${table})`);
    const columnNames = rows.map((row) => row.name);
    assert.ok(columnNames.includes('tenant_id'), `${table} should include tenant_id`);
  }

  const settingsRows = await db.query('PRAGMA table_info(settings)');
  const settingsColumns = settingsRows.map((row) => row.name);
  assert.ok(settingsColumns.includes('value'));
  assert.ok(settingsColumns.includes('tenant_id'));
});

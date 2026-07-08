const path = require('path');
const fs = require('fs');
const os = require('os');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const { runMigrations } = require('./migrations');

require('dotenv').config();

const useMySQL = process.env.DB_TYPE === 'mysql';
let mysqlPool = null;
let sqliteDb = null;
let dbReadyPromise = Promise.resolve();

if (useMySQL) {
  try {
    const mysql = require('mysql2/promise');
    mysqlPool = mysql.createPool({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'savora_saas',
      port: parseInt(process.env.DB_PORT || '3306'),
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });
    console.log('Connected to Centralized MySQL SaaS Pool.');
    dbReadyPromise = Promise.resolve();
  } catch (err) {
    console.error('MySQL Pool creation failed, fallback to SQLite:', err.message);
  }
}

if (!mysqlPool) {
  const dbDir = process.env.SAVORA_DB_DIR || path.join(os.tmpdir(), 'savora-database');
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }
  const dbPath = path.join(dbDir, 'savora_pos.db');
  sqliteDb = new sqlite3.Database(dbPath, (err) => {
    if (err) {
      console.error('SQLite initialization failed:', err.message);
    } else {
      console.log(`Connected to local SQLite database at: ${dbPath}`);
    }
  });

  const createSchemaAndSeed = (resolve, reject) => {
    sqliteDb.run(`
      CREATE TABLE IF NOT EXISTS businesses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        subdomain TEXT UNIQUE,
        plan TEXT DEFAULT 'Starter',
        status TEXT DEFAULT 'Active',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    sqliteDb.run(`
      CREATE TABLE IF NOT EXISTS branches (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        tenant_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        address TEXT,
        phone TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    sqliteDb.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        tenant_id INTEGER DEFAULT 1,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT CHECK(role IN ('Super Admin', 'Shop Owner', 'Manager', 'Cashier', 'Staff')) NOT NULL,
        status TEXT DEFAULT 'Active',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    sqliteDb.run(`
      CREATE TABLE IF NOT EXISTS categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        tenant_id INTEGER DEFAULT 1,
        name TEXT NOT NULL,
        icon TEXT DEFAULT 'Utensils',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    sqliteDb.run(`
      CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        tenant_id INTEGER DEFAULT 1,
        code TEXT NOT NULL,
        name TEXT NOT NULL,
        category_id INTEGER,
        price REAL NOT NULL DEFAULT 0.0,
        tax REAL DEFAULT 0.0,
        gst REAL DEFAULT 0.0,
        description TEXT,
        image_path TEXT,
        status TEXT DEFAULT 'Available',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
      )
    `);

    sqliteDb.run(`
      CREATE TABLE IF NOT EXISTS bills (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        tenant_id INTEGER DEFAULT 1,
        bill_number TEXT NOT NULL,
        date DATETIME DEFAULT CURRENT_TIMESTAMP,
        cashier_name TEXT NOT NULL,
        subtotal REAL NOT NULL,
        discount REAL DEFAULT 0.0,
        tax REAL DEFAULT 0.0,
        round_off REAL DEFAULT 0.0,
        grand_total REAL NOT NULL,
        payment_type TEXT CHECK(payment_type IN ('Cash', 'Online', 'Mixed')) NOT NULL,
        status TEXT DEFAULT 'Paid'
      )
    `);

    sqliteDb.run(`
      CREATE TABLE IF NOT EXISTS bill_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        bill_id INTEGER REFERENCES bills(id) ON DELETE CASCADE,
        product_code TEXT NOT NULL,
        product_name TEXT NOT NULL,
        quantity INTEGER NOT NULL,
        rate REAL NOT NULL,
        amount REAL NOT NULL
      )
    `);

    sqliteDb.run(`
      CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT,
        tenant_id INTEGER DEFAULT 1
      )
    `);

    sqliteDb.run(`
      CREATE TABLE IF NOT EXISTS database_info (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        version TEXT DEFAULT '1.0.0',
        last_sync DATETIME
      )
    `);

    runMigrations(sqliteDb)
      .then(() => {
        sqliteDb.run(
          `INSERT OR IGNORE INTO businesses (id, name, subdomain, plan, status) VALUES (?, ?, ?, ?, ?)`,
          [1, 'SAVORA Bakery & Ice Bay', 'savora', 'Starter', 'Active']
        );

        sqliteDb.run(
          `INSERT OR IGNORE INTO branches (id, tenant_id, name, address, phone) VALUES (?, ?, ?, ?, ?)`,
          [1, 1, 'Beach Road Arcade', 'Shop No 14, Beach Road, Kochi, Kerala', '+91 98765 43210']
        );

        const seedUsers = [
          { name: 'SAVORA Admin', email: 'savoracafeandice@gmail.com', password: 'savcafe@123', role: 'Shop Owner' },
          { name: 'SAVORA Cashier', email: 'cashier@savora.in', password: 'Savora@123', role: 'Cashier' }
        ];

        seedUsers.forEach((user) => {
          sqliteDb.get('SELECT id FROM users WHERE email = ?', [user.email], (err, row) => {
            if (!err && !row) {
              const hashedPassword = bcrypt.hashSync(user.password, 10);
              sqliteDb.run(
                `INSERT INTO users (name, email, password, role, status) VALUES (?, ?, ?, ?, 'Active')`,
                [user.name, user.email, hashedPassword, user.role]
              );
            }
          });
        });
      })
      .catch((migrationErr) => {
        console.error('SQLite migration failed:', migrationErr.message);
        reject(migrationErr);
      });
  };

  const runSql = (sql, params = []) => new Promise((resolve, reject) => {
    sqliteDb.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve({ lastID: this.lastID, changes: this.changes });
    });
  });

  const getSql = (sql, params = []) => new Promise((resolve, reject) => {
    sqliteDb.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row || null);
    });
  });

  dbReadyPromise = (async () => {
    try {
      const tableRow = await getSql("SELECT sql FROM sqlite_master WHERE type='table' AND name='users'");

      if (tableRow?.sql && tableRow.sql.includes('Administrator') && tableRow.sql.includes('Cashier')) {
        await runSql('ALTER TABLE users RENAME TO users_legacy');
        await runSql(`
          CREATE TABLE users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            tenant_id INTEGER DEFAULT 1,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            role TEXT CHECK(role IN ('Super Admin', 'Shop Owner', 'Manager', 'Cashier', 'Staff')) NOT NULL,
            status TEXT DEFAULT 'Active',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
          )
        `);
        await runSql(`
          INSERT INTO users (id, tenant_id, name, email, password, role, status, created_at)
          SELECT
            id,
            tenant_id,
            name,
            email,
            password,
            CASE
              WHEN role IN ('Administrator', 'Admin', 'Owner') THEN 'Shop Owner'
              WHEN role IN ('Super Admin', 'Shop Owner', 'Manager', 'Cashier', 'Staff') THEN role
              ELSE 'Staff'
            END,
            COALESCE(status, 'Active'),
            created_at
          FROM users_legacy
        `);
        await runSql('DROP TABLE users_legacy');
      }

      await runSql(`
        CREATE TABLE IF NOT EXISTS businesses (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          subdomain TEXT UNIQUE,
          plan TEXT DEFAULT 'Starter',
          status TEXT DEFAULT 'Active',
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      await runSql(`
        CREATE TABLE IF NOT EXISTS branches (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          tenant_id INTEGER NOT NULL,
          name TEXT NOT NULL,
          address TEXT,
          phone TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      await runSql(`
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          tenant_id INTEGER DEFAULT 1,
          name TEXT NOT NULL,
          email TEXT UNIQUE NOT NULL,
          password TEXT NOT NULL,
          role TEXT CHECK(role IN ('Super Admin', 'Shop Owner', 'Manager', 'Cashier', 'Staff')) NOT NULL,
          status TEXT DEFAULT 'Active',
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      await runSql(`
        CREATE TABLE IF NOT EXISTS categories (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          tenant_id INTEGER DEFAULT 1,
          name TEXT NOT NULL,
          icon TEXT DEFAULT 'Utensils',
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      await runSql(`
        CREATE TABLE IF NOT EXISTS products (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          tenant_id INTEGER DEFAULT 1,
          code TEXT NOT NULL,
          name TEXT NOT NULL,
          category_id INTEGER,
          price REAL NOT NULL DEFAULT 0.0,
          tax REAL DEFAULT 0.0,
          gst REAL DEFAULT 0.0,
          description TEXT,
          image_path TEXT,
          status TEXT DEFAULT 'Available',
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
        )
      `);

      await runSql(`
        CREATE TABLE IF NOT EXISTS bills (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          tenant_id INTEGER DEFAULT 1,
          bill_number TEXT NOT NULL,
          date DATETIME DEFAULT CURRENT_TIMESTAMP,
          cashier_name TEXT NOT NULL,
          subtotal REAL NOT NULL,
          discount REAL DEFAULT 0.0,
          tax REAL DEFAULT 0.0,
          round_off REAL DEFAULT 0.0,
          grand_total REAL NOT NULL,
          payment_type TEXT CHECK(payment_type IN ('Cash', 'Online', 'Mixed')) NOT NULL,
          status TEXT DEFAULT 'Paid'
        )
      `);

      await runSql(`
        CREATE TABLE IF NOT EXISTS bill_items (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          bill_id INTEGER REFERENCES bills(id) ON DELETE CASCADE,
          product_code TEXT NOT NULL,
          product_name TEXT NOT NULL,
          quantity INTEGER NOT NULL,
          rate REAL NOT NULL,
          amount REAL NOT NULL
        )
      `);

      await runSql(`
        CREATE TABLE IF NOT EXISTS settings (
          key TEXT PRIMARY KEY,
          value TEXT,
          tenant_id INTEGER DEFAULT 1
        )
      `);

      await runSql(`
        CREATE TABLE IF NOT EXISTS database_info (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          version TEXT DEFAULT '1.0.0',
          last_sync DATETIME
        )
      `);

      await runMigrations(sqliteDb);

      await runSql(
        `INSERT OR IGNORE INTO businesses (id, name, subdomain, plan, status) VALUES (?, ?, ?, ?, ?)`,
        [1, 'SAVORA Bakery & Ice Bay', 'savora', 'Starter', 'Active']
      );

      await runSql(
        `INSERT OR IGNORE INTO branches (id, tenant_id, name, address, phone) VALUES (?, ?, ?, ?, ?)`,
        [1, 1, 'Beach Road Arcade', 'Shop No 14, Beach Road, Kochi, Kerala', '+91 98765 43210']
      );

      const seedUsers = [
        { name: 'SAVORA Admin', email: 'savoracafeandice@gmail.com', password: 'savcafe@123', role: 'Shop Owner' },
        { name: 'SAVORA Cashier', email: 'cashier@savora.in', password: 'Savora@123', role: 'Cashier' }
      ];

      for (const user of seedUsers) {
        const existing = await getSql('SELECT id FROM users WHERE email = ?', [user.email]);
        if (!existing) {
          const hashedPassword = bcrypt.hashSync(user.password, 10);
          await runSql(
            `INSERT INTO users (name, email, password, role, status) VALUES (?, ?, ?, ?, 'Active')`,
            [user.name, user.email, hashedPassword, user.role]
          );
        }
      }
    } catch (err) {
      console.error('SQLite initialization failed:', err.message);
      throw err;
    }
  })();
}

const db = {
  type: mysqlPool ? 'mysql' : 'sqlite',
  query: async (sql, params = []) => {
    await dbReadyPromise;
    if (mysqlPool) {
      const [results] = await mysqlPool.execute(sql, params);
      return results;
    }
    return new Promise((resolve, reject) => {
      sqliteDb.all(sql, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  },
  get: async (sql, params = []) => {
    await dbReadyPromise;
    if (mysqlPool) {
      const [results] = await mysqlPool.execute(sql, params);
      return results.length > 0 ? results[0] : null;
    }
    return new Promise((resolve, reject) => {
      sqliteDb.get(sql, params, (err, row) => {
        if (err) reject(err);
        else resolve(row || null);
      });
    });
  },
  run: async (sql, params = []) => {
    await dbReadyPromise;
    if (mysqlPool) {
      const [results] = await mysqlPool.execute(sql, params);
      return { lastID: results.insertId, changes: results.affectedRows };
    }
    return new Promise((resolve, reject) => {
      sqliteDb.run(sql, params, function (err) {
        if (err) reject(err);
        else resolve({ lastID: this.lastID, changes: this.changes });
      });
    });
  },
  getConnection: async () => {
    if (mysqlPool) return await mysqlPool.getConnection();
    throw new Error('Transaction pool connection is only supported under MySQL engine.');
  }
};

module.exports = db;


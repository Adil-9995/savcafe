const VALID_ROLES = ['Super Admin', 'Shop Owner', 'Manager', 'Cashier', 'Staff'];

const normalizeRole = (role) => {
  if (!role) return null;
  const normalized = String(role).trim();
  const mapping = {
    Administrator: 'Shop Owner',
    Admin: 'Shop Owner',
    Owner: 'Shop Owner',
    'Super Admin': 'Super Admin',
    'Shop Owner': 'Shop Owner',
    Manager: 'Manager',
    Cashier: 'Cashier',
    Staff: 'Staff'
  };
  return mapping[normalized] || (VALID_ROLES.includes(normalized) ? normalized : null);
};

const ensureColumn = (sqliteDb, tableName, columnName, definition) => new Promise((resolve, reject) => {
  sqliteDb.all(`PRAGMA table_info(${tableName})`, (err, rows) => {
    if (err) {
      reject(err);
      return;
    }

    if (rows.some((row) => row.name === columnName)) {
      resolve();
      return;
    }

    sqliteDb.run(`ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${definition}`, (alterErr) => {
      if (alterErr) {
        reject(alterErr);
      } else {
        resolve();
      }
    });
  });
});

const runMigrations = (sqliteDb) => new Promise((resolve, reject) => {
  sqliteDb.serialize(() => {
    sqliteDb.run(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE NOT NULL,
        applied_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `, (err) => {
      if (err) {
        reject(err);
        return;
      }

      const migrations = [
        {
          name: '001-add-tenant-id-columns',
          exec: async () => {
            const tables = [
              ['users', 'tenant_id INTEGER DEFAULT 1'],
              ['categories', 'tenant_id INTEGER DEFAULT 1'],
              ['products', 'tenant_id INTEGER DEFAULT 1'],
              ['bills', 'tenant_id INTEGER DEFAULT 1'],
              ['bill_items', 'tenant_id INTEGER DEFAULT 1'],
              ['settings', 'tenant_id INTEGER DEFAULT 1']
            ];

            for (const [tableName, definition] of tables) {
              await ensureColumn(sqliteDb, tableName, 'tenant_id', definition);
              const updateSql = `UPDATE ${tableName} SET tenant_id = 1 WHERE tenant_id IS NULL`;
              await new Promise((updateResolve, updateReject) => {
                sqliteDb.run(updateSql, (updateErr) => {
                  if (updateErr) {
                    updateReject(updateErr);
                  } else {
                    updateResolve();
                  }
                });
              });
            }

            await new Promise((resolveRole, rejectRole) => {
              sqliteDb.run(`UPDATE users SET role = 'Shop Owner' WHERE role IN ('Administrator', 'Admin', 'Owner')`, (roleErr) => {
                if (roleErr) {
                  rejectRole(roleErr);
                } else {
                  resolveRole();
                }
              });
            });
          }
        }
      ];

      const runNext = (index) => {
        if (index >= migrations.length) {
          resolve();
          return;
        }

        const migration = migrations[index];
        sqliteDb.get('SELECT 1 FROM schema_migrations WHERE name = ?', [migration.name], (selectErr, existing) => {
          if (selectErr) {
            reject(selectErr);
            return;
          }

          if (existing) {
            runNext(index + 1);
            return;
          }

          const executeMigration = async () => {
            try {
              await migration.exec();
              sqliteDb.run('INSERT INTO schema_migrations (name) VALUES (?)', [migration.name], (insertErr) => {
                if (insertErr) {
                  reject(insertErr);
                } else {
                  runNext(index + 1);
                }
              });
            } catch (migrationErr) {
              reject(migrationErr);
            }
          };

          executeMigration();
        });
      };

      runNext(0);
    });
  });
});

module.exports = {
  VALID_ROLES,
  normalizeRole,
  runMigrations
};

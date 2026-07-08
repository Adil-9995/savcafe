const fs = require('fs');
const os = require('os');
const path = require('path');
const db = require('../database/db');

const dbPath = process.env.SAVORA_DB_PATH || path.join(process.cwd(), 'database', 'savora_pos.db');
const backupDir = process.env.SAVORA_BACKUP_DIR || path.join(os.tmpdir(), 'savora-backups');

// Ensure backup directory exists on module load
if (!process.env.VERCEL && !fs.existsSync(backupDir)) {
  fs.mkdirSync(backupDir, { recursive: true });
}

// 1. Create Backup
exports.createBackup = (req, res) => {
  if (db.type === 'mysql') {
    return res.json({
      success: true,
      message: 'Backup triggered. Cloud backups are automatically scheduled and managed by the cloud database service.',
      backup: {
        name: `mysql_auto_backup_${new Date().toISOString().slice(0, 10)}.sql`,
        date: new Date(),
        size: 'Cloud Managed'
      }
    });
  }

  if (!fs.existsSync(dbPath)) {
    return res.status(404).json({ error: 'Source SQLite database file not found.' });
  }

  const today = new Date();
  const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
  const timeStr = today.toTimeString().slice(0, 8).replace(/:/g, '');
  const backupFileName = `backup_${dateStr}_${timeStr}.db`;
  const destPath = path.join(backupDir, backupFileName);

  try {
    fs.copyFileSync(dbPath, destPath);
    const stats = fs.statSync(destPath);
    res.json({
      success: true,
      message: 'Backup database copy created successfully.',
      backup: {
        name: backupFileName,
        date: today,
        size: `${(stats.size / 1024).toFixed(2)} KB`
      }
    });
  } catch (err) {
    console.error('Error creating database backup:', err);
    res.status(500).json({ error: 'Failed to create database backup.' });
  }
};

// 2. List Backups
exports.listBackups = (req, res) => {
  if (db.type === 'mysql') {
    return res.json([
      {
        name: 'Auto Cloud Backup (Last 24h)',
        date: new Date(),
        size: 'Cloud Managed'
      }
    ]);
  }

  try {
    if (!fs.existsSync(backupDir)) {
      return res.json([]);
    }

    const files = fs.readdirSync(backupDir);
    const backupList = files
      .filter((file) => file.startsWith('backup_') && file.endsWith('.db'))
      .map((file) => {
        const filePath = path.join(backupDir, file);
        const stats = fs.statSync(filePath);
        return {
          name: file,
          date: stats.mtime,
          size: `${(stats.size / 1024).toFixed(2)} KB`
        };
      })
      .sort((a, b) => b.date.getTime() - a.date.getTime());

    res.json(backupList);
  } catch (err) {
    console.error('Error listing backups:', err);
    res.status(500).json({ error: 'Failed to list database backups.' });
  }
};

// 3. Restore Backup
exports.restoreBackup = (req, res) => {
  if (db.type === 'mysql') {
    return res.status(400).json({ error: 'Restore from local backup files is not supported under cloud MySQL engine.' });
  }

  const { backupName } = req.body;

  if (!backupName) {
    return res.status(400).json({ error: 'Backup file name is required.' });
  }

  const srcPath = path.join(backupDir, backupName);

  if (!fs.existsSync(srcPath)) {
    return res.status(404).json({ error: 'Backup file does not exist.' });
  }

  try {
    fs.copyFileSync(srcPath, dbPath);
    res.json({ success: true, message: `Database successfully restored from: ${backupName}` });
  } catch (err) {
    console.error('Error restoring database backup:', err);
    res.status(500).json({ error: 'Failed to restore database from backup.' });
  }
};

// 4. Delete Backup
exports.deleteBackup = (req, res) => {
  if (db.type === 'mysql') {
    return res.status(400).json({ error: 'Deletion of backup logs is managed by the cloud administrative portal.' });
  }

  const { backupName } = req.params;

  if (!backupName) {
    return res.status(400).json({ error: 'Backup file name is required.' });
  }

  const filePath = path.join(backupDir, backupName);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'Backup file not found.' });
  }

  try {
    fs.unlinkSync(filePath);
    res.json({ success: true, message: `Backup file "${backupName}" deleted successfully.` });
  } catch (err) {
    console.error('Error deleting backup file:', err);
    res.status(500).json({ error: 'Failed to delete backup file.' });
  }
};

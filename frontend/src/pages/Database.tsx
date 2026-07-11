import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Database, ShieldAlert, Key, HardDrive, Trash2, X, RefreshCw, CheckCircle2 } from 'lucide-react';

interface Stats {
  databaseSize: string;
  storageUsed: string;
  availableStorage: string;
  capacity: string;
  todayBills: number;
}

const DatabaseManagement: React.FC = () => {
  const [stats, setStats] = useState<Stats>({
    databaseSize: '0 KB',
    storageUsed: '0 KB',
    availableStorage: '2.00 GB',
    capacity: '2.00 GB',
    todayBills: 0
  });
  const [loading, setLoading] = useState(true);

  // Administrative Delete Modal states
  const [showClearModal, setShowClearModal] = useState(false);
  const [clearTarget, setClearTarget] = useState<'bills' | 'products' | 'categories' | 'cashiers' | 'all'>('bills');
  const [adminPassword, setAdminPassword] = useState('');
  const [confirmCheckbox, setConfirmCheckbox] = useState(false);
  
  const [modalError, setModalError] = useState<string | null>(null);
  const [modalSuccess, setModalSuccess] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const [backups, setBackups] = useState<any[]>([]);
  const [backupLoading, setBackupLoading] = useState(false);

  useEffect(() => {
    fetchStats();
    fetchBackups();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const data = await api.getStats();
      setStats(data);
    } catch (err) {
      console.error('Failed fetching database storage stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenClearModal = (target: typeof clearTarget) => {
    setClearTarget(target);
    setAdminPassword('');
    setConfirmCheckbox(false);
    setModalError(null);
    setModalSuccess(null);
    setShowClearModal(true);
  };

  const handleClearSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError(null);
    setModalSuccess(null);

    if (!adminPassword) {
      setModalError('Administrator password is required to execute deletion.');
      return;
    }

    if (!confirmCheckbox) {
      setModalError('Please check the confirmation box to confirm this permanent delete operation.');
      return;
    }

    setActionLoading(true);
    try {
      const response = await api.clearDatabase(clearTarget, adminPassword);
      setModalSuccess(response.message || 'Operation executed successfully.');
      setAdminPassword('');
      setConfirmCheckbox(false);
      fetchStats();
      setTimeout(() => setShowClearModal(false), 2000);
    } catch (err: any) {
      setModalError(err.message || 'Action failed. Incorrect administrator password.');
    } finally {
      setActionLoading(false);
    }
  };

  const fetchBackups = async () => {
    try {
      const data = await api.listBackups();
      setBackups(data);
    } catch (err) {
      console.error('Failed fetching database backups:', err);
    }
  };

  const handleCreateBackup = async () => {
    setBackupLoading(true);
    try {
      await api.createBackup();
      fetchBackups();
      alert('Backup snapshot saved successfully.');
    } catch (e) {
      alert('Failed creating database backup.');
    } finally {
      setBackupLoading(false);
    }
  };

  const handleRestoreBackup = async (name: string) => {
    if (window.confirm(`Are you sure you want to restore the database from backup: "${name}"? Current data will be overwritten.`)) {
      try {
        await api.restoreBackup(name);
        fetchStats();
        alert('Database restored successfully.');
      } catch (e) {
        alert('Failed restoring database.');
      }
    }
  };

  const handleDeleteBackup = async (name: string) => {
    if (window.confirm(`Are you sure you want to delete the backup file: "${name}"?`)) {
      try {
        await api.deleteBackup(name);
        fetchBackups();
        alert('Backup snapshot deleted successfully.');
      } catch (e) {
        alert('Failed to delete backup file.');
      }
    }
  };

  return (
    <div className="space-y-6 select-none font-sans max-w-4xl">
      
      {/* Module Header */}
      <div className="bg-white border border-savora-border rounded-3xl p-6 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-lg font-heading font-semibold text-savora-brown uppercase tracking-wider">
            Database Administration
          </h2>
          <p className="text-xs text-savora-text-secondary mt-0.5">Wipe data tables, back up schemas, and inspect storage.</p>
        </div>
        <button
          onClick={fetchStats}
          className="p-2.5 border border-savora-border bg-white text-savora-brown hover:bg-savora-card rounded-xl transition-all cursor-pointer"
        >
          <RefreshCw size={14} />
        </button>
      </div>

      {/* Storage Monitoring Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-savora-border rounded-2xl p-5 shadow-sm space-y-3">
          <div className="flex items-center gap-3">
            <span className="p-2.5 bg-savora-peach/30 text-savora-brown rounded-xl"><HardDrive size={18} /></span>
            <div>
              <span className="text-lg font-bold font-heading text-savora-text-primary">
                {loading ? '...' : stats.databaseSize}
              </span>
              <p className="text-[9px] uppercase font-bold text-savora-text-secondary tracking-wide">Database File Size</p>
            </div>
          </div>
          <div className="w-full bg-savora-card h-2 rounded-full overflow-hidden">
            <div className="w-[5%] h-full bg-savora-brown rounded-full"></div>
          </div>
        </div>

        <div className="bg-white border border-savora-border rounded-2xl p-5 shadow-sm space-y-3">
          <div className="flex items-center gap-3">
            <span className="p-2.5 bg-green-50 text-savora-success rounded-xl"><HardDrive size={18} /></span>
            <div>
              <span className="text-lg font-bold font-heading text-savora-success">
                {loading ? '...' : stats.availableStorage}
              </span>
              <p className="text-[9px] uppercase font-bold text-savora-text-secondary tracking-wide">Available Disk Space</p>
            </div>
          </div>
          <div className="w-full bg-savora-card h-2 rounded-full overflow-hidden">
            <div className="w-[95%] h-full bg-savora-success rounded-full"></div>
          </div>
        </div>

        <div className="bg-white border border-savora-border rounded-2xl p-5 shadow-sm space-y-3">
          <div className="flex items-center gap-3">
            <span className="p-2.5 bg-cyan-50 text-savora-info rounded-xl"><Database size={18} /></span>
            <div>
              <span className="text-lg font-bold font-heading text-savora-info">SQLite</span>
              <p className="text-[9px] uppercase font-bold text-savora-text-secondary tracking-wide">DB Engine Type</p>
            </div>
          </div>
          <p className="text-[9px] text-savora-text-secondary leading-relaxed">Storage limit bounded by native client disk capacities.</p>
        </div>
      </div>

      {/* Backup and Cleanup operations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
        
        {/* Backups Card */}
        <div className="bg-white border border-savora-border rounded-3xl p-6 shadow-sm space-y-4">
          <h3 className="text-xs uppercase font-bold text-savora-brown tracking-wider border-b border-savora-border/60 pb-2">
            Database Backups
          </h3>
          <p className="text-savora-text-secondary leading-relaxed">
            Generate local binary snapshots of your SQLite files containing products, orders, categories, and cashier accounts to C:\SAVORA\Backups.
          </p>
          <button
            onClick={handleCreateBackup}
            disabled={backupLoading}
            className="px-4 py-2 bg-savora-brown hover:bg-savora-taupe text-white font-bold rounded-xl shadow cursor-pointer transition-all disabled:opacity-50"
          >
            {backupLoading ? 'Creating Backup...' : 'Generate Manual Backup'}
          </button>

          {/* List backups */}
          <div className="mt-4 pt-4 border-t border-savora-border/60 space-y-2">
            <h4 className="font-semibold text-savora-text-primary text-xs">Saved Snapshots ({backups.length})</h4>
            <div className="divide-y divide-savora-border/60 max-h-44 overflow-y-auto space-y-2 pr-1">
              {backups.map((bk) => (
                <div key={bk.name} className="pt-2 flex justify-between items-center text-xs">
                  <div>
                    <p className="font-bold text-savora-text-primary truncate max-w-[150px]" title={bk.name}>{bk.name}</p>
                    <p className="text-[9px] text-savora-text-secondary font-mono">
                      {new Date(bk.date).toLocaleString()} | Size: {bk.size}
                    </p>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <button
                      onClick={() => handleRestoreBackup(bk.name)}
                      className="px-2.5 py-1 bg-white border border-savora-border hover:bg-savora-card rounded-lg text-savora-brown font-semibold transition-all cursor-pointer"
                    >
                      Restore
                    </button>
                    <button
                      onClick={() => handleDeleteBackup(bk.name)}
                      className="p-1 text-savora-error hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              ))}
              {backups.length === 0 && (
                <p className="text-[10px] text-center text-savora-text-secondary py-3 italic">No database backups saved yet.</p>
              )}
            </div>
          </div>
        </div>

        {/* Security Alert Warnings Box */}
        <div className="bg-white border border-savora-border rounded-3xl p-6 shadow-sm space-y-4">
          <h3 className="text-xs uppercase font-bold text-savora-brown tracking-wider border-b border-savora-border/60 pb-2 flex items-center gap-1">
            <ShieldAlert size={16} className="text-savora-warning" /> Administrator Commands
          </h3>
          <div className="p-3 bg-red-50 border border-red-100 text-[10px] text-savora-error rounded-2xl flex gap-2 font-medium leading-relaxed">
            <ShieldAlert size={20} className="shrink-0" />
            <span>
              <strong>CRITICAL WARNING:</strong> Clearing tables permanently removes transactions, products, categories, or cashiers. These actions cannot be undone. Password verification is required.
            </span>
          </div>

          {/* Delete Buttons Grid */}
          <div className="grid grid-cols-2 gap-3 pt-1 select-none">
            <button
              onClick={() => handleOpenClearModal('bills')}
              className="px-3 py-2 border border-savora-border hover:bg-red-50 hover:text-savora-error hover:border-red-200 text-savora-text-primary rounded-xl font-semibold flex items-center gap-1 justify-center transition-all cursor-pointer"
            >
              <Trash2 size={12} /> Clear Bills Logs
            </button>
            <button
              onClick={() => handleOpenClearModal('products')}
              className="px-3 py-2 border border-savora-border hover:bg-red-50 hover:text-savora-error hover:border-red-200 text-savora-text-primary rounded-xl font-semibold flex items-center gap-1 justify-center transition-all cursor-pointer"
            >
              <Trash2 size={12} /> Clear Products
            </button>
            <button
              onClick={() => handleOpenClearModal('categories')}
              className="px-3 py-2 border border-savora-border hover:bg-red-50 hover:text-savora-error hover:border-red-200 text-savora-text-primary rounded-xl font-semibold flex items-center gap-1 justify-center transition-all cursor-pointer"
            >
              <Trash2 size={12} /> Clear Categories
            </button>
            <button
              onClick={() => handleOpenClearModal('cashiers')}
              className="px-3 py-2 border border-savora-border hover:bg-red-50 hover:text-savora-error hover:border-red-200 text-savora-text-primary rounded-xl font-semibold flex items-center gap-1 justify-center transition-all cursor-pointer"
            >
              <Trash2 size={12} /> Clear Cashiers
            </button>
            <button
              onClick={() => handleOpenClearModal('all')}
              className="col-span-2 px-3 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold flex items-center gap-1.5 justify-center shadow transition-all cursor-pointer"
            >
              <Trash2 size={14} /> Wipe Entire Database (Factory Reset)
            </button>
          </div>
        </div>

      </div>

      {/* CONFIRMATION PASSWORD DIALOG MODAL */}
      {showClearModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-savora-border rounded-3xl max-w-sm w-full overflow-hidden shadow-2xl flex flex-col">
            
            {/* Modal Header */}
            <div className="p-4 bg-red-50 border-b border-red-100 flex justify-between items-center">
              <span className="font-heading font-semibold text-sm text-savora-error flex items-center gap-1.5">
                <ShieldAlert size={16} /> Confirm Data Wipe
              </span>
              <button
                onClick={() => setShowClearModal(false)}
                className="p-1 rounded-full hover:bg-red-100 text-savora-error"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body / Form */}
            <form onSubmit={handleClearSubmit} className="p-5 space-y-4 text-xs">
              <p className="text-savora-text-secondary leading-relaxed">
                You are about to clear the data target: <strong className="text-savora-error uppercase">"{clearTarget}"</strong>. This will drop all associated SQLite tables.
              </p>

              {modalError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-savora-error font-medium">
                  {modalError}
                </div>
              )}

              {modalSuccess && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-xl text-savora-success font-medium flex items-center gap-1 animate-pulse">
                  <CheckCircle2 size={14} />
                  <span>{modalSuccess}</span>
                </div>
              )}

              <div className="space-y-1">
                <label className="block font-semibold text-savora-text-primary">Admin Verify Password *</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-savora-text-secondary">
                    <Key size={14} />
                  </span>
                  <input
                    type="password"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    placeholder="Enter admin password"
                    required
                    className="w-full pl-9 pr-3 py-2.5 border border-savora-border rounded-xl bg-savora-card/30 outline-none focus:bg-white focus:ring-1 focus:ring-savora-brown"
                  />
                </div>
              </div>

              <label className="flex items-start gap-2 pt-1 select-none cursor-pointer">
                <input
                  type="checkbox"
                  checked={confirmCheckbox}
                  onChange={(e) => setConfirmCheckbox(e.target.checked)}
                  className="rounded text-red-600 focus:ring-red-500 border-savora-border w-4 h-4 shrink-0 mt-0.5"
                />
                <span className="text-[10px] text-savora-text-secondary font-semibold leading-relaxed">
                  I understand that this action is irreversible and permanently removes database records.
                </span>
              </label>

              {/* Actions */}
              <div className="pt-4 border-t border-savora-border flex justify-end gap-3 shrink-0 select-none">
                <button
                  type="button"
                  onClick={() => setShowClearModal(false)}
                  className="px-4 py-2 border border-savora-border rounded-xl font-semibold bg-white hover:bg-savora-card text-savora-text-primary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold cursor-pointer disabled:opacity-50"
                >
                  {actionLoading ? 'Clearing...' : 'Confirm Wipe'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};

export default DatabaseManagement;

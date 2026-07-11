import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Users, Plus, Edit2, Trash2, X, KeyRound, AlertTriangle } from 'lucide-react';

interface Cashier {
  id: number;
  name: string;
  email: string;
  role: string;
  status: 'Active' | 'Disabled';
  created_at?: string;
}

const UserManagement: React.FC = () => {
  const [cashiers, setCashiers] = useState<Cashier[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal control states
  const [showModal, setShowModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  
  // Password Reset Modal
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetId, setResetId] = useState<number | null>(null);
  const [resetName, setResetName] = useState('');
  
  // Form Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState<'Active' | 'Disabled'>('Active');
  
  // Password Reset field
  const [newPassword, setNewPassword] = useState('');

  const [modalError, setModalError] = useState<string | null>(null);

  useEffect(() => {
    fetchCashiers();
  }, []);

  const fetchCashiers = async () => {
    setLoading(true);
    try {
      const data = await api.getCashiers();
      setCashiers(data);
    } catch (err) {
      console.error('Failed fetching cashiers:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAddModal = () => {
    setIsEdit(false);
    setEditId(null);
    setName('');
    setEmail('');
    setPassword('');
    setStatus('Active');
    setModalError(null);
    setShowModal(true);
  };

  const handleOpenEditModal = (cashier: Cashier) => {
    setIsEdit(true);
    setEditId(cashier.id);
    setName(cashier.name);
    setEmail(cashier.email);
    setPassword(''); // don't set password during edits
    setStatus(cashier.status);
    setModalError(null);
    setShowModal(true);
  };

  const handleOpenResetModal = (cashier: Cashier) => {
    setResetId(cashier.id);
    setResetName(cashier.name);
    setNewPassword('');
    setModalError(null);
    setShowResetModal(true);
  };

  const handleSaveCashier = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError(null);

    if (!name.trim() || !email.trim()) {
      setModalError('Full Name and Email Address are required.');
      return;
    }

    if (!isEdit && !password.trim()) {
      setModalError('Password is required for new cashier accounts.');
      return;
    }

    try {
      if (isEdit && editId) {
        await api.updateCashier(editId, { name: name.trim(), email: email.trim(), status });
      } else {
        await api.addCashier({ name: name.trim(), email: email.trim(), password });
      }
      setShowModal(false);
      fetchCashiers();
    } catch (err: any) {
      setModalError(err.message || 'Action failed. Email address might exist.');
    }
  };

  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError(null);

    if (!newPassword.trim()) {
      setModalError('Please enter a new password.');
      return;
    }

    try {
      if (resetId) {
        await api.resetCashierPassword(resetId, { password: newPassword });
        setShowResetModal(false);
        alert(`Successfully reset password for ${resetName}.`);
      }
    } catch (err: any) {
      setModalError(err.message || 'Failed resetting password.');
    }
  };

  const handleDeleteCashier = async (id: number) => {
    if (window.confirm('Delete this Cashier workspace account permanently? This action cannot be undone.')) {
      try {
        await api.deleteCashier(id);
        fetchCashiers();
      } catch (err) {
        alert('Failed deleting cashier.');
      }
    }
  };

  // Metrics
  const activeCount = cashiers.filter((c) => c.status === 'Active').length;
  const disabledCount = cashiers.filter((c) => c.status === 'Disabled').length;

  return (
    <div className="space-y-6 select-none font-sans">
      
      {/* Module Header & Summary cards */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white border border-savora-border rounded-3xl p-6 shadow-sm">
        <div>
          <h2 className="text-lg font-heading font-semibold text-savora-brown uppercase tracking-wider">
            User Workspace Profiles
          </h2>
          <p className="text-xs text-savora-text-secondary mt-0.5">Manage counter cashiers, active roles, and credentials.</p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="px-4 py-2.5 rounded-xl bg-savora-brown hover:bg-savora-taupe text-white text-xs font-bold shadow-md shadow-savora-brown/10 flex items-center gap-1.5 cursor-pointer transition-all shrink-0"
        >
          <Plus size={16} /> Add Cashier Account
        </button>
      </div>

      {/* Mini Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-savora-border rounded-2xl p-4 flex items-center gap-4 shadow-sm">
          <span className="p-3 bg-savora-peach/30 text-savora-brown rounded-xl"><Users size={20} /></span>
          <div>
            <span className="text-lg font-bold font-heading text-savora-text-primary">{cashiers.length}</span>
            <p className="text-[10px] uppercase font-bold text-savora-text-secondary tracking-wide mt-0.5">Total Cashiers</p>
          </div>
        </div>
        <div className="bg-white border border-savora-border rounded-2xl p-4 flex items-center gap-4 shadow-sm">
          <span className="p-3 bg-green-50 text-savora-success rounded-xl"><Users size={20} /></span>
          <div>
            <span className="text-lg font-bold font-heading text-savora-success">{activeCount}</span>
            <p className="text-[10px] uppercase font-bold text-savora-text-secondary tracking-wide mt-0.5">Active Terminals</p>
          </div>
        </div>
        <div className="bg-white border border-savora-border rounded-2xl p-4 flex items-center gap-4 shadow-sm">
          <span className="p-3 bg-red-50 text-savora-error rounded-xl"><Users size={20} /></span>
          <div>
            <span className="text-lg font-bold font-heading text-savora-error">{disabledCount}</span>
            <p className="text-[10px] uppercase font-bold text-savora-text-secondary tracking-wide mt-0.5">Disabled Accounts</p>
          </div>
        </div>
      </div>

      {loading ? (
        // List skeleton
        <div className="bg-white border border-savora-border rounded-3xl p-6 shadow-sm space-y-3">
          {[1, 2].map((n) => (
            <div key={n} className="h-12 bg-savora-card border border-savora-border rounded-xl animate-shimmer"></div>
          ))}
        </div>
      ) : cashiers.length === 0 ? (
        /* Empty State */
        <div className="bg-white border border-savora-border rounded-3xl p-12 text-center shadow-sm max-w-lg mx-auto flex flex-col items-center">
          <div className="w-16 h-16 rounded-full bg-savora-card border border-savora-border flex items-center justify-center text-savora-beige mb-4">
            <Users size={32} />
          </div>
          <h3 className="font-heading font-semibold text-base text-savora-brown">No Cashier Accounts registered</h3>
          <p className="text-xs text-savora-text-secondary mt-1 max-w-xs">
            Create cashier workspace profiles using their email credentials so they can begin register operations.
          </p>
          <button
            onClick={handleOpenAddModal}
            className="mt-4 px-4 py-2 bg-savora-brown text-white text-xs font-bold rounded-xl shadow cursor-pointer hover:bg-savora-taupe"
          >
            Create Cashier profile
          </button>
        </div>
      ) : (
        /* Table List */
        <div className="bg-white border border-savora-border rounded-3xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-savora-card border-b border-savora-border text-xs uppercase font-bold text-savora-text-secondary">
                <tr>
                  <th className="p-4 pl-6">Name</th>
                  <th className="p-4">Email (Username)</th>
                  <th className="p-4">Role</th>
                  <th className="p-4 text-center">Status</th>
                  <th className="p-4 text-center pr-6">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-savora-border/60 text-xs">
                {cashiers.map((cashier) => (
                  <tr key={cashier.id} className="hover:bg-savora-card/25 transition-colors">
                    <td className="p-4 pl-6 font-semibold text-savora-text-primary">{cashier.name}</td>
                    <td className="p-4 font-mono font-semibold text-savora-text-secondary">{cashier.email}</td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 rounded-lg border border-savora-border bg-savora-card text-savora-brown text-[10px] font-bold">
                        {cashier.role}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          cashier.status === 'Active'
                            ? 'bg-green-50 text-savora-success border border-green-200'
                            : 'bg-red-50 text-savora-error border border-red-200'
                        }`}
                      >
                        {cashier.status}
                      </span>
                    </td>
                    <td className="p-4 text-center pr-6">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleOpenResetModal(cashier)}
                          title="Reset Password"
                          className="p-2 border border-savora-border hover:bg-savora-card text-savora-text-secondary hover:text-savora-brown rounded-xl transition-all cursor-pointer"
                        >
                          <KeyRound size={12} />
                        </button>
                        <button
                          onClick={() => handleOpenEditModal(cashier)}
                          title="Edit Profile"
                          className="p-2 border border-savora-border hover:bg-savora-card text-savora-text-secondary hover:text-savora-brown rounded-xl transition-all cursor-pointer"
                        >
                          <Edit2 size={12} />
                        </button>
                        <button
                          onClick={() => handleDeleteCashier(cashier.id)}
                          title="Delete Account"
                          className="p-2 border border-transparent hover:border-red-200 text-savora-error hover:bg-red-50 rounded-xl transition-all cursor-pointer"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CREATE / EDIT CASHIER PROFILE MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-savora-border rounded-3xl max-w-sm w-full overflow-hidden shadow-2xl flex flex-col">
            
            {/* Modal Header */}
            <div className="p-4 bg-savora-card border-b border-savora-border flex justify-between items-center">
              <span className="font-heading font-semibold text-sm text-savora-brown">
                {isEdit ? 'Modify Cashier workspace' : 'Create Cashier Account'}
              </span>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 rounded-full hover:bg-savora-border text-savora-text-secondary"
              >
                <X size={18} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveCashier} className="p-5 space-y-4 text-xs">
              {modalError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-savora-error font-medium">
                  {modalError}
                </div>
              )}

              <div>
                <label className="block font-semibold text-savora-text-primary mb-1">Full Cashier Name *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. John Doe"
                  required
                  className="w-full p-2.5 border border-savora-border rounded-xl bg-savora-card/30 outline-none focus:bg-white focus:ring-1 focus:ring-savora-brown"
                />
              </div>

              <div>
                <label className="block font-semibold text-savora-text-primary mb-1">Email Address Username *</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. john@savora.in"
                  required
                  disabled={isEdit}
                  className="w-full p-2.5 border border-savora-border rounded-xl bg-savora-card/30 outline-none focus:bg-white focus:ring-1 focus:ring-savora-brown disabled:opacity-50"
                />
              </div>

              {!isEdit && (
                <div>
                  <label className="block font-semibold text-savora-text-primary mb-1">Temporary Password *</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    required
                    className="w-full p-2.5 border border-savora-border rounded-xl bg-savora-card/30 outline-none focus:bg-white focus:ring-1 focus:ring-savora-brown"
                  />
                </div>
              )}

              {isEdit && (
                <div>
                  <label className="block font-semibold text-savora-text-primary mb-1">Terminal Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full p-2.5 border border-savora-border rounded-xl bg-savora-card/30 outline-none focus:bg-white focus:ring-1 focus:ring-savora-brown"
                  >
                    <option value="Active">Active (Permitted)</option>
                    <option value="Disabled">Disabled (Blocked)</option>
                  </select>
                </div>
              )}

              {/* Actions */}
              <div className="pt-4 border-t border-savora-border flex justify-end gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-savora-border rounded-xl font-semibold bg-white hover:bg-savora-card text-savora-text-primary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-savora-brown hover:bg-savora-taupe text-white font-bold cursor-pointer"
                >
                  Save Cashier
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* PASSWORD RESET MODAL */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-savora-border rounded-3xl max-w-sm w-full overflow-hidden shadow-2xl flex flex-col">
            
            {/* Modal Header */}
            <div className="p-4 bg-savora-card border-b border-savora-border flex justify-between items-center">
              <span className="font-heading font-semibold text-sm text-savora-brown">Reset Cashier Password</span>
              <button
                onClick={() => setShowResetModal(false)}
                className="p-1 rounded-full hover:bg-savora-border text-savora-text-secondary"
              >
                <X size={18} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleResetPasswordSubmit} className="p-5 space-y-4 text-xs">
              <div className="flex items-start gap-2 p-3.5 bg-orange-50 border border-orange-200 rounded-xl text-[10px] text-savora-warning font-semibold leading-relaxed">
                <AlertTriangle size={18} className="shrink-0" />
                <span>You are resetting the password for account: <strong>{resetName}</strong>. Make sure to share the credentials securely.</span>
              </div>

              {modalError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-savora-error font-medium">
                  {modalError}
                </div>
              )}

              <div>
                <label className="block font-semibold text-savora-text-primary mb-1">New Terminal Password *</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  required
                  className="w-full p-2.5 border border-savora-border rounded-xl bg-savora-card/30 outline-none focus:bg-white focus:ring-1 focus:ring-savora-brown"
                />
              </div>

              {/* Actions */}
              <div className="pt-4 border-t border-savora-border flex justify-end gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => setShowResetModal(false)}
                  className="px-4 py-2 border border-savora-border rounded-xl font-semibold bg-white hover:bg-savora-card text-savora-text-primary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-savora-brown hover:bg-savora-taupe text-white font-bold cursor-pointer"
                >
                  Confirm Reset
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};

export default UserManagement;

import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { User, Lock, Mail, Save, CheckCircle2, MapPin } from 'lucide-react';

const Profile: React.FC = () => {
  const { user } = useAuth();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!name.trim() || !email.trim()) {
      setError('Full Name and Email Address are required.');
      return;
    }

    if (password) {
      if (password !== confirmPassword) {
        setError('New password and password confirmation do not match.');
        return;
      }
      if (password.length < 6) {
        setError('Password must contain at least 6 characters.');
        return;
      }
    }

    setLoading(true);
    try {
      const payload: any = { name: name.trim(), email: email.trim() };
      if (password) payload.password = password;

      const res = await api.updateProfile(payload);
      setSuccess(res.message || 'Profile settings updated successfully!');
      setPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setError(err.message || 'Failed to update profile settings.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 select-none font-sans max-w-4xl">
      
      {/* Page Header */}
      <div className="bg-white border border-savora-border rounded-3xl p-6 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-lg font-heading font-semibold text-savora-brown uppercase tracking-wider">
            Workspace Profile
          </h2>
          <p className="text-xs text-savora-text-secondary mt-0.5 font-sans">Manage credentials and profile information.</p>
        </div>

        {success && (
          <div className="px-4 py-2 bg-green-50 border border-green-200 text-savora-success text-xs font-semibold rounded-xl flex items-center gap-1.5 animate-pulse shrink-0">
            <CheckCircle2 size={14} />
            <span>{success}</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main card form */}
        <div className="md:col-span-2 bg-white border border-savora-border rounded-3xl p-6 shadow-sm text-xs">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-savora-error font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block font-semibold text-savora-text-primary mb-1">Full User Name *</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-savora-text-secondary">
                  <User size={14} />
                </span>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full pl-9 pr-3 py-2.5 border border-savora-border rounded-xl bg-savora-card/30 outline-none focus:bg-white focus:ring-1 focus:ring-savora-brown font-semibold text-savora-text-primary"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-savora-text-primary mb-1">Email Address *</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-savora-text-secondary">
                  <Mail size={14} />
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-9 pr-3 py-2.5 border border-savora-border rounded-xl bg-savora-card/30 outline-none focus:bg-white focus:ring-1 focus:ring-savora-brown text-savora-text-primary"
                />
              </div>
            </div>

            <div className="border-t border-savora-border/65 pt-4 space-y-4">
              <h3 className="font-heading font-semibold text-savora-brown font-semibold">Change Account Password</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-savora-text-primary mb-1">New Password</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-savora-text-secondary">
                      <Lock size={14} />
                    </span>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Leave blank to keep same"
                      className="w-full pl-9 pr-3 py-2.5 border border-savora-border rounded-xl bg-savora-card/30 outline-none focus:bg-white focus:ring-1 focus:ring-savora-brown"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-savora-text-primary mb-1">Confirm Password</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-savora-text-secondary">
                      <Lock size={14} />
                    </span>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Leave blank to keep same"
                      className="w-full pl-9 pr-3 py-2.5 border border-savora-border rounded-xl bg-savora-card/30 outline-none focus:bg-white focus:ring-1 focus:ring-savora-brown"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-savora-border flex justify-end select-none">
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2.5 bg-savora-brown hover:bg-savora-taupe text-white font-bold rounded-xl shadow-md shadow-savora-brown/10 flex items-center gap-1 transition-all cursor-pointer disabled:opacity-50"
              >
                <Save size={14} /> {loading ? 'Saving...' : 'Update Profile Settings'}
              </button>
            </div>
          </form>
        </div>

        {/* Store Information panel */}
        <div className="bg-white border border-savora-border rounded-3xl p-6 shadow-sm text-xs space-y-4 h-fit">
          <h3 className="text-xs uppercase font-bold text-savora-brown tracking-wider border-b border-savora-border/60 pb-2 flex items-center gap-1.5">
            <MapPin size={14} /> Store Information
          </h3>
          <div className="space-y-2.5 font-sans">
            <div>
              <span className="font-bold text-savora-text-primary block">Store Name</span>
              <span className="text-savora-text-secondary">Savora Cafe & Bakers</span>
            </div>
            <div>
              <span className="font-bold text-savora-text-primary block">Location Address</span>
              <p className="text-savora-text-secondary leading-relaxed mt-0.5 font-medium">
                Asramam<br />
                Near Younis Convention Centre<br />
                Kollam, Kerala<br />
                Pincode: 691002
              </p>
            </div>
            <div>
              <span className="font-bold text-savora-text-primary block">Contact Support</span>
              <span className="text-savora-text-secondary font-medium">+91 98765 43210</span>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default Profile;

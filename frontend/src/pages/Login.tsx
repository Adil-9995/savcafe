import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Lock, Mail, Users, AlertCircle } from 'lucide-react';

const Login: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'Shop Owner' | 'Cashier'>('Shop Owner');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const user = await login({ email, password, role });
      if (user.role === 'Cashier') {
        navigate('/billing');
      } else {
        navigate('/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-savora-beige flex items-center justify-center p-4 md:p-6 font-sans">
      <div className="max-w-4xl w-full bg-white rounded-3xl shadow-xl overflow-hidden grid grid-cols-1 md:grid-cols-12 min-h-[500px]">

        {/* Left Side: Brand Panel */}
        <div className="md:col-span-5 bg-gradient-to-br from-savora-brown to-savora-taupe text-white p-8 md:p-12 flex flex-col justify-between items-center text-center relative">
          {/* Visual embellishments */}
          <div className="absolute top-0 left-0 w-32 h-32 bg-savora-peach/5 rounded-full blur-xl"></div>
          <div className="absolute bottom-0 right-0 w-36 h-36 bg-savora-peach/10 rounded-full blur-2xl"></div>

          <div></div>

          <div className="relative z-10 flex flex-col items-center">
            <div className="w-16 h-16 rounded-2xl bg-savora-peach text-savora-brown flex items-center justify-center font-heading font-extrabold text-3xl shadow-lg mb-6">
              S
            </div>
            <h1 className="font-heading font-bold text-3xl tracking-wide text-savora-peach leading-tight">
              SAVORA
            </h1>
            <p className="font-heading text-sm font-semibold tracking-wider text-savora-beige mt-1">
              Bakery & Ice Bay Ice Creams
            </p>
            <div className="w-16 h-0.5 bg-savora-peach/30 my-4"></div>
            <p className="text-xs text-savora-card/85 font-light leading-relaxed max-w-[200px]">
              Freshly Baked Delights & Premium Ice Creams
            </p>
          </div>

          <p className="text-[9px] text-savora-beige/40 relative z-10 tracking-widest uppercase">
            Powered by Savora Engine
          </p>
        </div>

        {/* Right Side: Form Panel */}
        <div className="md:col-span-7 p-8 md:p-12 flex flex-col justify-center">
          <div className="mb-6">
            <h2 className="text-2xl font-heading font-semibold text-savora-brown">Sign In</h2>
            <p className="text-xs text-savora-text-secondary mt-1">Access your POS workspace counter.</p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-xs text-savora-error">
              <AlertCircle size={16} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Role Selection */}
            <div>
              <label className="block text-xs font-semibold text-savora-text-primary mb-1.5">User Workspace Role</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole('Shop Owner')}
                  className={`flex items-center justify-center gap-2 py-2.5 rounded-xl border text-xs font-semibold transition-all ${role === 'Shop Owner'
                      ? 'bg-savora-peach/30 text-savora-brown border-savora-brown shadow-sm font-bold'
                      : 'bg-white text-savora-text-secondary border-savora-border hover:bg-savora-card'
                    }`}
                >
                  <Users size={14} /> Shop Owner
                </button>
                <button
                  type="button"
                  onClick={() => setRole('Cashier')}
                  className={`flex items-center justify-center gap-2 py-2.5 rounded-xl border text-xs font-semibold transition-all ${role === 'Cashier'
                      ? 'bg-savora-peach/30 text-savora-brown border-savora-brown shadow-sm font-bold'
                      : 'bg-white text-savora-text-secondary border-savora-border hover:bg-savora-card'
                    }`}
                >
                  <Users size={14} /> Cashier Counter
                </button>
              </div>
            </div>

            {/* Email Field */}
            <div>
              <label className="block text-xs font-semibold text-savora-text-primary mb-1">Email Username</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-savora-text-secondary">
                  <Mail size={16} />
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter email address"
                  required
                  className="w-full pl-10 pr-4 py-2.5 border border-savora-border rounded-xl text-xs focus:ring-1 focus:ring-savora-brown focus:border-savora-brown bg-savora-card/30 focus:bg-white transition-all outline-none text-savora-text-primary"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-xs font-semibold text-savora-text-primary">Password</label>
                <a href="#" className="text-[10px] text-savora-taupe hover:underline">Forgot password?</a>
              </div>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-savora-text-secondary">
                  <Lock size={16} />
                </span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  required
                  className="w-full pl-10 pr-4 py-2.5 border border-savora-border rounded-xl text-xs focus:ring-1 focus:ring-savora-brown focus:border-savora-brown bg-savora-card/30 focus:bg-white transition-all outline-none text-savora-text-primary"
                />
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center justify-between pt-1 select-none">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded text-savora-brown focus:ring-savora-brown border-savora-border w-3.5 h-3.5"
                />
                <span className="text-[10px] font-medium text-savora-text-secondary">Remember session</span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-savora-brown hover:bg-savora-taupe text-white text-xs font-semibold shadow-md shadow-savora-brown/20 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                'Sign In Workspace'
              )}
            </button>
          </form>

          {/* Setup Info Footnote */}
          <div className="mt-6 pt-5 border-t border-savora-border text-[9px] text-savora-text-secondary bg-savora-card p-3.5 rounded-2xl space-y-1">
            <p className="font-bold text-savora-brown">Default Sandbox Credentials:</p>
            <div className="flex flex-col gap-0.5 font-mono">
              <p>Admin: <span className="font-semibold text-savora-text-primary">savoracafeandice@gmail.com</span> / <span className="font-semibold text-savora-text-primary">savcafe@123</span></p>
              <p>Cashier: <span className="font-semibold text-savora-text-primary">cashier@savora.in</span> / <span className="font-semibold text-savora-text-primary">Savora@123</span></p>
            </div>
            <p className="text-[8px] italic text-red-500 font-semibold pt-1">
              * Shop Owner password should be changed after first login.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Login;

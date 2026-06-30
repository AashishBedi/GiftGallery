import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { login as loginApi, register as registerApi } from '../api/auth.api';

const Login = () => {
  const [tab, setTab] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Frontend validation
    if (tab === 'register' && form.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      if (tab === 'login') {
        const res = await loginApi({ email: form.email, password: form.password });
        // Backend returns: { token, name, email, role } — no nested "user" wrapper
        const { token, ...userData } = res.data;
        login(userData, token);
        navigate('/');
      } else {
        const res = await registerApi({ name: form.name, email: form.email, password: form.password });
        // Same flat structure: { token, name, email, role }
        const { token, ...userData } = res.data;
        login(userData, token);
        navigate('/');
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data || '';
      if (msg === 'Email already registered') {
        setError('This email is already registered. Please login instead.');
      } else if (msg === 'Invalid email or password') {
        setError('Incorrect email or password. Please try again.');
      } else {
        setError(typeof msg === 'string' && msg ? msg : 'Something went wrong. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f7f7] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-block">
            <span className="text-3xl font-black" style={{ color: '#CC0000' }}>🎁 Gift Gallery</span>
            <p className="text-xs text-gray-400 mt-1 italic font-light">Where care finds its perfect expression.</p>
          </Link>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          {/* Tab switcher */}
          <div className="flex rounded-xl bg-gray-100 p-1 mb-6">
            <button
              onClick={() => { setTab('login'); setError(''); }}
              className="flex-1 py-2.5 rounded-lg text-sm font-bold transition-all"
              style={tab === 'login' ? { backgroundColor: '#CC0000', color: 'white' } : { color: '#666' }}
            >
              Login
            </button>
            <button
              onClick={() => { setTab('register'); setError(''); }}
              className="flex-1 py-2.5 rounded-lg text-sm font-bold transition-all"
              style={tab === 'register' ? { backgroundColor: '#CC0000', color: 'white' } : { color: '#666' }}
            >
              Create Account
            </button>
          </div>

          {error && (
            <div
              className="text-sm rounded-lg px-4 py-3 mb-5"
              style={{ backgroundColor: '#fff0f0', border: '1px solid #ffd0d0', color: '#cc0000' }}
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {tab === 'register' && (
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5 block">Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="John Doe"
                  required
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none transition"
                  style={{ backgroundColor: '#fafafa' }}
                  onFocus={(e) => e.target.style.borderColor = '#CC0000'}
                  onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                />
              </div>
            )}
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5 block">Email Address</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                required
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none transition"
                style={{ backgroundColor: '#fafafa' }}
                onFocus={(e) => e.target.style.borderColor = '#CC0000'}
                onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5 block">Password</label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder={tab === 'register' ? 'At least 6 characters' : '••••••••'}
                required
                minLength={tab === 'register' ? 6 : undefined}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none transition"
                style={{ backgroundColor: '#fafafa' }}
                onFocus={(e) => e.target.style.borderColor = '#CC0000'}
                onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
              />
              {tab === 'register' && (
                <p className="text-xs text-gray-400 mt-1 pl-1">Minimum 6 characters required</p>
              )}
            </div>
            <button
              type="submit"
              disabled={loading}
              className="mt-1 text-white font-bold py-3 rounded-xl transition-opacity disabled:opacity-60 text-sm tracking-wide"
              style={{ backgroundColor: '#CC0000' }}
            >
              {loading ? 'Please wait...' : tab === 'login' ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-5">
            {tab === 'login' ? (
              <>
                Don't have an account?{' '}
                <button
                  onClick={() => { setTab('register'); setError(''); }}
                  className="font-semibold hover:underline"
                  style={{ color: '#CC0000' }}
                >
                  Create one
                </button>
              </>
            ) : (
              <>
                Already have an account?{' '}
                <button
                  onClick={() => { setTab('login'); setError(''); }}
                  className="font-semibold hover:underline"
                  style={{ color: '#CC0000' }}
                >
                  Sign in
                </button>
              </>
            )}
          </p>
        </div>

        <p className="text-center text-xs text-gray-400 mt-5">
          By continuing, you agree to our{' '}
          <a href="#" style={{ color: '#CC0000' }} className="hover:underline">Terms</a> and{' '}
          <a href="#" style={{ color: '#CC0000' }} className="hover:underline">Privacy Policy</a>
        </p>
      </div>
    </div>
  );
};

export default Login;

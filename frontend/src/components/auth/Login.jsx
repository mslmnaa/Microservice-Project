import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-violet-500 rounded-xl mb-4">
            <svg className="fill-white" xmlns="http://www.w3.org/2000/svg" width={22} height={22}>
              <path d="M21.956 10.134C21.372 4.64 17.36.628 11.866.044V3.84a6.28 6.28 0 0 0 6.28 6.28h3.81ZM10.134 18.16v3.796C4.64 21.372.628 17.36.044 11.866H3.84a6.28 6.28 0 0 1 6.294 6.294Zm7.946-6.294h3.796C21.372 17.36 17.36 21.372 11.866 21.956V18.16a6.28 6.28 0 0 1 6.214-6.294ZM.044 10.134C.628 4.64 4.64.628 10.134.044V3.84a6.28 6.28 0 0 1-6.28 6.28H.044Z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Hospital Management System</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Sign in to your account</p>
        </div>

        {/* Card */}
        <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="form-input"
                placeholder="admin@hospital.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-input"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn w-full bg-violet-500 hover:bg-violet-600 text-white disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          {/* Demo credentials */}
          <div className="mt-5 pt-5 border-t border-gray-100 dark:border-gray-700/60">
            <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase mb-2">Demo Credentials</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Admin: admin@hospital.com / admin123</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Doctor: doctor@hospital.com / doctor123</p>
          </div>
        </div>

      </div>
    </main>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Spinner from '@/components/Spinner';

export default function AdminLogin() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSetup, setIsSetup] = useState<boolean | null>(null);
  const [setupLoading, setSetupLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    checkSetupStatus();
  }, []);

  const checkSetupStatus = async () => {
    try {
      const response = await fetch('/api/admin/setup');
      const data = await response.json();
      setIsSetup(data.isSetup);
    } catch (err) {
      console.error('Failed to check setup status:', err);
    } finally {
      setSetupLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          password,
          isSetup: !isSetup // If not setup, this is a setup request
        }),
      });

      const data = await response.json();

      if (response.ok) {
        if (data.isSetup) {
          // First-time setup completed
          setIsSetup(true);
          setError('');
        }
        router.push('/admin/dashboard');
      } else {
        setError(data.error || 'Invalid password');
      }
    } catch (err) {
      setError('Login failed');
    } finally {
      setLoading(false);
    }
  };

  if (setupLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950">
        <div className="flex items-center space-x-2">
          <Spinner size="sm" />
          <span className="text-white text-xs font-mono">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-xl font-mono font-bold text-white">
            SAMS Admin
          </h2>
          <p className="mt-2 text-center text-xs text-gray-400 font-mono">
            {isSetup 
              ? "Sign in to manage your Steam Auth service"
              : "Set up your admin password"
            }
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="password" className="sr-only">
              {isSetup ? "Admin Password" : "New Admin Password"}
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              minLength={8}
              className="relative block w-full px-3 py-2 border border-gray-700 bg-gray-900 placeholder-gray-500 text-white rounded text-xs font-mono focus:outline-none focus:ring-green-500 focus:border-green-500 focus:z-10"
              placeholder={isSetup ? "Admin password" : "New admin password (min 8 chars)"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && (
            <div className="text-red-400 text-xs text-center font-mono">{error}</div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-xs font-mono font-medium rounded text-black bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
            >
              {loading ? (
                <div className="flex items-center space-x-2">
                  <Spinner size="sm" />
                  <span>{isSetup ? "Signing in..." : "Setting up..."}</span>
                </div>
              ) : (
                isSetup ? '> sign_in' : '> setup_admin'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

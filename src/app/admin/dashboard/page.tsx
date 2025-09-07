'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Spinner from '@/components/Spinner';
import AdminNavbar from '@/components/AdminNavbar';

interface DashboardStats {
  totalOrigins: number;
  totalSessions: number;
  recentLogins: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/stats', {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950">
        <div className="flex items-center space-x-3">
          <Spinner size="md" />
          <span className="text-sm text-white font-mono">Loading dashboard...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950">
      <AdminNavbar />
      <div className="max-w-7xl mx-auto py-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="px-4 py-3 sm:px-0">
          <h1 className="text-xl font-mono font-bold text-white">Dashboard</h1>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 overflow-hidden shadow rounded-lg">
            <div className="p-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-6 h-6 bg-blue-500 rounded flex items-center justify-center">
                    <span className="text-white text-xs font-mono">#</span>
                  </div>
                </div>
                <div className="ml-4 w-0 flex-1">
                  <dl>
                    <dt className="text-xs font-mono text-gray-400 truncate">
                      Allowed Origins
                    </dt>
                    <dd className="text-sm font-mono font-medium text-white">
                      {stats?.totalOrigins || 0}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 overflow-hidden shadow rounded-lg">
            <div className="p-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-6 h-6 bg-green-500 rounded flex items-center justify-center">
                    <span className="text-white text-xs font-mono">&gt;</span>
                  </div>
                </div>
                <div className="ml-4 w-0 flex-1">
                  <dl>
                    <dt className="text-xs font-mono text-gray-400 truncate">
                      Active Sessions
                    </dt>
                    <dd className="text-sm font-mono font-medium text-white">
                      {stats?.totalSessions || 0}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 overflow-hidden shadow rounded-lg">
            <div className="p-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-6 h-6 bg-yellow-500 rounded flex items-center justify-center">
                    <span className="text-white text-xs font-mono">$</span>
                  </div>
                </div>
                <div className="ml-4 w-0 flex-1">
                  <dl>
                    <dt className="text-xs font-mono text-gray-400 truncate">
                      Recent Logins (24h)
                    </dt>
                    <dd className="text-sm font-mono font-medium text-white">
                      {stats?.recentLogins || 0}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Initialization */}
        {stats?.totalOrigins === 0 && (
          <div className="bg-yellow-900/20 border border-yellow-700 rounded p-4 mb-6">
            <h3 className="text-sm font-mono font-medium text-yellow-300 mb-2">First Time Setup</h3>
            <p className="text-xs text-yellow-200 mb-3 font-mono">
              Initialize your allowed origins from environment variables or add them manually.
            </p>
            <button
              onClick={async () => {
                try {
                  const response = await fetch('/api/admin/init', {
                    method: 'POST',
                    credentials: 'include',
                  });
                  if (response.ok) {
                    fetchStats(); // Refresh stats
                  }
                } catch (err) {
                  console.error('Init failed:', err);
                }
              }}
              className="bg-yellow-600 text-black px-3 py-1 rounded text-xs font-mono hover:bg-yellow-700 transition-colors"
            >
              &gt; initialize
            </button>
          </div>
        )}


        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 shadow rounded-lg p-4">
            <h3 className="text-sm font-mono font-medium text-white mb-3">
              Site Management
            </h3>
            <p className="text-gray-400 mb-4 text-xs font-mono">
              Manage which domains can use your Steam authentication service.
            </p>
            <Link
              href="/admin/sites"
              className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-mono font-medium rounded text-black bg-blue-600 hover:bg-blue-700 transition-colors"
            >
              &gt; manage_sites
            </Link>
          </div>

          <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 shadow rounded-lg p-4">
            <h3 className="text-sm font-mono font-medium text-white mb-3">
              Configuration
            </h3>
            <p className="text-gray-400 mb-4 text-xs font-mono">
              View and update your Steam API key and other settings.
            </p>
            <Link
              href="/admin/config"
              className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-mono font-medium rounded text-black bg-green-600 hover:bg-green-700 transition-colors"
            >
              &gt; view_config
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
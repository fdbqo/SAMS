'use client';

import { useState, useEffect } from 'react';
import Spinner from '@/components/Spinner';
import AdminNavbar from '@/components/AdminNavbar';

interface Site {
  origin: string;
  addedAt: string;
  lastUsed?: string;
}

export default function SitesManagement() {
  const [sites, setSites] = useState<Site[]>([]);
  const [newSite, setNewSite] = useState('');
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchSites();
  }, []);

  const fetchSites = async () => {
    try {
      const response = await fetch('/api/admin/sites', {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setSites(data.sites || []);
      }
    } catch (err) {
      console.error('Failed to fetch sites:', err);
    } finally {
      setLoading(false);
    }
  };

  const addSite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSite.trim()) return;

    setAdding(true);
    setError('');

    try {
      const response = await fetch('/api/admin/sites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ origin: newSite.trim() }),
      });

      if (response.ok) {
        setNewSite('');
        fetchSites(); // Refresh the list
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to add site');
      }
    } catch (err) {
      setError('Failed to add site');
    } finally {
      setAdding(false);
    }
  };

  const removeSite = async (origin: string) => {
    if (!confirm(`Are you sure you want to remove ${origin}?`)) return;

    try {
      const response = await fetch('/api/admin/sites', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ origin }),
      });

      if (response.ok) {
        fetchSites(); // Refresh the list
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to remove site');
      }
    } catch (err) {
      setError('Failed to remove site');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950">
        <div className="flex items-center space-x-3">
          <Spinner size="md" />
          <span className="text-sm text-white font-mono">Loading sites...</span>
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
          <h1 className="text-xl font-mono font-bold text-white">Site Management</h1>
          <p className="mt-2 text-gray-400 text-xs font-mono">
            Manage which domains can use your Steam authentication service
          </p>
        </div>

        {/* Add New Site */}
        <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 shadow rounded-lg p-4 mb-4">
          <h2 className="text-sm font-mono font-medium text-white mb-3">Add New Site</h2>
          <form onSubmit={addSite} className="flex gap-3">
            <input
              type="url"
              value={newSite}
              onChange={(e) => setNewSite(e.target.value)}
              placeholder="https://your-app.com"
              className="flex-1 px-3 py-2 border border-gray-700 bg-gray-900 text-white placeholder-gray-500 rounded text-xs font-mono focus:outline-none focus:ring-green-500 focus:border-green-500"
              required
            />
            <button
              type="submit"
              disabled={adding}
              className="bg-green-600 text-black px-4 py-2 rounded text-xs font-mono hover:bg-green-700 disabled:opacity-50 transition-colors flex items-center space-x-2"
            >
              {adding ? (
                <>
                  <Spinner size="sm" />
                  <span>Adding...</span>
                </>
              ) : (
                <span>&gt; add</span>
              )}
            </button>
          </form>
          {error && (
            <div className="mt-2 text-red-400 text-xs font-mono">{error}</div>
          )}
        </div>

        {/* Sites List */}
        <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 shadow rounded-lg">
          <div className="px-4 py-3 border-b border-gray-800">
            <h2 className="text-sm font-mono font-medium text-white">
              Allowed Origins ({sites.length})
            </h2>
          </div>
          <div className="divide-y divide-gray-800">
            {sites.length === 0 ? (
              <div className="px-4 py-6 text-center text-gray-400 text-xs font-mono">
                No sites configured yet. Add your first site above.
              </div>
            ) : (
              sites.map((site) => (
                <div key={site.origin} className="px-4 py-3 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-mono font-medium text-white">
                      {site.origin}
                    </div>
                    <div className="text-xs text-gray-400 font-mono">
                      Added: {new Date(site.addedAt).toLocaleDateString()}
                      {site.lastUsed && (
                        <span className="ml-3">
                          Last used: {new Date(site.lastUsed).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => removeSite(site.origin)}
                    className="text-red-400 hover:text-red-300 text-xs font-mono transition-colors"
                  >
                    &gt; remove
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Help Text */}
        <div className="mt-6 bg-gray-900/50 border border-gray-800 rounded p-4">
          <h3 className="text-xs font-mono font-medium text-gray-300 mb-2">How to use:</h3>
          <ul className="text-xs text-gray-400 space-y-1 font-mono">
            <li>• Add the full domain (including https://) of your applications</li>
            <li>• Each app that uses your auth service needs to be added here</li>
            <li>• You can add multiple domains for the same app (e.g., production and staging)</li>
            <li>• Remove domains you no longer use to keep your service secure</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
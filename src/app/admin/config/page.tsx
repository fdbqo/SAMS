'use client';

import { useState, useEffect } from 'react';
import Spinner from '@/components/Spinner';
import AdminNavbar from '@/components/AdminNavbar';

interface Config {
  steamApiKey: string;
  authServiceUrl: string;
  jwtSecret: string;
  redisConnected: boolean;
  nodeEnv: string;
}

export default function ConfigPage() {
  const [config, setConfig] = useState<Config | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const response = await fetch('/api/admin/config', {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setConfig(data);
      }
    } catch (err) {
      console.error('Failed to fetch config:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950">
        <div className="flex items-center space-x-3">
          <Spinner size="md" />
          <span className="text-sm text-white font-mono">Loading configuration...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950">
      <AdminNavbar />
      <div className="max-w-4xl mx-auto py-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="px-4 py-3 sm:px-0">
          <h1 className="text-xl font-mono font-bold text-white">Configuration</h1>
          <p className="mt-2 text-gray-400 text-xs font-mono">
            View your Steam Auth service configuration
          </p>
        </div>

        {/* Configuration Cards */}
        <div className="space-y-4">
          {/* Steam API Key */}
          <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 shadow rounded-lg p-4">
            <h3 className="text-sm font-mono font-medium text-white mb-3">Steam API Key</h3>
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <input
                  type="password"
                  value={config?.steamApiKey || ''}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-700 rounded text-xs font-mono bg-gray-900 text-gray-300"
                />
              </div>
              <div className="text-xs text-gray-400 font-mono">
                {config?.steamApiKey ? '> configured' : '> not_set'}
              </div>
            </div>
            <p className="mt-2 text-xs text-gray-400 font-mono">
              Set via STEAM_API_KEY environment variable. Get your key from{' '}
              <a
                href="https://steamcommunity.com/dev/apikey"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:underline"
              >
                Steam Developer Console
              </a>
            </p>
          </div>

          {/* Auth Service URL */}
          <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 shadow rounded-lg p-4">
            <h3 className="text-sm font-mono font-medium text-white mb-3">Auth Service URL</h3>
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <input
                  type="text"
                  value={config?.authServiceUrl || ''}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-700 rounded text-xs font-mono bg-gray-900 text-gray-300"
                />
              </div>
              <div className="text-xs text-gray-400 font-mono">
                {config?.authServiceUrl ? '> configured' : '> not_set'}
              </div>
            </div>
            <p className="mt-2 text-xs text-gray-400 font-mono">
              Set via AUTH_SERVICE_URL environment variable. This is the URL where your auth service is deployed
            </p>
          </div>

          {/* JWT Secret */}
          <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 shadow rounded-lg p-4">
            <h3 className="text-sm font-mono font-medium text-white mb-3">JWT Secret</h3>
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <input
                  type="password"
                  value={config?.jwtSecret ? '••••••••••••••••' : ''}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-700 rounded text-xs font-mono bg-gray-900 text-gray-300"
                />
              </div>
              <div className="text-xs text-gray-400 font-mono">
                {config?.jwtSecret ? '> configured' : '> not_set'}
              </div>
            </div>
            <p className="mt-2 text-xs text-gray-400 font-mono">
              Set via JWT_SECRET environment variable. Used to sign and verify JWT tokens (32+ characters recommended)
            </p>
          </div>

          {/* System Status */}
          <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 shadow rounded-lg p-4">
            <h3 className="text-sm font-mono font-medium text-white mb-3">System Status</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="flex items-center justify-between p-3 bg-gray-950 rounded">
                <span className="text-xs font-mono text-gray-300">Redis Connection</span>
                <span className={`text-xs font-mono ${config?.redisConnected ? 'text-green-400' : 'text-red-400'}`}>
                  {config?.redisConnected ? '> connected' : '> disconnected'}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-950 rounded">
                <span className="text-xs font-mono text-gray-300">Environment</span>
                <span className="text-xs font-mono text-gray-400">
                  {config?.nodeEnv || 'Unknown'}
                </span>
              </div>
            </div>
          </div>

          {/* Environment Variables Help */}
          <div className="bg-gray-900/50 border border-gray-800 rounded p-4">
            <h3 className="text-xs font-mono font-medium text-gray-300 mb-2">Environment Variables</h3>
            <p className="text-xs text-gray-400 mb-2 font-mono">
              To update these settings, modify your environment variables and redeploy:
            </p>
            <div className="bg-gray-950 rounded p-3 text-xs font-mono text-gray-300">
              <div>STEAM_API_KEY=your_steam_api_key</div>
              <div>AUTH_SERVICE_URL=https://your-auth.vercel.app</div>
              <div>JWT_SECRET=your_32_character_secret</div>
              <div>ADMIN_PASSWORD=your_admin_password</div>
              <div>UPSTASH_REDIS_REST_URL=your_redis_url</div>
              <div>UPSTASH_REDIS_REST_TOKEN=your_redis_token</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
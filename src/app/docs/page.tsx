// src/app/docs/page.tsx
import React from "react";
import Link from "next/link";

export default function DocsPage() {
  const sections = [
    {
      title: "Quick Start",
      description: "Get up and running in 5 minutes",
      href: "/docs/quick-start",
      icon: ">"
    },
    {
      title: "Integration Guide",
      description: "Framework-specific examples",
      href: "/docs/integration",
      icon: "#"
    },
    {
      title: "API Reference",
      description: "Complete API documentation",
      href: "/docs/api",
      icon: "$"
    },
    {
      title: "Admin Dashboard",
      description: "Manage your auth service",
      href: "/admin",
      icon: "@"
    }
  ];

  const codeExamples = [
    {
      title: "React/Next.js",
      code: `import { SteamAuthProvider, useSteamAuth } from '@sams/client';

function App() {
  return (
    <SteamAuthProvider authServiceUrl="https://your-auth.vercel.app">
      <LoginButton />
    </SteamAuthProvider>
  );
}

function LoginButton() {
  const { user, login, logout } = useSteamAuth();
  
  return user ? (
    <button onClick={logout}>Logout {user.displayName}</button>
  ) : (
    <button onClick={() => login()}>Sign in with Steam</button>
  );
}`
    },
    {
      title: "Vanilla JavaScript",
      code: `import { SamsClient } from '@sams/client';

const client = new SamsClient({
  authServiceUrl: 'https://your-auth.vercel.app'
});

// Login
document.getElementById('loginBtn').onclick = () => client.login();

// Check auth status
const user = await client.getCurrentUser();
if (user) {
  console.log('Logged in as:', user.displayName);
}`
    }
  ];

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Navigation */}
      <nav className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/" className="text-sm font-mono font-bold text-white">
                SAMS
              </Link>
            </div>
            <div className="flex items-center space-x-3">
              <Link
                href="/"
                className="text-gray-400 hover:text-white px-3 py-1 rounded text-xs font-mono transition-colors"
              >
                home
              </Link>
              <Link
                href="/admin"
                className="bg-green-600 hover:bg-green-700 text-black px-3 py-1 rounded text-xs font-mono transition-colors border border-green-500"
              >
                admin
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Header */}
      <div className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-2xl md:text-3xl font-mono font-bold text-white mb-4">
            Documentation
          </h1>
          <p className="text-sm text-gray-400 mb-6 font-mono">
            Everything you need to integrate Steam authentication into your applications
          </p>
        </div>
      </div>

      {/* Documentation Sections */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {sections.map((section) => (
            <Link
              key={section.href}
              href={section.href}
              className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded p-4 hover:border-green-500 transition-all group"
            >
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-green-600 rounded flex items-center justify-center">
                  <span className="text-black text-xs font-mono">{section.icon}</span>
                </div>
                <div>
                  <h3 className="text-sm font-mono font-semibold text-white mb-1 group-hover:text-green-400 transition-colors">
                    {section.title}
                  </h3>
                  <p className="text-gray-400 text-xs font-mono">
                    {section.description}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Code Examples */}
        <div className="mb-12">
          <h2 className="text-xl font-mono font-bold text-white mb-6 text-center">
            Code Examples
          </h2>
          <div className="space-y-8">
            {codeExamples.map((example) => (
              <div key={example.title} className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded p-4">
                <h3 className="text-sm font-mono font-semibold text-white mb-3">{example.title}</h3>
                <div className="bg-gray-950 border border-gray-800 rounded p-3 overflow-x-auto">
                  <pre className="text-xs text-gray-300 font-mono">
                    <code>{example.code}</code>
                  </pre>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* API Endpoints */}
        <div className="mb-12">
          <h2 className="text-xl font-mono font-bold text-white mb-6 text-center">
            API Endpoints
          </h2>
          <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded p-4">
            <div className="space-y-4">
              <div className="border-b border-gray-800 pb-3">
                <div className="flex items-center space-x-3 mb-1">
                  <span className="bg-green-600 text-black px-2 py-1 rounded text-xs font-mono">GET</span>
                  <code className="text-blue-400 text-xs font-mono">/api/auth/steam</code>
                </div>
                <p className="text-gray-400 text-xs font-mono">Initiate Steam login flow</p>
              </div>
              
              <div className="border-b border-gray-800 pb-3">
                <div className="flex items-center space-x-3 mb-1">
                  <span className="bg-green-600 text-black px-2 py-1 rounded text-xs font-mono">GET</span>
                  <code className="text-blue-400 text-xs font-mono">/api/auth/me</code>
                </div>
                <p className="text-gray-400 text-xs font-mono">Get current user profile</p>
              </div>
              
              <div className="border-b border-gray-800 pb-3">
                <div className="flex items-center space-x-3 mb-1">
                  <span className="bg-yellow-600 text-black px-2 py-1 rounded text-xs font-mono">POST</span>
                  <code className="text-blue-400 text-xs font-mono">/api/auth/refresh</code>
                </div>
                <p className="text-gray-400 text-xs font-mono">Refresh authentication tokens</p>
              </div>
              
              <div className="border-b border-gray-800 pb-3">
                <div className="flex items-center space-x-3 mb-1">
                  <span className="bg-yellow-600 text-black px-2 py-1 rounded text-xs font-mono">POST</span>
                  <code className="text-blue-400 text-xs font-mono">/api/auth/logout</code>
                </div>
                <p className="text-gray-400 text-xs font-mono">Logout current session</p>
              </div>
              
              <div>
                <div className="flex items-center space-x-3 mb-1">
                  <span className="bg-yellow-600 text-black px-2 py-1 rounded text-xs font-mono">POST</span>
                  <code className="text-blue-400 text-xs font-mono">/api/auth/verify</code>
                </div>
                <p className="text-gray-400 text-xs font-mono">Verify an access token</p>
              </div>
            </div>
          </div>
        </div>

        {/* Getting Started */}
        <div className="bg-gray-900/50 rounded p-6 text-center">
          <h2 className="text-lg font-mono font-bold text-white mb-3">
            Ready to Get Started?
          </h2>
          <p className="text-gray-300 mb-4 text-sm font-mono">
            Deploy your own Steam authentication service and start building amazing apps.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/login"
              className="bg-green-600 text-black px-4 py-2 rounded text-sm font-mono font-semibold hover:bg-green-700 transition-colors border border-green-500"
            >
              &gt; try_demo
            </Link>
            <Link
              href="/admin"
              className="border border-gray-400 text-white px-4 py-2 rounded text-sm font-mono font-semibold hover:bg-gray-600 transition-colors"
            >
              &gt; admin
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

// src/app/page.tsx
import React from "react";
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-950">
      {/* Navigation */}
      <nav className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-sm font-mono font-bold text-white">SAMS</h1>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Link
                href="/docs"
                className="text-gray-400 hover:text-white px-3 py-1 rounded text-xs font-mono transition-colors"
              >
                docs
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

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <div className="text-center">
            <h1 className="text-3xl md:text-4xl font-mono font-bold text-white mb-4">
              Steam Auth
              <span className="block bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
                Microservice
              </span>
            </h1>
            <p className="text-sm text-gray-400 mb-6 max-w-2xl mx-auto font-mono">
              One Steam API key. Multiple apps. Simple authentication.
              Deploy your own Steam authentication service and use it across all your web applications.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/login"
                className="bg-green-600 hover:bg-green-700 text-black px-6 py-2 rounded text-sm font-mono font-semibold transition-all border border-green-500"
              >
                &gt; try_demo
              </Link>
              <Link
                href="/docs"
                className="border border-gray-600 hover:border-gray-500 text-white px-6 py-2 rounded text-sm font-mono font-semibold transition-all hover:bg-gray-800"
              >
                &gt; get_started
              </Link>
            </div>
          </div>
        </div>

        {/* Background Effects */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/4 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
          <div className="absolute top-0 right-1/4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-1/3 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-4000"></div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 bg-gray-900/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-xl font-mono font-bold text-white mb-2">Why Choose SAMS?</h2>
            <p className="text-gray-400 text-sm font-mono">Everything you need for Steam authentication</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded p-4 hover:border-green-500 transition-all">
              <div className="w-8 h-8 bg-green-600 rounded flex items-center justify-center mb-3">
                <span className="text-sm font-mono text-black">&gt;</span>
              </div>
              <h3 className="text-sm font-mono font-semibold text-white mb-2">One Deployment</h3>
              <p className="text-gray-400 text-xs font-mono">
                Deploy once, use everywhere. One Steam API key for all your applications.
              </p>
            </div>

            <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded p-4 hover:border-blue-500 transition-all">
              <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center mb-3">
                <span className="text-sm font-mono text-white">#</span>
              </div>
              <h3 className="text-sm font-mono font-semibold text-white mb-2">Secure by Default</h3>
              <p className="text-gray-400 text-xs font-mono">
                HttpOnly cookies, rotating tokens, and industry-standard security practices.
              </p>
            </div>

            <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded p-4 hover:border-yellow-500 transition-all">
              <div className="w-8 h-8 bg-yellow-600 rounded flex items-center justify-center mb-3">
                <span className="text-sm font-mono text-black">$</span>
              </div>
              <h3 className="text-sm font-mono font-semibold text-white mb-2">Easy Integration</h3>
              <p className="text-gray-400 text-xs font-mono">
                Works with React, Vue, Svelte, and vanilla JavaScript. TypeScript support included.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Start Section */}
      <div className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-xl font-mono font-bold text-white mb-2">Get Started in Minutes</h2>
            <p className="text-gray-400 text-sm font-mono">Three simple steps to Steam authentication</p>
          </div>

      <div className="space-y-6">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-6 h-6 bg-green-600 rounded flex items-center justify-center text-black font-mono text-xs">
                1
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-mono font-semibold text-white mb-1">Deploy Your Service</h3>
                <p className="text-gray-400 mb-3 text-xs font-mono">Deploy SAMS to Vercel with your Steam API key</p>
                <div className="bg-gray-950 border border-gray-800 rounded p-3">
                  <code className="text-green-400 text-xs font-mono">
                    npm run setup && npm run deploy
                  </code>
                </div>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-6 h-6 bg-blue-600 rounded flex items-center justify-center text-white font-mono text-xs">
                2
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-mono font-semibold text-white mb-1">Install SDK</h3>
                <p className="text-gray-400 mb-3 text-xs font-mono">Add the client SDK to your application</p>
                <div className="bg-gray-950 border border-gray-800 rounded p-3">
                  <code className="text-green-400 text-xs font-mono">
                    npm install @sams/client
                  </code>
                </div>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-6 h-6 bg-yellow-600 rounded flex items-center justify-center text-black font-mono text-xs">
                3
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-mono font-semibold text-white mb-1">Add to Your App</h3>
                <p className="text-gray-400 mb-3 text-xs font-mono">Wrap your app and use the authentication hook</p>
                <div className="bg-gray-950 border border-gray-800 rounded p-3">
                  <code className="text-blue-400 text-xs font-mono">
                    {`const { user, login, logout } = useSteamAuth();`}
                  </code>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-16 bg-gray-900/50">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl font-mono font-bold text-white mb-3">
            Ready to Get Started?
          </h2>
          <p className="text-gray-300 text-sm mb-6 font-mono">
            Join developers who are already using SAMS for their Steam authentication needs.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/docs"
              className="bg-green-600 text-black px-6 py-2 rounded text-sm font-mono font-semibold hover:bg-green-700 transition-colors border border-green-500"
            >
              &gt; view_docs
            </Link>
            <Link
              href="/login"
              className="border border-gray-400 text-white px-6 py-2 rounded text-sm font-mono font-semibold hover:bg-gray-600 transition-colors"
            >
              &gt; try_demo
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-950 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-between items-center">
            <div className="text-gray-500 text-xs font-mono">
              © 2024 SAMS - Steam Auth Microservice
            </div>
            <div className="flex space-x-4">
              <a href="https://github.com/yourusername/sams" className="text-gray-500 hover:text-white transition-colors text-xs font-mono">
                github
              </a>
              <Link href="/docs" className="text-gray-500 hover:text-white transition-colors text-xs font-mono">
                docs
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function AdminNavbar() {
  const pathname = usePathname();

  const navItems = [
    { href: '/admin/dashboard', label: 'dashboard', icon: '#' },
    { href: '/admin/sites', label: 'sites', icon: '>' },
    { href: '/admin/config', label: 'config', icon: '$' },
  ];

  return (
    <nav className="bg-gray-900/50 border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-12">
          <div className="flex items-center space-x-6">
            <Link href="/admin/dashboard" className="text-sm font-mono font-bold text-white">
              SAMS Admin
            </Link>
            <div className="flex items-center space-x-4">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`text-xs font-mono transition-colors ${
                    pathname === item.href
                      ? 'text-green-400'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <span className="mr-1">{item.icon}</span>
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Link
              href="/"
              className="text-xs font-mono text-gray-400 hover:text-white transition-colors"
            >
              &gt; home
            </Link>
            <Link
              href="/admin/logout"
              className="bg-red-600 text-white px-3 py-1 rounded text-xs font-mono hover:bg-red-700 transition-colors"
            >
              &gt; logout
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}

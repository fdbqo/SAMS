'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Spinner from '@/components/Spinner';

export default function AdminLogout() {
  const router = useRouter();

  useEffect(() => {
    // Clear admin session
    fetch('/api/admin/logout', {
      method: 'POST',
      credentials: 'include',
    }).then(() => {
      router.push('/admin');
    });
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950">
      <div className="flex items-center space-x-3">
        <Spinner size="md" />
        <span className="text-sm text-white font-mono">Logging out...</span>
      </div>
    </div>
  );
}

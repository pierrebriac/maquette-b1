'use client';

import { useEffect, useState } from 'react';
import { initializeStore } from '@/lib/store';

export function StoreInitializer({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    initializeStore();
    setReady(true);
  }, []);

  if (!ready) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return <>{children}</>;
}

'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { registerNavigate, useStore } from '@/app/store/useStore';

export function NavigationProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const checkSession = useStore(s => s.checkSession);
  useEffect(() => {
    registerNavigate((path) => router.push(path));
    checkSession();
  }, [router]);
  return <>{children}</>;
}

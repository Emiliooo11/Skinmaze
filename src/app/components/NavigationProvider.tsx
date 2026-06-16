'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { registerNavigate } from '@/app/store/useStore';

export function NavigationProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  useEffect(() => {
    registerNavigate((path) => router.push(path));
  }, [router]);
  return <>{children}</>;
}

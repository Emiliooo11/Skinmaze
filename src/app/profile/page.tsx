'use client';
import { MainLayout } from '@/app/components/MainLayout';
import { ProfilePage } from '@/app/components/pages/ProfilePage';

export default function Profile() {
  return (
    <MainLayout>
      <ProfilePage />
    </MainLayout>
  );
}

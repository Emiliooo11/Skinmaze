'use client';
import { MainLayout } from './components/MainLayout';
import { HomePage } from './components/pages/HomePage';

export default function Page() {
  return (
    <MainLayout>
      <HomePage />
    </MainLayout>
  );
}

'use client';
import { use, useEffect } from 'react';
import { MainLayout } from '@/app/components/MainLayout';
import { CaseDetailPage } from '@/app/components/pages/CaseDetailPage';
import { useStore } from '@/app/store/useStore';
import { fetchCases } from '@/app/lib/db';

export default function LangCaseDetail({ params }: { params: Promise<{ lang: string; id: string }> }) {
  const { id } = use(params);
  const { currentCase, loadCase } = useStore();

  useEffect(() => {
    if (!currentCase || currentCase.id !== id) {
      fetchCases().then(rows => {
        const found = rows.find(r => r.id === id);
        if (found) {
          loadCase({
            id: found.id,
            name: found.name,
            price: found.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
            image: found.image_url || '/cases/case-water-camo.png',
          });
        }
      });
    }
  }, [id]);

  return <MainLayout><CaseDetailPage /></MainLayout>;
}

'use client';
import { TopBar } from './components/TopBar';
import { Ticker } from './components/Ticker';
import { Footer } from './components/Footer';
import { Toast } from './components/Toast';
import { HomePage } from './components/pages/HomePage';
import { CasesPage } from './components/pages/CasesPage';
import { MarketplacePage } from './components/pages/MarketplacePage';
import { CaseDetailPage } from './components/pages/CaseDetailPage';
import { ProfilePage } from './components/pages/ProfilePage';
import { WalletPage } from './components/pages/WalletPage';
import { MarketItemModal } from './components/modals/MarketItemModal';
import { FairnessModal } from './components/modals/FairnessModal';
import { useStore } from './store/useStore';

export default function Page() {
  const route = useStore(s => s.route);

  return (
    <div style={{ fontFamily: 'var(--font-outfit),sans-serif', background: '#080a08', color: '#e8ece8', minHeight: '100vh', overflowX: 'hidden' }}>
      <TopBar />
      <Ticker />

      <main style={{ maxWidth: 1320, margin: '0 auto', padding: '6px 24px 60px' }}>
        {route === 'home' && <HomePage />}
        {route === 'cases' && <CasesPage />}
        {route === 'market' && <MarketplacePage />}
        {route === 'casedetail' && <CaseDetailPage />}
        {route === 'profile' && <ProfilePage />}
        {route === 'wallet' && <WalletPage />}
      </main>

      <Footer />
      <MarketItemModal />
      <FairnessModal />
      <Toast />
    </div>
  );
}

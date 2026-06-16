'use client';
import { TopBar } from './TopBar';
import { Ticker } from './Ticker';
import { Footer } from './Footer';
import { Toast } from './Toast';
import { MarketItemModal } from './modals/MarketItemModal';
import { FairnessModal } from './modals/FairnessModal';
import { LoginModal } from './modals/LoginModal';
import { NavigationProvider } from './NavigationProvider';

export function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <NavigationProvider>
      <div style={{ fontFamily: 'var(--font-outfit),sans-serif', background: '#080a08', color: '#e8ece8', minHeight: '100vh', overflowX: 'hidden' }}>
        <TopBar />
        <Ticker />
        <main style={{ maxWidth: 1320, margin: '0 auto', padding: '6px 24px 60px' }}>
          {children}
        </main>
        <Footer />
        <MarketItemModal />
        <FairnessModal />
        <LoginModal />
        <Toast />
      </div>
    </NavigationProvider>
  );
}

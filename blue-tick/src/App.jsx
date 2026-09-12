import React, { useEffect } from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import Header from './components/Header';
import BottomNav from './components/BottomNav';
import Footer from './components/Footer';

// Pages
import Home from './pages/Home';
import Plans from './pages/Plans';
import Checkout from './pages/Checkout';
import Payment from './pages/Payment';
import PaymentSuccess from './pages/PaymentSuccess';
import PaymentFailed from './pages/PaymentFailed';
import FAQ from './pages/FAQ';
import Support from './pages/Support';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';
import RefundPolicy from './pages/RefundPolicy';
import Admin from './pages/Admin';
import Portfolio from './pages/Portfolio';
import CustomScriptView from './pages/CustomScriptView';
import { SettingsProvider, useSettings } from './context/SettingsContext';

// Scroll to top helper on route change
const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

// Main router logic based on settings and route
const MainContent = () => {
  const location = useLocation();
  const { settings } = useSettings();
  const isAdmin = location.pathname.startsWith('/admin');

  // 1. Admin Console: Always dedicated full-screen console
  if (isAdmin) {
    return (
      <>
        <ScrollToTop />
        <Admin />
      </>
    );
  }

  // 2. Portfolio Theme: Legend Web Developer
  if (settings.themeMode === 'portfolio') {
    return (
      <>
        <ScrollToTop />
        <Portfolio />
      </>
    );
  }

  // 3. Custom HTML / Web Script Mode
  if (settings.themeMode === 'custom') {
    return (
      <>
        <ScrollToTop />
        <CustomScriptView html={settings.customHtml} />
      </>
    );
  }

  // 4. Default: Instagram Verification Badge Theme (Mobile Frame)
  return (
    <div className="min-h-screen relative flex justify-center items-start selection:bg-[#0064E0] selection:text-white">
      {/* GPU Accelerated Fixed Background Layer */}
      <div className="fixed inset-0 pointer-events-none -z-10 meta-mesh-bg" aria-hidden="true" />

      {/* 420px Mobile Container */}
      <div className="w-full max-w-[420px] min-h-screen flex flex-col bg-transparent text-[#1c1e21] relative overflow-x-hidden border-x border-black/[0.06]">
        <ScrollToTop />

        {/* Mobile Top Header */}
        <Header />

        {/* Content Area */}
        <main className="flex-1 pb-16">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/plans" element={<Plans />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/payment" element={<Payment />} />
            <Route path="/payment-success" element={<PaymentSuccess />} />
            <Route path="/payment-failed" element={<PaymentFailed />} />
            <Route path="/orders" element={<Navigate to="/" replace />} />
            <Route path="/order" element={<Navigate to="/" replace />} />
            <Route path="/order/:id" element={<Navigate to="/" replace />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/support" element={<Support />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/refund-policy" element={<RefundPolicy />} />
            {/* Catch-all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        {/* Mobile Fixed Bottom Navigation */}
        <BottomNav />

        {/* Mobile Footer */}
        <Footer />
      </div>
    </div>
  );
};

export const App = () => {
  return (
    <SettingsProvider>
      <MainContent />
    </SettingsProvider>
  );
};

export default App;

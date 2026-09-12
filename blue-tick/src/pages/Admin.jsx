import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import QRCode from 'qrcode';
import {
  LayoutDashboard,
  CreditCard,
  QrCode,
  Server,
  Shield,
  Key,
  LogOut,
  ExternalLink,
  Save,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Copy,
  Check,
  RefreshCw,
  Sparkles,
  DollarSign,
  Activity,
  ArrowRight,
  Menu,
  X,
  Smartphone,
  ChevronRight,
  Lock,
  Palette,
  Code,
  FileCode,
  Globe,
  Terminal,
} from 'lucide-react';
import { useSettings } from '../context/SettingsContext';
import { API_BASE_URL } from '../config/api';

export const Admin = () => {
  const { settings, isOnline, saveSettings, resetDefaults } = useSettings();

  // ── Authentication ──
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return sessionStorage.getItem('admin_auth_token') === 'true';
  });
  const [passwordInput, setPasswordInput] = useState('');
  const [authError, setAuthError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // ── Navigation Tabs ──
  const [activeTab, setActiveTab] = useState('overview'); // overview, pricing, qr, api, security
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // ── Form State ──
  const [amount, setAmount] = useState(settings.amount || 30);
  const [upiId, setUpiId] = useState(settings.upiId || 'paytm.s1x87m2@pty');
  const [payeeName, setPayeeName] = useState(settings.payeeName || 'Verified Badge');
  const [transactionNote, setTransactionNote] = useState(settings.transactionNote || 'Verified Badge');
  const [themeMode, setThemeMode] = useState(settings.themeMode || 'verification');
  const [customHtml, setCustomHtml] = useState(settings.customHtml || '');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // ── Feedback & Operations ──
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null); // { type: 'success' | 'error', text: '' }
  const [copied, setCopied] = useState(false);
  const [pingStatus, setPingStatus] = useState(null);
  const [pinging, setPinging] = useState(false);

  // ── QR Canvas ──
  const canvasRef = useRef(null);

  // Sync state from context when ready
  useEffect(() => {
    setAmount(settings.amount);
    setUpiId(settings.upiId);
    setPayeeName(settings.payeeName);
    setTransactionNote(settings.transactionNote);
    if (settings.themeMode) setThemeMode(settings.themeMode);
    if (settings.customHtml !== undefined) setCustomHtml(settings.customHtml);
  }, [settings]);

  // Construct NPCI UPI Intent URI
  const upiIntentUri = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(
    payeeName
  )}&am=${encodeURIComponent(Number(amount).toFixed(2))}&cu=INR&tn=${encodeURIComponent(transactionNote)}`;

  // Draw QR code onto canvas
  useEffect(() => {
    if (!canvasRef.current || !isAuthenticated) return;
    try {
      QRCode.toCanvas(
        canvasRef.current,
        upiIntentUri,
        {
          width: 240,
          margin: 1,
          color: {
            dark: '#090D16',
            light: '#FFFFFF',
          },
        },
        (error) => {
          if (error) console.error('QR rendering error:', error);
        }
      );
    } catch (err) {
      console.error('Canvas QR error:', err);
    }
  }, [upiIntentUri, isAuthenticated, activeTab]);

  const showToast = (text, type = 'success') => {
    setToast({ text, type });
    setTimeout(() => setToast(null), 4000);
  };

  // ── Login Handler ──
  const handleLogin = (e) => {
    e.preventDefault();
    setAuthError('');
    const entered = passwordInput.trim();
    if (!entered) {
      setAuthError('Please enter your admin password.');
      return;
    }

    const storedPwd = sessionStorage.getItem('admin_pwd') || 'xd';

    // If API_BASE_URL is not configured, authenticate directly against default/stored password
    if (!API_BASE_URL) {
      if (entered === storedPwd || entered === 'xd') {
        sessionStorage.setItem('admin_auth_token', 'true');
        sessionStorage.setItem('admin_pwd', entered);
        setIsAuthenticated(true);
        showToast('Welcome to Admin Dashboard!');
      } else {
        setAuthError('Incorrect admin password. (Default is "xd")');
      }
      return;
    }

    // Verify against the backend API
    fetch(`${API_BASE_URL}/api/admin/settings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        adminPassword: entered,
        amount: Number(settings.amount),
        upiId: settings.upiId,
        payeeName: settings.payeeName,
        transactionNote: settings.transactionNote,
      }),
    })
      .then(async (res) => {
        if (res.ok) {
          sessionStorage.setItem('admin_auth_token', 'true');
          sessionStorage.setItem('admin_pwd', entered);
          setIsAuthenticated(true);
          showToast('Welcome back to Admin Dashboard!');
        } else if (res.status === 401) {
          setAuthError('Incorrect admin password. Access denied.');
        } else {
          // If backend returns 404 or other status, fallback to stored/default password 'xd'
          if (entered === storedPwd || entered === 'xd') {
            sessionStorage.setItem('admin_auth_token', 'true');
            sessionStorage.setItem('admin_pwd', entered);
            setIsAuthenticated(true);
            showToast('Welcome back to Admin Dashboard!');
          } else {
            setAuthError('Incorrect admin password. (Default is "xd")');
          }
        }
      })
      .catch(() => {
        // Fallback for offline mode if backend is not reachable
        if (entered === storedPwd || entered === 'xd') {
          sessionStorage.setItem('admin_auth_token', 'true');
          sessionStorage.setItem('admin_pwd', entered);
          setIsAuthenticated(true);
          showToast('Welcome back (Offline Mode)');
        } else {
          setAuthError('Incorrect admin password or server unreachable.');
        }
      });
  };

  const handleLogout = () => {
    sessionStorage.removeItem('admin_auth_token');
    setIsAuthenticated(false);
    setPasswordInput('');
  };

  // ── Save Settings ──
  const handleSaveAll = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setSaving(true);

    if (newPassword && newPassword !== confirmPassword) {
      showToast('New passwords do not match!', 'error');
      setSaving(false);
      return;
    }

    const currentPwd = sessionStorage.getItem('admin_pwd') || 'xd';

    try {
      const res = await saveSettings(
        {
          amount: Number(amount),
          upiId: upiId.trim(),
          payeeName: payeeName.trim(),
          transactionNote: transactionNote.trim(),
          themeMode: themeMode,
          customHtml: customHtml,
          newAdminPassword: newPassword ? newPassword.trim() : undefined,
        },
        currentPwd
      );

      if (newPassword) {
        sessionStorage.setItem('admin_pwd', newPassword.trim());
        setNewPassword('');
        setConfirmPassword('');
      }

      showToast(
        res.serverOk
          ? 'Settings saved & synced to backend server!'
          : `Saved locally in browser (${res.serverMessage})`
      );
    } catch (err) {
      showToast(`Error saving settings: ${err.message}`, 'error');
    } finally {
      setSaving(false);
    }
  };

  // ── Reset Defaults ──
  const handleReset = () => {
    if (window.confirm('Reset all pricing and UPI settings to defaults (₹30, paytm.s1x87m2@pty)?')) {
      resetDefaults();
      setAmount(30);
      setUpiId('paytm.s1x87m2@pty');
      setPayeeName('Verified Badge');
      setTransactionNote('Verified Badge');
      showToast('Settings restored to factory defaults (₹30)');
    }
  };

  // ── Copy Link ──
  const handleCopyLink = () => {
    navigator.clipboard.writeText(upiIntentUri);
    setCopied(true);
    showToast('UPI Intent Link copied to clipboard!');
    setTimeout(() => setCopied(false), 2500);
  };

  // ── Ping API ──
  const handlePing = async () => {
    setPinging(true);
    const start = Date.now();
    try {
      const res = await fetch(`${API_BASE_URL}/api/public-settings`);
      const latency = Date.now() - start;
      if (res.ok) {
        setPingStatus({ ok: true, latency, text: `Connected (200 OK) in ${latency}ms` });
      } else {
        setPingStatus({ ok: false, latency, text: `Server returned HTTP ${res.status}` });
      }
    } catch (err) {
      setPingStatus({ ok: false, text: `Connection failed: ${err.message}` });
    } finally {
      setPinging(false);
    }
  };

  // ═══════════════════════════════════════════════════════════════════════
  // 1. DEDICATED LOGIN SCREEN (STANDALONE FULLSCREEN)
  // ═══════════════════════════════════════════════════════════════════════
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen w-full bg-[#0B0F19] text-white flex flex-col justify-center items-center p-4 relative selection:bg-[#0064E0]">
        {/* Subtle glow background */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />

        <div className="w-full max-w-md bg-[#131B2E] border border-gray-800 rounded-3xl p-8 shadow-2xl relative z-10">
          {/* Logo badge */}
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-tr from-[#0064E0] to-[#0095F6] rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30">
              <Shield className="w-8 h-8 text-white" />
            </div>
          </div>

          <div className="text-center mb-8">
            <h1 className="text-2xl font-black tracking-tight text-white">Admin Dashboard</h1>
            <p className="text-xs text-gray-400 mt-1.5">
              Secure console for pricing, UPI payments, and API management
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                Admin Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="Enter Admin Password"
                  className="w-full px-4 py-3.5 bg-[#090D16] border border-gray-700 rounded-xl text-sm text-white placeholder-gray-500 focus:border-[#0064E0] focus:ring-2 focus:ring-[#0064E0]/30 outline-none transition-all"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {authError && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3.5 bg-gradient-to-r from-[#0064E0] to-[#0095F6] hover:brightness-110 active:scale-[0.99] text-white font-bold text-sm rounded-xl shadow-lg shadow-blue-500/25 transition-all cursor-pointer flex items-center justify-center gap-2 mt-2"
            >
              <Lock className="w-4 h-4" />
              <span>Unlock Console</span>
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-800/80 flex items-center justify-between text-xs text-gray-500">
            <span className="flex items-center gap-1.5 text-gray-400">
              <Shield className="w-3.5 h-3.5 text-[#0064E0]" />
              <span>Encrypted Session</span>
            </span>
            <Link to="/" className="text-gray-400 hover:text-white flex items-center gap-1 transition-colors">
              <span>Back to Site</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════
  // 2. FULL-SCREEN DEDICATED ADMIN DASHBOARD UI
  // ═══════════════════════════════════════════════════════════════════════
  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'theme', label: 'Theme & Scripts', icon: Palette },
    { id: 'pricing', label: 'Pricing & UPI', icon: CreditCard },
    { id: 'qr', label: 'Live QR Tester', icon: QrCode },
    { id: 'api', label: 'Backend & API', icon: Server },
    { id: 'security', label: 'Security', icon: Key },
  ];

  return (
    <div className="min-h-screen w-full bg-[#0B0F19] text-gray-100 flex flex-col md:flex-row selection:bg-[#0064E0]">
      {/* ── TOAST NOTIFICATION ── */}
      {toast && (
        <div className="fixed top-5 right-5 z-50 animate-in fade-in slide-in-from-top-3">
          <div
            className={`px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 text-xs font-semibold border ${
              toast.type === 'error'
                ? 'bg-red-950/90 border-red-500 text-red-200'
                : 'bg-emerald-950/90 border-emerald-500 text-emerald-200'
            }`}
          >
            {toast.type === 'error' ? (
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            )}
            <span>{toast.text}</span>
          </div>
        </div>
      )}

      {/* ── MOBILE HEADER BAR ── */}
      <header className="md:hidden bg-[#131B2E] border-b border-gray-800 p-4 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-gradient-to-tr from-[#0064E0] to-[#0095F6] rounded-xl flex items-center justify-center">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="font-bold text-sm text-white">Admin Console</span>
            <div className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-400' : 'bg-amber-400'}`} />
              <span className="text-[10px] text-gray-400">{isOnline ? 'Online' : 'Local'}</span>
            </div>
          </div>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </header>

      {/* ── SIDEBAR NAVIGATION (DESKTOP & MOBILE DRAWER) ── */}
      <aside
        className={`${
          mobileMenuOpen ? 'block' : 'hidden'
        } md:flex flex-col w-full md:w-64 bg-[#131B2E] border-r border-gray-800 shrink-0 p-5 z-20 sticky top-0 md:h-screen`}
      >
        {/* Brand */}
        <div className="hidden md:flex items-center gap-3 mb-8 px-2">
          <div className="w-10 h-10 bg-gradient-to-tr from-[#0064E0] to-[#0095F6] rounded-xl flex items-center justify-center shadow-md shadow-blue-500/20">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-black text-sm text-white tracking-wide">ADMIN CONSOLE</h1>
            <span className="text-[10px] uppercase font-bold text-blue-400 tracking-wider">
              Control Center
            </span>
          </div>
        </div>

        {/* Menu Items */}
        <nav className="space-y-1.5 flex-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  active
                    ? 'bg-[#0064E0] text-white shadow-md shadow-blue-600/30'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/60'
                }`}
              >
                <Icon className={`w-4 h-4 ${active ? 'text-white' : 'text-gray-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* System Health Widget */}
        <div className="p-3.5 bg-[#090D16] rounded-2xl border border-gray-800 my-4 text-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-medium text-gray-400">Backend Server</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                isOnline ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
              }`}
            >
              {isOnline ? 'CONNECTED' : 'STANDALONE'}
            </span>
          </div>
          <div className="text-[11px] text-gray-300 font-mono truncate">
            {API_BASE_URL || 'localhost:8000'}
          </div>
        </div>

        {/* Sidebar Footer */}
        <div className="pt-4 border-t border-gray-800/80 space-y-2">
          <Link
            to="/"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-gray-400 hover:text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            <span className="flex items-center gap-2">
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Public Website</span>
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-gray-600" />
          </Link>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* ── MAIN DASHBOARD VIEWPORT ── */}
      <main className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 max-w-6xl">
        {/* Top Action Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#131B2E] p-4 md:p-6 rounded-3xl border border-gray-800 shadow-xl">
          <div>
            <div className="flex items-center gap-2 text-xs text-blue-400 font-bold uppercase tracking-wider mb-1">
              <span>Admin Center</span>
              <span>/</span>
              <span className="text-white capitalize">{activeTab}</span>
            </div>
            <h2 className="text-xl md:text-2xl font-black text-white tracking-tight">
              {activeTab === 'overview' && 'System Overview & Telemetry'}
              {activeTab === 'theme' && 'Website Theme & Script Engine'}
              {activeTab === 'pricing' && 'Pricing & UPI Configuration'}
              {activeTab === 'qr' && 'Live QR Terminal & Mobile Intent'}
              {activeTab === 'api' && 'Backend API & Infrastructure'}
              {activeTab === 'security' && 'Security & Password Settings'}
            </h2>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handleSaveAll}
              disabled={saving}
              className="px-4 py-2.5 bg-gradient-to-r from-[#0064E0] to-[#0095F6] hover:brightness-110 active:scale-[0.98] text-white text-xs font-bold rounded-xl shadow-lg shadow-blue-500/25 flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{saving ? 'Saving...' : 'Save All Changes'}</span>
            </button>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════
            TAB 1: OVERVIEW
           ═══════════════════════════════════════════════════════════════ */}
        {activeTab === 'overview' && (
          <div className="space-y-6 animate-in fade-in">
            {/* 4 Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Card 1: Price */}
              <div className="bg-[#131B2E] p-5 rounded-2xl border border-gray-800 relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-gray-400">Subscription Price</span>
                  <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
                    <DollarSign className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-3">
                  <div className="text-2xl font-black text-white">₹{amount}</div>
                  <span className="text-[10px] text-emerald-400 font-semibold">
                    Live across all checkout pages
                  </span>
                </div>
              </div>

              {/* Card 2: UPI ID */}
              <div className="bg-[#131B2E] p-5 rounded-2xl border border-gray-800 relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-gray-400">Settlement UPI</span>
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                    <CreditCard className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-3">
                  <div className="text-sm font-mono font-bold text-white truncate">{upiId}</div>
                  <span className="text-[10px] text-gray-400">Direct NPCI Settlement</span>
                </div>
              </div>

              {/* Card 3: Payee Name */}
              <div className="bg-[#131B2E] p-5 rounded-2xl border border-gray-800 relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-gray-400">Merchant Name</span>
                  <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center">
                    <Shield className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-3">
                  <div className="text-base font-bold text-white truncate">{payeeName}</div>
                  <span className="text-[10px] text-gray-400">{transactionNote}</span>
                </div>
              </div>

              {/* Card 4: Backend Status */}
              <div className="bg-[#131B2E] p-5 rounded-2xl border border-gray-800 relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-gray-400">Gateway Engine</span>
                  <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
                    <Activity className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-3">
                  <div className="text-base font-bold text-white">40x Parallel</div>
                  <span className="text-[10px] text-blue-400 font-semibold">Shared FastAPI Backend</span>
                </div>
              </div>
            </div>

            {/* Active Theme Bar */}
            <div className="bg-[#131B2E] p-4 rounded-2xl border border-gray-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center text-white">
                  <Palette className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs text-gray-400 font-semibold">Active Website Theme</div>
                  <div className="text-sm font-bold text-white flex items-center gap-2">
                    <span>
                      {themeMode === 'portfolio'
                        ? 'Legend — Web Developer Portfolio'
                        : themeMode === 'custom'
                        ? 'Custom Web Script / HTML Mode'
                        : 'Instagram Verification Badge (Default)'}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-blue-500/20 text-blue-400 uppercase">
                      {themeMode}
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setActiveTab('theme')}
                className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-xs font-semibold text-gray-200 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer self-start sm:self-auto"
              >
                <span>Switch Theme</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Quick Actions & Live Simulator Preview */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column: Quick Config */}
              <div className="lg:col-span-2 bg-[#131B2E] p-6 rounded-3xl border border-gray-800 space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-gray-800">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-[#0064E0]" />
                    <span>Quick Parameter Control</span>
                  </h3>
                  <button
                    onClick={() => setActiveTab('pricing')}
                    className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 font-semibold"
                  >
                    <span>Full Editor</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-300 mb-1">
                      Quick Price Update (₹ INR)
                    </label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 font-bold text-sm">
                          ₹
                        </span>
                        <input
                          type="number"
                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                          className="w-full pl-8 pr-4 py-2.5 bg-[#090D16] border border-gray-700 rounded-xl text-sm font-bold text-white focus:border-[#0064E0] outline-none"
                        />
                      </div>
                      {[30, 49, 99].map((val) => (
                        <button
                          key={val}
                          type="button"
                          onClick={() => setAmount(val)}
                          className={`px-3 py-2 text-xs font-bold rounded-xl border transition-colors cursor-pointer ${
                            Number(amount) === val
                              ? 'bg-blue-600 border-blue-500 text-white'
                              : 'bg-gray-800/80 border-gray-700 text-gray-300 hover:bg-gray-700'
                          }`}
                        >
                          ₹{val}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-300 mb-1">
                      Recipient UPI ID (VPA)
                    </label>
                    <input
                      type="text"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      className="w-full px-4 py-2.5 bg-[#090D16] border border-gray-700 rounded-xl text-sm font-mono text-white focus:border-[#0064E0] outline-none"
                    />
                  </div>

                  <div className="pt-2 flex gap-3">
                    <button
                      onClick={handleSaveAll}
                      disabled={saving}
                      className="px-5 py-2.5 bg-[#0064E0] hover:bg-[#0051B8] text-white text-xs font-bold rounded-xl flex items-center gap-2 cursor-pointer transition-colors"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>{saving ? 'Saving...' : 'Apply & Save'}</span>
                    </button>
                    <button
                      onClick={handleReset}
                      className="px-4 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Reset to ₹30</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Column: Mini QR Preview */}
              <div className="bg-[#131B2E] p-6 rounded-3xl border border-gray-800 flex flex-col items-center justify-center text-center space-y-3">
                <div className="text-xs font-bold text-white flex items-center gap-1.5">
                  <QrCode className="w-4 h-4 text-emerald-400" />
                  <span>Real-Time Customer QR</span>
                </div>
                <div className="p-3 bg-white rounded-2xl shadow-xl">
                  <canvas ref={canvasRef} className="rounded-lg" />
                </div>
                <div className="text-xs text-gray-300 font-bold">
                  ₹{Number(amount).toFixed(2)} to{' '}
                  <span className="text-blue-400 font-mono">{upiId}</span>
                </div>
                <button
                  onClick={() => setActiveTab('qr')}
                  className="text-xs text-blue-400 hover:underline flex items-center gap-1"
                >
                  <span>Open Full Tester</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════
            TAB: WEBSITE THEME & SCRIPT ENGINE
           ═══════════════════════════════════════════════════════════════ */}
        {activeTab === 'theme' && (
          <div className="space-y-6 animate-in fade-in">
            {/* Header Description */}
            <div className="bg-[#131B2E] p-6 md:p-8 rounded-3xl border border-gray-800 shadow-xl space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-800">
                <div>
                  <h3 className="text-base font-bold text-white mb-1">
                    Website Theme & Custom Script Switcher
                  </h3>
                  <p className="text-xs text-gray-400">
                    Dynamically switch the entire public website theme or serve your own raw HTML script. No redeployment needed!
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-gray-400">Active Mode:</span>
                  <span className="px-3 py-1 bg-blue-500/15 border border-blue-500/30 text-blue-400 text-xs font-mono font-bold rounded-xl uppercase">
                    {themeMode}
                  </span>
                </div>
              </div>

              {/* 3 Theme Choice Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {/* Theme 1: Verification Badge */}
                <div
                  onClick={() => setThemeMode('verification')}
                  className={`p-5 rounded-2xl border-2 transition-all cursor-pointer relative flex flex-col justify-between ${
                    themeMode === 'verification'
                      ? 'bg-blue-600/10 border-[#0064E0] shadow-lg shadow-blue-500/10'
                      : 'bg-[#090D16] border-gray-800 hover:border-gray-700'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
                        <Smartphone className="w-5 h-5" />
                      </div>
                      {themeMode === 'verification' && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#0064E0] text-white">
                          ACTIVE
                        </span>
                      )}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">Instagram Verification</h4>
                      <span className="text-[10px] text-blue-400 font-mono font-semibold">
                        Multi-Page Flow
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 leading-relaxed">
                      Original interactive app with username lookup, blue tick preview, ₹{amount} plan pricing, and live UPI checkout.
                    </p>
                  </div>

                  <div className="pt-4 mt-2 border-t border-gray-800/80 flex items-center justify-between text-xs">
                    <span className="text-gray-500">Mobile Container</span>
                    <span className="text-white font-semibold">₹{amount} / checkout</span>
                  </div>
                </div>

                {/* Theme 2: Legend Developer Portfolio */}
                <div
                  onClick={() => setThemeMode('portfolio')}
                  className={`p-5 rounded-2xl border-2 transition-all cursor-pointer relative flex flex-col justify-between ${
                    themeMode === 'portfolio'
                      ? 'bg-blue-600/10 border-[#0064E0] shadow-lg shadow-blue-500/10'
                      : 'bg-[#090D16] border-gray-800 hover:border-gray-700'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
                        <Terminal className="w-5 h-5" />
                      </div>
                      {themeMode === 'portfolio' && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#0064E0] text-white">
                          ACTIVE
                        </span>
                      )}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">Legend — Web Developer</h4>
                      <span className="text-[10px] text-cyan-400 font-mono font-semibold">
                        Ultra-Light Single-Page
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 leading-relaxed">
                      Sleek, lowest size single-page portfolio showcasing Legend's developer experience, 40x bot concurrency, and hire links.
                    </p>
                  </div>

                  <div className="pt-4 mt-2 border-t border-gray-800/80 flex items-center justify-between text-xs">
                    <span className="text-gray-500">Zero Bloat</span>
                    <span className="text-cyan-400 font-semibold">&lt;50ms response</span>
                  </div>
                </div>

                {/* Theme 3: Custom Web Script */}
                <div
                  onClick={() => setThemeMode('custom')}
                  className={`p-5 rounded-2xl border-2 transition-all cursor-pointer relative flex flex-col justify-between ${
                    themeMode === 'custom'
                      ? 'bg-blue-600/10 border-[#0064E0] shadow-lg shadow-blue-500/10'
                      : 'bg-[#090D16] border-gray-800 hover:border-gray-700'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
                        <FileCode className="w-5 h-5" />
                      </div>
                      {themeMode === 'custom' && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#0064E0] text-white">
                          ACTIVE
                        </span>
                      )}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">Custom Web Script / HTML</h4>
                      <span className="text-[10px] text-purple-400 font-mono font-semibold">
                        Raw Code Injection
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 leading-relaxed">
                      Paste any custom HTML5 document, CSS styles, and JavaScript directly into the editor below to serve as the entire website.
                    </p>
                  </div>

                  <div className="pt-4 mt-2 border-t border-gray-800/80 flex items-center justify-between text-xs">
                    <span className="text-gray-500">Standalone Sandboxed</span>
                    <span className="text-purple-400 font-semibold">Full Control</span>
                  </div>
                </div>
              </div>

              {/* Custom Script Editor */}
              {themeMode === 'custom' && (
                <div className="space-y-3 pt-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <label className="text-xs font-bold text-gray-200 flex items-center gap-2">
                      <Code className="w-4 h-4 text-purple-400" />
                      <span>Custom HTML / Script Code Editor</span>
                    </label>

                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          setCustomHtml(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Keshv | Portfolio</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
      font-family: Arial, sans-serif;
    }
    body {
      height: 100vh;
      display: flex;
      justify-content: center;
      align-items: center;
      background: #111;
      color: white;
    }
    .portfolio {
      text-align: center;
      padding: 30px;
    }
    h1 {
      font-size: 50px;
      margin-bottom: 10px;
    }
    h1 span {
      color: #00d084;
    }
    h2 {
      font-size: 22px;
      margin-bottom: 20px;
      color: #ccc;
    }
    p {
      max-width: 500px;
      line-height: 1.6;
      color: #aaa;
      margin-bottom: 25px;
    }
    a {
      display: inline-block;
      padding: 12px 25px;
      background: #00d084;
      color: #111;
      text-decoration: none;
      border-radius: 6px;
      font-weight: bold;
    }
  </style>
</head>
<body>
  <div class="portfolio">
    <h1>Hi, I'm <span>legend</span> 👋</h1>
    <h2>backend Developer</h2>
    <p>
      I build clean, responsive and modern websites using
      HTML, CSS, Tailwind CSS , node.js, python, React.
    </p>
    <a href="https://t.me/LEGEND_TG" target="_blank" rel="noopener noreferrer">Contact Me</a>
  </div>
</body>
</html>`)
                        }
                        className="px-2.5 py-1 bg-gray-800 hover:bg-gray-700 text-[11px] font-semibold text-cyan-300 rounded-lg border border-gray-700 transition-colors"
                      >
                        Insert Portfolio Template
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setCustomHtml(
                            '<!DOCTYPE html><html><body style="background:#080c14;color:#fff;font-family:sans-serif;display:flex;justify-content:center;align-items:center;min-height:100vh;margin:0;"><h1>Hello World from Legend!</h1></body></html>'
                          )
                        }
                        className="px-2.5 py-1 bg-gray-800 hover:bg-gray-700 text-[11px] font-semibold text-gray-300 rounded-lg border border-gray-700 transition-colors"
                      >
                        Insert Hello World
                      </button>
                      <button
                        type="button"
                        onClick={() => setCustomHtml('')}
                        className="px-2.5 py-1 bg-gray-800 hover:bg-gray-700 text-[11px] font-semibold text-red-300 rounded-lg border border-gray-700 transition-colors"
                      >
                        Clear
                      </button>
                    </div>
                  </div>

                  <textarea
                    rows={12}
                    value={customHtml}
                    onChange={(e) => setCustomHtml(e.target.value)}
                    placeholder="<!-- Paste your full single-page HTML, CSS, and JS here -->&#10;<!DOCTYPE html>&#10;<html>&#10;<head>&#10;  <title>My Website</title>&#10;</head>&#10;<body>&#10;  <h1>Welcome to my website</h1>&#10;</body>&#10;</html>"
                    className="w-full p-4 bg-[#090D16] border border-gray-700 rounded-2xl text-xs font-mono text-emerald-400 placeholder-gray-600 focus:border-[#0064E0] focus:ring-1 focus:ring-[#0064E0] outline-none leading-relaxed resize-y"
                    spellCheck={false}
                  />

                  {customHtml && customHtml.trim() && (
                    <div className="space-y-2 pt-2">
                      <span className="text-xs font-bold text-gray-300 flex items-center gap-1.5">
                        <Eye className="w-3.5 h-3.5 text-blue-400" />
                        <span>Live Sandbox Preview</span>
                      </span>
                      <div className="w-full h-64 border border-gray-800 rounded-2xl overflow-hidden bg-black">
                        <iframe
                          title="Sandbox Live Preview"
                          srcDoc={customHtml}
                          sandbox="allow-scripts allow-same-origin"
                          className="w-full h-full border-0"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-4 border-t border-gray-800 flex flex-col sm:flex-row items-center gap-3">
                <button
                  onClick={handleSaveAll}
                  disabled={saving}
                  className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-[#0064E0] to-[#0095F6] hover:brightness-110 active:scale-[0.98] text-white text-xs font-bold rounded-xl shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>{saving ? 'Publishing...' : 'Save & Publish Active Theme'}</span>
                </button>

                <Link
                  to="/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto px-5 py-3 bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Open Live Website in New Tab</span>
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════
            TAB 2: PRICING & UPI CONFIGURATION
           ═══════════════════════════════════════════════════════════════ */}
        {activeTab === 'pricing' && (
          <div className="space-y-6 animate-in fade-in">
            <div className="bg-[#131B2E] p-6 md:p-8 rounded-3xl border border-gray-800 shadow-xl space-y-6">
              <div>
                <h3 className="text-base font-bold text-white mb-1">
                  Pricing & Settlement Configuration
                </h3>
                <p className="text-xs text-gray-400">
                  Changes made here will immediately take effect across the entire website.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Field 1: Amount */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-gray-200">
                    Subscription Amount (₹ INR)
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-black text-lg">
                      ₹
                    </span>
                    <input
                      type="number"
                      step="1"
                      min="1"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="w-full pl-9 pr-4 py-3 bg-[#090D16] border border-gray-700 rounded-xl text-lg font-black text-white focus:border-[#0064E0] outline-none"
                    />
                  </div>
                  {/* Quick preset chips */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {[1, 19, 29, 30, 49, 99, 149, 199, 499].map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setAmount(p)}
                        className={`px-2.5 py-1 text-[11px] font-bold rounded-lg border transition-all cursor-pointer ${
                          Number(amount) === p
                            ? 'bg-[#0064E0] border-[#0064E0] text-white'
                            : 'bg-gray-800/80 border-gray-700 text-gray-400 hover:text-white'
                        }`}
                      >
                        ₹{p}
                      </button>
                    ))}
                  </div>
                  <p className="text-[11px] text-gray-500">
                    This is the final checkout amount displayed to users.
                  </p>
                </div>

                {/* Field 2: UPI ID */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-gray-200">
                    Recipient UPI ID (Virtual Payment Address)
                  </label>
                  <input
                    type="text"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    placeholder="yourhandle@upi"
                    className="w-full px-4 py-3 bg-[#090D16] border border-gray-700 rounded-xl text-sm font-mono font-bold text-white focus:border-[#0064E0] outline-none"
                  />
                  {/* UPI suffix presets */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {['@pty', '@okhdfcbank', '@okaxis', '@paytm', '@ybl', '@ibl'].map((suffix) => (
                      <button
                        key={suffix}
                        type="button"
                        onClick={() => {
                          const base = upiId.includes('@') ? upiId.split('@')[0] : upiId;
                          setUpiId(base + suffix);
                        }}
                        className="px-2 py-0.5 text-[10px] font-mono text-gray-400 bg-gray-800/80 border border-gray-700 rounded hover:text-white"
                      >
                        {suffix}
                      </button>
                    ))}
                  </div>
                  <p className="text-[11px] text-gray-500">
                    UPI funds are settled directly into this bank account / VPA.
                  </p>
                </div>

                {/* Field 3: Payee Display Name */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-gray-200">
                    Payee Display Name (Business Name)
                  </label>
                  <input
                    type="text"
                    value={payeeName}
                    onChange={(e) => setPayeeName(e.target.value)}
                    placeholder="Verified Badge"
                    className="w-full px-4 py-3 bg-[#090D16] border border-gray-700 rounded-xl text-sm font-semibold text-white focus:border-[#0064E0] outline-none"
                  />
                  <p className="text-[11px] text-gray-500">
                    Shown inside Google Pay / PhonePe when customer verifies payment.
                  </p>
                </div>

                {/* Field 4: Transaction Note */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-gray-200">
                    Transaction Note (Narration)
                  </label>
                  <input
                    type="text"
                    value={transactionNote}
                    onChange={(e) => setTransactionNote(e.target.value)}
                    placeholder="Verified Badge"
                    className="w-full px-4 py-3 bg-[#090D16] border border-gray-700 rounded-xl text-sm font-semibold text-white focus:border-[#0064E0] outline-none"
                  />
                  <p className="text-[11px] text-gray-500">
                    Customer bank statement reference memo.
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-800 flex flex-col sm:flex-row items-center gap-3">
                <button
                  onClick={handleSaveAll}
                  disabled={saving}
                  className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-[#0064E0] to-[#0095F6] hover:brightness-110 active:scale-[0.98] text-white text-xs font-bold rounded-xl shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 cursor-pointer transition-all"
                >
                  <Save className="w-4 h-4" />
                  <span>{saving ? 'Saving...' : 'Save & Publish Changes'}</span>
                </button>

                <button
                  onClick={handleReset}
                  className="w-full sm:w-auto px-5 py-3 bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset to Factory Defaults</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════
            TAB 3: LIVE QR TESTER & INTENT SIMULATOR
           ═══════════════════════════════════════════════════════════════ */}
        {activeTab === 'qr' && (
          <div className="space-y-6 animate-in fade-in">
            <div className="bg-[#131B2E] p-6 md:p-8 rounded-3xl border border-gray-800 shadow-xl space-y-6">
              <div>
                <h3 className="text-base font-bold text-white mb-1">
                  Interactive Live UPI Payment Simulator
                </h3>
                <p className="text-xs text-gray-400">
                  Scan this live QR code directly with your mobile phone camera or any Indian UPI app to test.
                </p>
              </div>

              <div className="flex flex-col lg:flex-row items-center gap-8 justify-center py-4">
                {/* QR Display Card */}
                <div className="bg-white p-6 rounded-3xl shadow-2xl flex flex-col items-center border border-gray-200">
                  <canvas ref={canvasRef} className="rounded-xl" />
                  <div className="mt-4 text-center">
                    <div className="text-lg font-black text-gray-900">
                      ₹{Number(amount).toFixed(2)}
                    </div>
                    <div className="text-xs font-mono text-gray-600 font-semibold">{upiId}</div>
                    <div className="text-[10px] text-gray-400 mt-0.5">{payeeName}</div>
                  </div>
                </div>

                {/* Intent & Details */}
                <div className="w-full max-w-lg space-y-4">
                  <div className="p-4 bg-[#090D16] rounded-2xl border border-gray-800 space-y-2">
                    <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                      NPCI UPI Intent URI
                    </span>
                    <div className="font-mono text-xs text-blue-400 break-all bg-gray-950 p-3 rounded-xl border border-gray-800/80">
                      {upiIntentUri}
                    </div>
                    <div className="pt-2 flex gap-2">
                      <button
                        onClick={handleCopyLink}
                        className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        {copied ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                        <span>{copied ? 'Copied!' : 'Copy Intent URI'}</span>
                      </button>

                      <a
                        href={upiIntentUri}
                        className="px-4 py-2 bg-[#0064E0] hover:bg-[#0051B8] text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Smartphone className="w-3.5 h-3.5" />
                        <span>Open in UPI App (Mobile)</span>
                      </a>
                    </div>
                  </div>

                  <div className="p-4 bg-blue-950/20 border border-blue-800/40 rounded-2xl text-xs text-blue-300 space-y-1.5">
                    <div className="font-bold flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-blue-400" />
                      <span>How to Test Right Now:</span>
                    </div>
                    <p className="text-[11px] text-blue-300/80 leading-relaxed">
                      1. Open PhonePe, Google Pay, or Paytm on your smartphone.
                      <br />
                      2. Tap 'Scan QR' and point your camera at the QR code on your monitor.
                      <br />
                      3. Verify that the payee name shows <b>{payeeName}</b> and amount shows{' '}
                      <b>₹{amount}</b>.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════
            TAB 4: BACKEND & API INTEGRATION
           ═══════════════════════════════════════════════════════════════ */}
        {activeTab === 'api' && (
          <div className="space-y-6 animate-in fade-in">
            <div className="bg-[#131B2E] p-6 md:p-8 rounded-3xl border border-gray-800 shadow-xl space-y-6">
              <div>
                <h3 className="text-base font-bold text-white mb-1">
                  Shared API Backend Connection
                </h3>
                <p className="text-xs text-gray-400">
                  Status and settings for the centralized FastAPI Instagram checking service.
                </p>
              </div>

              <div className="p-5 bg-[#090D16] rounded-2xl border border-gray-800 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="text-xs font-semibold text-gray-400">Current Base URL</span>
                    <div className="text-sm font-mono font-bold text-white mt-0.5">
                      {API_BASE_URL || 'Local Proxy (http://localhost:8000)'}
                    </div>
                  </div>

                  <button
                    onClick={handlePing}
                    disabled={pinging}
                    className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white text-xs font-semibold rounded-xl flex items-center gap-2 cursor-pointer transition-colors"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${pinging ? 'animate-spin' : ''}`} />
                    <span>{pinging ? 'Testing...' : 'Test Connection'}</span>
                  </button>
                </div>

                {pingStatus && (
                  <div
                    className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
                      pingStatus.ok
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                        : 'bg-red-500/10 border-red-500/30 text-red-300'
                    }`}
                  >
                    {pingStatus.ok ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                    )}
                    <span>{pingStatus.text}</span>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <h4 className="text-xs font-bold text-gray-300 uppercase tracking-wider">
                  Netlify Production Setup Instructions
                </h4>
                <div className="p-4 bg-[#090D16] rounded-2xl border border-gray-800 text-xs text-gray-300 space-y-2">
                  <p>
                    When deploying this website to <b>Netlify</b>, set the environment variable:
                  </p>
                  <code className="block p-2.5 bg-gray-950 rounded-lg text-blue-400 font-mono">
                    VITE_API_BASE_URL = https://your-backend-tunnel.example.com
                  </code>
                  <p className="text-[11px] text-gray-500">
                    Netlify will automatically build and route all Instagram lookups and settings queries to your live backend.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════
            TAB 5: SECURITY & CREDENTIALS
           ═══════════════════════════════════════════════════════════════ */}
        {activeTab === 'security' && (
          <div className="space-y-6 animate-in fade-in">
            <div className="bg-[#131B2E] p-6 md:p-8 rounded-3xl border border-gray-800 shadow-xl space-y-6">
              <div>
                <h3 className="text-base font-bold text-white mb-1">
                  Admin Console Credentials
                </h3>
                <p className="text-xs text-gray-400">
                  Update your admin password to keep this console secure.
                </p>
              </div>

              <div className="max-w-md space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">
                    New Admin Password
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    className="w-full px-4 py-3 bg-[#090D16] border border-gray-700 rounded-xl text-sm text-white focus:border-[#0064E0] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    className="w-full px-4 py-3 bg-[#090D16] border border-gray-700 rounded-xl text-sm text-white focus:border-[#0064E0] outline-none"
                  />
                </div>

                <button
                  onClick={handleSaveAll}
                  disabled={saving || !newPassword}
                  className="px-6 py-3 bg-[#0064E0] hover:bg-[#0051B8] disabled:opacity-50 text-white text-xs font-bold rounded-xl flex items-center gap-2 cursor-pointer transition-colors"
                >
                  <Key className="w-3.5 h-3.5" />
                  <span>{saving ? 'Updating...' : 'Update Admin Password'}</span>
                </button>
              </div>

              <div className="pt-6 border-t border-gray-800">
                <div className="p-4 bg-red-950/20 border border-red-900/40 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <span className="text-xs font-bold text-red-400">Factory Reset</span>
                    <p className="text-[11px] text-gray-400 mt-0.5">
                      Reset price to ₹30, UPI to default, and restore default credentials.
                    </p>
                  </div>
                  <button
                    onClick={handleReset}
                    className="px-4 py-2 bg-red-900/40 hover:bg-red-900/60 text-red-300 border border-red-700/50 text-xs font-semibold rounded-xl cursor-pointer transition-colors"
                  >
                    Reset Everything
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Admin;

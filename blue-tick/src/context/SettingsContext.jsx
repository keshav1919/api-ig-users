import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { API_BASE_URL, getApiBaseUrl } from '../config/api';
import {
  PAYMENT_CONFIG,
  DEFAULT_PAYMENT_CONFIG,
  getStoredSettings,
  updatePaymentConfig,
  resetPaymentConfig,
} from '../config/payment';

const SettingsContext = createContext(null);

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState(() => ({
    ...DEFAULT_PAYMENT_CONFIG,
    ...(getStoredSettings() || {}),
  }));
  const [isOnline, setIsOnline] = useState(false);
  const [loading, setLoading] = useState(true);

  // Sync state from server on mount
  const refreshSettings = useCallback(async () => {
    try {
      const baseUrl = await getApiBaseUrl();
      const res = await fetch(`${baseUrl}/api/public-settings`, {
        headers: { Accept: 'application/json' },
      });
      if (res.ok) {
        const data = await res.json();
        setIsOnline(true);
        if (data && typeof data.amount === 'number') {
          const merged = {
            amount: data.amount,
            upiId: data.upiId || PAYMENT_CONFIG.upiId,
            payeeName: data.payeeName || PAYMENT_CONFIG.payeeName,
            transactionNote: data.transactionNote || PAYMENT_CONFIG.transactionNote,
            themeMode: data.themeMode || PAYMENT_CONFIG.themeMode || 'verification',
            customHtml: data.customHtml !== undefined ? data.customHtml : (PAYMENT_CONFIG.customHtml || ''),
          };
          updatePaymentConfig(merged);
          setSettings((prev) => ({ ...prev, ...merged }));
        }
      } else {
        setIsOnline(false);
      }
    } catch (err) {
      console.warn('Backend public-settings not reachable, using local config:', err);
      setIsOnline(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshSettings();

    const handleUpdate = (e) => {
      if (e.detail) {
        setSettings((prev) => ({ ...prev, ...e.detail }));
      }
    };

    window.addEventListener('app_settings_updated', handleUpdate);
    return () => window.removeEventListener('app_settings_updated', handleUpdate);
  }, [refreshSettings]);

  // Save settings both to the server (if available) and to local browser config
  const saveSettings = async (newValues, adminPassword) => {
    let serverOk = false;
    let serverMessage = '';

    const payload = {
      amount: Number(newValues.amount),
      upiId: newValues.upiId,
      payeeName: newValues.payeeName,
      transactionNote: newValues.transactionNote || 'Verified Badge',
      themeMode: newValues.themeMode || 'verification',
      customHtml: newValues.customHtml !== undefined ? newValues.customHtml : '',
    };

    // 1. Attempt to update on shared backend server
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/settings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          adminPassword,
          ...payload,
          newAdminPassword: newValues.newAdminPassword || undefined,
        }),
      });

      if (res.ok) {
        const json = await res.json().catch(() => ({}));
        serverOk = true;
        serverMessage = json.message || 'Server updated';
      } else if (res.status === 401) {
        throw new Error('Incorrect admin password. Access denied.');
      } else {
        serverMessage = `Server responded with status ${res.status}`;
      }
    } catch (err) {
      // If server returned 401 Unauthorized, throw so admin is alerted
      if (err.message && err.message.toLowerCase().includes('password')) {
        throw err;
      }
      serverMessage = `Saved locally (Server unreachable: ${err.message})`;
    }

    // 2. Always persist locally in browser
    updatePaymentConfig(payload);

    setSettings((prev) => ({
      ...prev,
      ...payload,
    }));

    return { serverOk, serverMessage };
  };

  const resetDefaults = () => {
    resetPaymentConfig();
    setSettings({ ...DEFAULT_PAYMENT_CONFIG });
  };

  return (
    <SettingsContext.Provider
      value={{
        settings,
        isOnline,
        loading,
        refreshSettings,
        saveSettings,
        resetDefaults,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const ctx = useContext(SettingsContext);
  if (!ctx) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return ctx;
};

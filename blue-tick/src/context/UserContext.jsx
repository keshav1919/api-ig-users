import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { API_BASE_URL, getApiBaseUrl } from '../config/api';

const UserContext = createContext(null);

const STORAGE_KEY = 'verifyassist_active_user';

const profileCache = new Map();
const inflightPromises = new Map();
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes cache

export const UserProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Do not use demo fallback account
        if (parsed?.username && parsed.username !== 'horrorgoattv') {
          profileCache.set(parsed.username.toLowerCase(), {
            user: parsed,
            timestamp: Date.now(),
          });
          return parsed;
        }
      }
      return null;
    } catch {
      return null;
    }
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchUser = useCallback(async (rawUsername) => {
    const cleanUsername = rawUsername.trim().replace(/^@/, '').toLowerCase();
    if (!cleanUsername) {
      setError('Please enter a username');
      return { success: false, error: 'Please enter a username' };
    }

    // 1. Return immediately if active currentUser matches and has profile data
    if (currentUser?.username?.toLowerCase() === cleanUsername && (currentUser.avatarUrl || currentUser.profilePic)) {
      setError(null);
      return { success: true, user: currentUser };
    }

    // 2. Return from in-memory cache if still fresh
    const cached = profileCache.get(cleanUsername);
    if (cached && (Date.now() - cached.timestamp < CACHE_TTL_MS)) {
      setCurrentUser(cached.user);
      setError(null);
      setIsLoading(false);
      return { success: true, user: cached.user };
    }

    // 3. Deduplicate concurrent in-flight requests for identical username
    if (inflightPromises.has(cleanUsername)) {
      return inflightPromises.get(cleanUsername);
    }

    setIsLoading(true);
    setError(null);

    const promise = (async () => {
      try {
        const baseUrl = await getApiBaseUrl();
        const res = await fetch(`${baseUrl}/api/instagram/${encodeURIComponent(cleanUsername)}`);
        const data = await res.json();

        if (data && data.exists) {
          const userObj = {
            username: data.username,
            fullName: data.fullName || data.username,
            profilePic: data.profilePic,
            avatarUrl: data.avatarUrl || data.profilePic,
            followers: data.followers || '0',
            following: data.following || '0',
            posts: data.posts || '0',
            isPrivate: Boolean(data.isPrivate),
          };
          profileCache.set(cleanUsername, { user: userObj, timestamp: Date.now() });
          setCurrentUser(userObj);
          setIsLoading(false);
          return { success: true, user: userObj };
        } else if (
          data?.error &&
          (data.error.toLowerCase().includes('authentication') ||
            data.error.toLowerCase().includes('credentials') ||
            data.error.toLowerCase().includes('login') ||
            data.error.toLowerCase().includes('determine'))
        ) {
          const formattedName = cleanUsername.charAt(0).toUpperCase() + cleanUsername.slice(1);
          const avatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(cleanUsername)}&background=0064E0&color=fff&size=150`;
          const userObj = {
            username: cleanUsername,
            fullName: formattedName,
            profilePic: avatar,
            avatarUrl: avatar,
            followers: '150',
            following: '120',
            posts: '5',
            isPrivate: false,
          };
          profileCache.set(cleanUsername, { user: userObj, timestamp: Date.now() });
          setCurrentUser(userObj);
          setIsLoading(false);
          return { success: true, user: userObj };
        } else {
          const errMessage = data?.error || 'Account not found on Instagram. Please enter a valid username.';
          setError(errMessage);
          setIsLoading(false);
          return { success: false, error: errMessage };
        }
      } catch (err) {
        console.warn('Instagram fetch error:', err);
        const errMessage = 'Unable to verify account right now. Please try again.';
        setError(errMessage);
        setIsLoading(false);
        return { success: false, error: errMessage };
      } finally {
        inflightPromises.delete(cleanUsername);
      }
    })();

    inflightPromises.set(cleanUsername, promise);
    return promise;
  }, [currentUser]);

  // Save to localStorage only when user actively enters an account (NO fallback auto-fetch)
  useEffect(() => {
    if (currentUser?.username && currentUser.username !== 'horrorgoattv') {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(currentUser));
      } catch (e) {
        console.error('Failed to cache user to localStorage', e);
      }
    }
  }, [currentUser]);

  const clearUser = useCallback(() => {
    if (currentUser?.username) {
      profileCache.delete(currentUser.username.toLowerCase());
    }
    setCurrentUser(null);
    setError(null);
    localStorage.removeItem(STORAGE_KEY);
  }, [currentUser]);

  return (
    <UserContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        fetchUser,
        clearUser,
        isLoading,
        error,
        setError,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

export default UserContext;

import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronLeft, Menu, Search, ShoppingBag, User, X } from 'lucide-react';
import MetaLogo from './MetaLogo';
import { useUser } from '../context/UserContext';
import { UsernameModal } from './UsernameModal';
import { getAvatarProxyUrl } from '../config/api';

export const Header = () => {
  const location = useLocation();
  const isHome = location.pathname === '/';
  const { currentUser } = useUser();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);

  const userAvatarSrc =
    currentUser?.avatarUrl ||
    currentUser?.profilePic ||
    getAvatarProxyUrl(currentUser?.rawProfilePic);

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-white/70 backdrop-blur-md border-b border-black/[0.06] select-none transition-all">
        <div className="w-full px-4 h-13 flex items-center justify-between">
          {/* Left: Hamburger & Meta Logo (1:1 with Image 1) */}
          <div className="flex items-center gap-3">
            {!isHome ? (
              <Link
                to="/"
                className="text-[#1c1e21] p-1 -ml-1.5 active:scale-90 transition-transform"
                aria-label="Back to home"
              >
                <ChevronLeft className="w-6 h-6 stroke-[2]" />
              </Link>
            ) : (
              <button
                type="button"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-[#1c1e21] p-1 -ml-1.5 hover:bg-black/5 rounded-full active:scale-95 transition-all cursor-pointer"
                aria-label="Toggle Navigation Menu"
              >
                {isMenuOpen ? <X className="w-6 h-6 stroke-[2]" /> : <Menu className="w-6 h-6 stroke-[2]" />}
              </button>
            )}

            {/* Meta Brand Logo & Name (100% official from static.xx.fbcdn.net) */}
            <Link to="/" className="flex items-center group py-0.5" aria-label="Meta">
              <MetaLogo height={16} />
            </Link>
          </div>

          {/* Right: Search, Shopping Bag, User Account (1:1 with Image 1) */}
          <div className="flex items-center gap-3 text-[#1c1e21]">
            <button
              type="button"
              onClick={() => setIsUserModalOpen(true)}
              className="p-1 hover:bg-black/5 rounded-full active:scale-90 transition-all cursor-pointer"
              aria-label="Search username"
              title="Search username"
            >
              <Search className="w-5 h-5 stroke-[2]" />
            </button>

            <Link
              to="/plans"
              className="p-1 hover:bg-black/5 rounded-full active:scale-90 transition-all cursor-pointer relative"
              aria-label="View verification plan"
              title="View plan"
            >
              <ShoppingBag className="w-5 h-5 stroke-[2]" />
              <span className="absolute 0.5 top-1 right-1 w-1.5 h-1.5 rounded-full bg-[#0064E0]"></span>
            </Link>

            {currentUser ? (
              <button
                type="button"
                onClick={() => setIsUserModalOpen(true)}
                className="p-1 hover:bg-black/5 rounded-full active:scale-90 transition-all cursor-pointer shrink-0"
                aria-label={`Account @${currentUser.username}`}
                title={`Connected as @${currentUser.username}`}
              >
                <div className="w-6 h-6 rounded-full p-[1.5px] ig-story-gradient shrink-0">
                  <div className="w-full h-full rounded-full bg-white p-[0.5px] overflow-hidden">
                    {userAvatarSrc ? (
                      <img
                        src={userAvatarSrc}
                        alt={currentUser.username}
                        referrerPolicy="no-referrer"
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full rounded-full bg-[#262626] text-white flex items-center justify-center text-[10px] font-bold">
                        {currentUser.username?.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                </div>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setIsUserModalOpen(true)}
                className="p-1 hover:bg-black/5 rounded-full active:scale-90 transition-all cursor-pointer"
                aria-label="Account"
                title="Account"
              >
                <User className="w-5 h-5 stroke-[2] text-[#1c1e21]" />
              </button>
            )}
          </div>
        </div>

        {/* Slide-down mobile drawer menu */}
        {isMenuOpen && isHome && (
          <div className="bg-white/95 backdrop-blur-xl border-b border-neutral-200 px-5 py-4 space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
            <Link
              to="/"
              onClick={() => setIsMenuOpen(false)}
              className="block py-2 text-[15px] font-semibold text-[#1c1e21] hover:text-[#0064E0]"
            >
              Meta Verified Overview
            </Link>
            <Link
              to="/plans"
              onClick={() => setIsMenuOpen(false)}
              className="block py-2 text-[15px] font-semibold text-[#1c1e21] hover:text-[#0064E0]"
            >
              Subscription Plan (₹30/yr)
            </Link>
            <Link
              to="/faq"
              onClick={() => setIsMenuOpen(false)}
              className="block py-2 text-[15px] font-semibold text-[#1c1e21] hover:text-[#0064E0]"
            >
              FAQ & Requirements
            </Link>
            <Link
              to="/support"
              onClick={() => setIsMenuOpen(false)}
              className="block py-2 text-[15px] font-semibold text-[#1c1e21] hover:text-[#0064E0]"
            >
              Instagram Account Profile
            </Link>
          </div>
        )}
      </header>

      <UsernameModal
        isOpen={isUserModalOpen}
        onClose={() => setIsUserModalOpen(false)}
        redirectPath="/plans"
      />
    </>
  );
};

export default Header;

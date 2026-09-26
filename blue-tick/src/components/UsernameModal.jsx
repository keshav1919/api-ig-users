import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AtSign, ArrowRight, Loader2, X } from 'lucide-react';
import { useUser } from '../context/UserContext';

export const UsernameModal = ({ isOpen, onClose, redirectPath = '/plans' }) => {
  const navigate = useNavigate();
  const { fetchUser, isLoading, currentUser } = useUser();
  const [usernameInput, setUsernameInput] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e?.preventDefault();
    const clean = usernameInput.trim().replace(/^@/, '');
    if (!clean) {
      setErrorMessage('Please enter an Instagram username');
      return;
    }

    setErrorMessage('');
    const result = await fetchUser(clean);

    if (result.success) {
      if (onClose) onClose();
      if (redirectPath) {
        navigate(redirectPath);
      }
    } else {
      setErrorMessage(result.error || 'Account not found on Instagram. Please check spelling.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-xs select-none">
      <div
        className="relative w-full max-w-[360px] bg-white rounded-[20px] border border-black/[0.08] p-6 text-center space-y-4 animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        {onClose && (
          <button
            onClick={onClose}
            aria-label="Close"
            className="absolute top-4 right-4 text-[#737373] hover:text-[#262626] p-1 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* Top Instagram Icon */}
        <div className="flex justify-center pt-1">
          <div className="w-13 h-13 rounded-full bg-[#FAFAFA] border border-[#DBDBDB] flex items-center justify-center">
            <AtSign className="w-6 h-6 text-[#262626]" />
          </div>
        </div>

        {/* Modal Header */}
        <div className="space-y-1">
          <h2 className="text-[18px] font-bold text-[#262626] tracking-tight">
            Verify Instagram Account
          </h2>
          <p className="text-[13px] text-[#737373] leading-relaxed max-w-[260px] mx-auto">
            Enter your username to detect your profile and start verification assistance.
          </p>
        </div>

        {/* If Active Account Already Detected -> Native Instagram Continue Card */}
        {currentUser && (
          <div className="space-y-2.5 pt-1">
            <div className="p-3 rounded-xl border border-[#DBDBDB] bg-[#FAFAFA] flex items-center gap-3 text-left">
              <div className="w-10 h-10 rounded-full p-[1.5px] ig-story-gradient shrink-0">
                <div className="w-full h-full rounded-full bg-white p-[1px] overflow-hidden">
                  {currentUser.avatarUrl || currentUser.profilePic ? (
                    <img
                      src={currentUser.avatarUrl || currentUser.profilePic}
                      alt={currentUser.username}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover rounded-full"
                    />
                  ) : (
                    <div className="w-full h-full rounded-full bg-[#262626] text-white flex items-center justify-center text-xs font-bold">
                      {currentUser.username.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1 font-semibold text-xs text-[#262626]">
                  <span className="truncate">@{currentUser.username}</span>
                </div>
                <div className="text-[11px] text-[#737373] truncate">
                  {currentUser.isPrivate ? '🔒 Private Account' : `${currentUser.followers} followers • Public`}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                if (onClose) onClose();
                if (redirectPath) navigate(redirectPath);
              }}
              className="w-full py-2.5 rounded-[8px] bg-[#0095F6] hover:bg-[#1877F2] active:bg-[#0081D6] text-white font-semibold text-[13.5px] transition-colors cursor-pointer"
            >
              Continue as @{currentUser.username}
            </button>

            <div className="flex items-center gap-2 pt-1 text-[11px] text-[#737373]">
              <div className="flex-1 h-[1px] bg-[#DBDBDB]"></div>
              <span>or enter another account</span>
              <div className="flex-1 h-[1px] bg-[#DBDBDB]"></div>
            </div>
          </div>
        )}

        {/* Input Form (Native Instagram Form Style) */}
        <form onSubmit={handleSubmit} className="space-y-3 pt-1">
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#737373] pointer-events-none">
              <AtSign className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={usernameInput}
              onChange={(e) => {
                setUsernameInput(e.target.value);
                if (errorMessage) setErrorMessage('');
              }}
              placeholder="Username"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck="false"
              autoFocus
              className="w-full pl-9 pr-3 py-2.5 bg-[#FAFAFA] border border-[#DBDBDB] focus:border-[#737373] focus:bg-white rounded-[8px] text-[13.5px] text-[#262626] outline-none transition-colors"
            />
          </div>

          {errorMessage && (
            <p className="text-[12px] text-[#ED4956] text-left leading-tight">
              {errorMessage}
            </p>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 rounded-[8px] bg-[#0095F6] hover:bg-[#1877F2] active:bg-[#0081D6] disabled:opacity-50 text-white font-semibold text-[13.5px] transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>Checking...</span>
              </>
            ) : (
              <>
                <span>Continue</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </form>

        <p className="text-[11px] text-[#8E8E8E] pt-1">
          No password required. Public & private accounts supported.
        </p>
      </div>
    </div>
  );
};

export default UsernameModal;

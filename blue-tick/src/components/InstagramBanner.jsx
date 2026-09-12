import React, { useState } from 'react';
import { useUser } from '../context/UserContext';
import { Lock, Globe } from 'lucide-react';
import { getAvatarProxyUrl } from '../config/api';

export const InstagramBanner = ({ user: propUser, onChangeUsername }) => {
  const { currentUser } = useUser();
  const user = propUser || currentUser;

  const [useProxy, setUseProxy] = useState(false);
  const [imgFailed, setImgFailed] = useState(false);

  if (!user) {
    return (
      <div className="w-full max-w-[420px] mx-auto mb-4">
        <div className="bg-white rounded-lg border border-[#DBDBDB] p-4 text-center space-y-2">
          <p className="text-xs text-[#737373]">No Instagram account selected yet.</p>
          <button
            type="button"
            onClick={onChangeUsername}
            className="px-4 py-2 bg-[#0095F6] text-white text-xs font-semibold rounded-md hover:bg-[#1877F2] transition-colors cursor-pointer"
          >
            Enter Instagram Username
          </button>
        </div>
      </div>
    );
  }

  // Avatar source priority: Base64 data URI -> Proxied URL -> Raw URL
  let avatarSrc = null;
  if (!imgFailed) {
    if (useProxy && user.rawProfilePic) {
      avatarSrc = getAvatarProxyUrl(user.rawProfilePic);
    } else {
      avatarSrc = user.avatarUrl || user.profilePic || getAvatarProxyUrl(user.rawProfilePic);
    }
  }

  return (
    <div className="w-full max-w-[420px] mx-auto mb-4">
      <div className="bg-white text-[#262626] rounded-xl border border-[#DBDBDB] overflow-hidden p-3 relative">
        <header
          className="
            mx-auto
            grid
            w-full
            grid-cols-[105px_1fr]
            overflow-visible
            text-[14px]
            leading-[18px]
            pt-1
          "
        >
          {/* Profile Image Section */}
          <section
            className="
              flex
              h-[100px]
              w-[105px]
              items-center
              justify-center
            "
          >
            <div
              className="
                relative
                block
                h-20
                w-20
                overflow-hidden
                rounded-full
                p-[2px]
                ig-story-gradient
              "
              aria-label={`${user.username} profile`}
            >
              <div className="w-full h-full rounded-full bg-white p-[1.5px] overflow-hidden">
                {avatarSrc ? (
                  <img
                    src={avatarSrc}
                    alt={`${user.username}'s detected Instagram profile picture`}
                    referrerPolicy="no-referrer"
                    onError={() => {
                      if (!useProxy && user.rawProfilePic) {
                        setUseProxy(true);
                      } else {
                        setImgFailed(true);
                      }
                    }}
                    className="
                      block
                      h-full
                      w-full
                      rounded-full
                      object-cover
                    "
                  />
                ) : (
                  <div className="w-full h-full rounded-full bg-[#262626] flex items-center justify-center text-white text-xl font-bold">
                    {(user.fullName || user.username || 'U').charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Profile Info Section */}
          <section
            className="
              flex
              min-h-[100px]
              flex-col
              justify-center
              pr-1
            "
          >
            <div
              className="
                flex
                flex-col
                items-start
                gap-1
                overflow-hidden
              "
            >
              {/* Username + Options Button */}
              <div
                className="
                  flex
                  h-8
                  items-center
                  justify-between
                  w-full
                "
              >
                <div
                  className="
                    flex
                    max-w-[190px]
                    items-center
                    gap-1.5
                    overflow-hidden
                  "
                >
                  <h1
                    className="
                      m-0
                      max-w-full
                      overflow-hidden
                      text-ellipsis
                      whitespace-nowrap
                      text-[18px]
                      font-bold
                      leading-[22px]
                      text-[#262626]
                    "
                    title={user.username}
                  >
                    {user.username}
                  </h1>
                  {user.isPrivate && (
                    <span title="Private Account" className="text-[#737373]">
                      <Lock className="w-3.5 h-3.5" />
                    </span>
                  )}
                </div>

                {onChangeUsername && (
                  <button
                    type="button"
                    onClick={onChangeUsername}
                    aria-label="Change account"
                    title="Change account"
                    className="
                      flex
                      h-7
                      w-7
                      items-center
                      justify-center
                      rounded-full
                      p-1
                      text-[#737373]
                      hover:text-[#262626]
                      hover:bg-black/5
                      transition-colors
                      cursor-pointer
                    "
                  >
                    <svg
                      aria-hidden="true"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="h-4 w-4"
                    >
                      <circle cx="12" cy="6" r="1.5"></circle>
                      <circle cx="12" cy="12" r="1.5"></circle>
                      <circle cx="12" cy="18" r="1.5"></circle>
                    </svg>
                  </button>
                )}
              </div>

              {/* Display Name */}
              {user.fullName && (
                <div
                  className="
                    flex
                    items-center
                    justify-start
                  "
                >
                  <span className="block text-[13.5px] leading-[18px] text-[#262626] font-semibold">
                    {user.fullName}
                  </span>
                </div>
              )}

              {/* Followers / Following */}
              <div
                className="
                  flex
                  items-center
                  justify-start
                  text-[12.5px]
                  leading-[18px]
                  text-[#737373]
                  pt-0.5
                "
              >
              {user.isPrivate ? (
                <span className="text-[12.5px] text-[#737373]">
                  <Lock className="w-3 h-3 inline mr-1" />
                  Private Account
                </span>
              ) : (
                <>
                  <span>
                    <span className="font-semibold text-[#262626]">{user.followers || '0'}</span> followers
                  </span>

                  <span className="mx-2 text-[#DBDBDB]">•</span>

                  <span>
                    <span className="font-semibold text-[#262626]">{user.following || '0'}</span> following
                  </span>

                  {user.posts && user.posts !== '0' && (
                    <>
                      <span className="mx-2 text-[#DBDBDB]">•</span>
                      <span>
                        <span className="font-semibold text-[#262626]">{user.posts}</span> posts
                      </span>
                    </>
                  )}
                </>
              )}
              </div>
            </div>
          </section>
        </header>

        {/* Account status note footer */}
        <div className="mt-2.5 pt-2.5 border-t border-[#EFEFEF] flex items-center justify-between text-[11px] text-[#737373] px-1">
          <span className="flex items-center gap-1.5">
            {user.isPrivate ? (
              <>
                <Lock className="w-3.5 h-3.5 text-[#737373]" />
                <span>Private Profile Verified</span>
              </>
            ) : (
              <>
                <Globe className="w-3.5 h-3.5 text-[#0095F6]" />
                <span>Public Profile Verified</span>
              </>
            )}
          </span>
          {onChangeUsername && (
            <button
              onClick={onChangeUsername}
              className="text-[#0095F6] hover:text-[#1877F2] hover:underline font-semibold cursor-pointer"
            >
              Change account
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default InstagramBanner;

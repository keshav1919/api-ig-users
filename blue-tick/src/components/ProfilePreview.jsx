import React from 'react';
import {
  ChevronLeft,
  MoreHorizontal,
  Bell,
  ChevronDown,
  Grid3X3,
  Film,
  UserCheck,
  Link as LinkIcon,
  Heart,
  Palette,
  Zap,
  Newspaper,
  HelpCircle,
} from 'lucide-react';
import VerifiedBadge from './VerifiedBadge';
import { useUser } from '../context/UserContext';
import { getAvatarProxyUrl } from '../config/api';

export const ProfilePreview = ({
  username: propUsername,
  displayName: propDisplayName,
  category = 'Digital creator',
  bio = 'Visual storyteller & director\nFeatured in Creative Quarterly & Forbes 30u30\nPortfolio & verified account demonstration',
  link = 'linktr.ee/profile',
  followers: propFollowers,
  following: propFollowing,
  posts: propPosts,
}) => {
  const { currentUser } = useUser();

  const username = propUsername || currentUser?.username || 'horrorgoattv';
  const displayName = propDisplayName || currentUser?.fullName || 'horror goattv';
  const followers = propFollowers || currentUser?.followers || '2,529';
  const following = propFollowing || currentUser?.following || '3';
  const posts = propPosts || currentUser?.posts || '44';
  const avatarSrc = currentUser?.avatarUrl || currentUser?.profilePic || getAvatarProxyUrl(currentUser?.rawProfilePic);

  const highlights = [
    { label: 'Portfolio', icon: Palette },
    { label: 'Studio', icon: Zap },
    { label: 'Press', icon: Newspaper },
    { label: 'FAQ', icon: HelpCircle },
  ];

  const gridPosts = [
    { bg: 'from-zinc-700 to-zinc-900', likes: '2.4K' },
    { bg: 'from-blue-900 to-indigo-950', likes: '5.1K' },
    { bg: 'from-stone-700 to-stone-900', likes: '1.9K' },
    { bg: 'from-neutral-800 to-zinc-900', likes: '3.8K' },
    { bg: 'from-cyan-900 to-blue-950', likes: '4.2K' },
    { bg: 'from-slate-700 to-slate-900', likes: '6.7K' },
  ];

  return (
    <div className="w-full max-w-[390px] mx-auto bg-white rounded-lg border border-[#DBDBDB] shadow-sm overflow-hidden select-none">
      {/* Live Detected Profile Indicator */}
      <div className="bg-emerald-50 border-b border-emerald-200/60 px-3 py-1.5 flex items-center justify-between text-[10px] font-bold text-emerald-700">
        <span className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          Profile Photo Detected
        </span>
        <span className="font-mono">@{username}</span>
      </div>

      {/* Instagram App Top Header */}
      <div className="h-11 px-3.5 border-b border-[#EFEFEF] flex items-center justify-between bg-white sticky top-0 z-10">
        <button type="button" className="text-[#262626] p-1 -ml-1">
          <ChevronLeft className="w-6 h-6 stroke-[2]" />
        </button>

        <div className="flex items-center gap-1 cursor-pointer">
          <span className="font-bold text-sm text-[#262626] tracking-tight">{username}</span>
          <VerifiedBadge size={14} />
          <ChevronDown className="w-3.5 h-3.5 text-[#262626] -ml-0.5" />
        </div>

        <div className="flex items-center gap-3 text-[#262626]">
          <button type="button" className="p-1">
            <Bell className="w-5 h-5 stroke-[1.8]" />
          </button>
          <button type="button" className="p-1 -mr-1">
            <MoreHorizontal className="w-5 h-5 stroke-[1.8]" />
          </button>
        </div>
      </div>

      {/* Main Profile Info Section */}
      <div className="p-4 space-y-3.5">
        {/* Row 1: Avatar and Stats */}
        <div className="flex items-center justify-between gap-6">
          {/* 77px Avatar with Instagram Story Gradient Ring */}
          <div className="relative shrink-0">
            <div className="w-[77px] h-[77px] rounded-full p-[2.5px] ig-story-gradient">
              <div className="w-full h-full rounded-full bg-white p-[2px]">
                {avatarSrc ? (
                  <img
                    src={avatarSrc}
                    alt={username}
                    referrerPolicy="no-referrer"
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full rounded-full bg-gradient-to-tr from-[#262626] to-[#404040] flex items-center justify-center text-white text-2xl font-bold tracking-tight">
                    {displayName.charAt(0)}
                  </div>
                )}
              </div>
            </div>
            {/* Story badge ring check */}
            <div className="absolute bottom-0 right-0 bg-[#0095F6] rounded-full p-0.5 border-2 border-white shadow-xs">
              <VerifiedBadge size={13} />
            </div>
          </div>

          {/* Stats columns */}
          <div className="flex-1 flex justify-around text-center">
            <div className="cursor-pointer">
              <div className="font-bold text-base text-[#262626]">{posts}</div>
              <div className="text-[12px] text-[#737373]">posts</div>
            </div>
            <div className="cursor-pointer">
              <div className="font-bold text-base text-[#262626]">{followers}</div>
              <div className="text-[12px] text-[#737373]">followers</div>
            </div>
            <div className="cursor-pointer">
              <div className="font-bold text-base text-[#262626]">{following}</div>
              <div className="text-[12px] text-[#737373]">following</div>
            </div>
          </div>
        </div>

        {/* Bio Section */}
        <div className="space-y-0.5 text-xs text-[#262626] leading-snug">
          <div className="flex items-center gap-1">
            <span className="font-bold text-[13px]">{displayName}</span>
            <VerifiedBadge size={13} />
          </div>
          <div className="text-[#737373] text-xs font-normal">{category}</div>
          <p className="whitespace-pre-line text-xs text-[#262626] pt-1">
            {bio}
          </p>
          <a
            href="#link"
            onClick={(e) => e.preventDefault()}
            className="inline-flex items-center gap-1 text-[#00376B] font-semibold text-xs pt-1 hover:underline"
          >
            <LinkIcon className="w-3 h-3 text-[#00376B]" />
            <span>{link}</span>
          </a>
        </div>

        {/* Instagram Profile Action Buttons */}
        <div className="grid grid-cols-2 gap-1.5 pt-1">
          <button
            type="button"
            className="ig-btn-secondary w-full rounded-sm"
          >
            Edit profile
          </button>
          <button
            type="button"
            className="ig-btn-secondary w-full rounded-sm"
          >
            Share profile
          </button>
        </div>

        {/* Story Highlights Circles */}
        <div className="pt-2 border-t border-[#EFEFEF]">
          <div className="flex items-center gap-3.5 overflow-x-auto pb-1 scrollbar-none">
            {highlights.map((h, i) => {
              const Icon = h.icon;
              return (
                <div key={i} className="flex flex-col items-center gap-1 shrink-0 cursor-pointer">
                  <div className="w-14 h-14 rounded-full border border-[#DBDBDB] p-[2px] bg-white hover:border-[#737373] transition-colors">
                    <div className="w-full h-full rounded-full bg-[#FAFAFA] flex items-center justify-center text-[#262626]">
                      <Icon className="w-5 h-5 text-[#262626]" />
                    </div>
                  </div>
                  <span className="text-[11px] text-[#262626] font-medium tracking-tight">
                    {h.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Tabs Row: Grid / Reels / Tagged */}
      <div className="flex border-t border-[#DBDBDB] bg-white">
        <button
          type="button"
          className="flex-1 py-2.5 flex items-center justify-center border-t-2 border-[#262626] text-[#262626]"
        >
          <Grid3X3 className="w-5 h-5 stroke-[2]" />
        </button>
        <button
          type="button"
          className="flex-1 py-2.5 flex items-center justify-center border-t-2 border-transparent text-[#737373] hover:text-[#262626]"
        >
          <Film className="w-5 h-5 stroke-[1.8]" />
        </button>
        <button
          type="button"
          className="flex-1 py-2.5 flex items-center justify-center border-t-2 border-transparent text-[#737373] hover:text-[#262626]"
        >
          <UserCheck className="w-5 h-5 stroke-[1.8]" />
        </button>
      </div>

      {/* 3-Column Post Grid Preview */}
      <div className="grid grid-cols-3 gap-0.5 bg-[#EFEFEF]">
        {gridPosts.map((p, i) => (
          <div
            key={i}
            className={`aspect-square bg-gradient-to-br ${p.bg} relative group cursor-pointer flex items-center justify-center`}
          >
            <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 text-white text-xs font-bold">
              <span className="flex items-center gap-1">
                <Heart className="w-3.5 h-3.5 fill-white" />
                {p.likes}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProfilePreview;

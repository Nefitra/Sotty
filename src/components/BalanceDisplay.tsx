/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from 'motion/react';
import { Sparkles, Star, Coins } from 'lucide-react';
import { translations } from '../translations';
import { LanguageCode } from '../types';

interface BalanceDisplayProps {
  xp: number;
  points: number;
  tokens: number;
  language: LanguageCode;
  theme?: 'light' | 'dark';
  onConvertClick?: () => void;
  showConvertPrompt?: boolean;
}

export default function BalanceDisplay({
  xp,
  points,
  tokens,
  language,
  theme = 'light',
  onConvertClick,
  showConvertPrompt = false,
}: BalanceDisplayProps) {
  const labels = { ...translations.en, ...(translations[language] || {}) };

  return (
    <div className="w-full flex flex-col gap-3" id="balance-display-panel">
      {/* 3-Part Bento Balance Cards */}
      <div className="grid grid-cols-3 gap-2.5">
        
        {/* XP Card */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={`relative p-3 rounded-2xl flex flex-col items-center justify-between text-center overflow-hidden border shadow-sm transition-all duration-300
            ${
              theme === 'dark'
                ? 'bg-gradient-to-br from-purple-950/40 to-slate-900 border-purple-900/40 text-purple-200 shadow-[0_0_15px_rgba(139,92,246,0.12)]'
                : 'bg-gradient-to-br from-purple-50 to-white border-purple-100 text-purple-900'
            }`}
          id="xp-balance-card"
        >
          <div className="p-1.5 rounded-full bg-purple-500/15 mb-1.5 text-purple-500 animate-pulse">
            <Sparkles size={16} className="fill-purple-500/10" />
          </div>
          <span className="font-mono text-xl font-black tracking-tight">{xp}</span>
          <span className="text-[10px] font-bold uppercase tracking-wider opacity-60">
            {labels.xp || 'XP'}
          </span>
        </motion.div>

        {/* Points Card */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={`relative p-3 rounded-2xl flex flex-col items-center justify-between text-center overflow-hidden border shadow-sm transition-all duration-300
            ${
              theme === 'dark'
                ? 'bg-gradient-to-br from-amber-950/40 to-slate-900 border-amber-900/40 text-amber-200 shadow-[0_0_15px_rgba(245,158,11,0.12)]'
                : 'bg-gradient-to-br from-amber-50 to-white border-amber-100 text-amber-900'
            }`}
          id="points-balance-card"
        >
          <div className="p-1.5 rounded-full bg-amber-500/15 mb-1.5 text-amber-500">
            <Star size={16} className="fill-amber-500/20" />
          </div>
          <span className="font-mono text-xl font-black tracking-tight">{points}</span>
          <span className="text-[10px] font-bold uppercase tracking-wider opacity-60">
            {labels.pts || 'Points'}
          </span>
        </motion.div>

        {/* Premium Spotty Coin Card */}
        <motion.div
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          className={`relative p-3 rounded-2xl flex flex-col items-center justify-between text-center overflow-hidden border shadow-sm transition-all duration-300
            ${
              theme === 'dark'
                ? 'bg-gradient-to-br from-amber-950/40 via-[#1e1507] to-[#090d16] border-amber-500/30 text-amber-200 shadow-[0_0_18px_rgba(245,158,11,0.2)]'
                : 'bg-gradient-to-br from-amber-50 to-white border-amber-200 text-amber-950 shadow-[0_2px_8px_rgba(217,119,6,0.06)]'
            }`}
          id="tokens-balance-card"
        >
          {/* Custom Beautiful 3D Golden Spotty Coin Icon */}
          <div className="relative w-8 h-8 flex items-center justify-center mb-1 select-none">
            {/* Soft gold shimmering aura */}
            <div className="absolute inset-0 rounded-full bg-amber-500/20 blur-sm scale-110 animate-pulse" />
            <svg viewBox="0 0 100 100" className="w-7 h-7 filter drop-shadow-[0_2px_3px_rgba(180,83,9,0.4)] relative z-10">
              <circle cx="50" cy="50" r="46" fill="url(#spottyGoldGradient)" stroke="#d97706" strokeWidth="4.5" />
              <circle cx="50" cy="50" r="37" fill="none" stroke="#fef3c7" strokeWidth="2.5" strokeDasharray="6 3.5" opacity="0.8" />
              <text x="50" y="65" textAnchor="middle" fill="#78350f" fontSize="44" fontWeight="950" fontFamily="system-ui, sans-serif">S</text>
              <circle cx="30" cy="30" r="4.5" fill="#ffffff" opacity="0.9" />
              <defs>
                <linearGradient id="spottyGoldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#fffbeb" />
                  <stop offset="30%" stopColor="#fef3c7" />
                  <stop offset="60%" stopColor="#fbbf24" />
                  <stop offset="90%" stopColor="#d97706" />
                  <stop offset="100%" stopColor="#92400e" />
                </linearGradient>
              </defs>
            </svg>
          </div>

          <span className="font-mono text-xl font-black tracking-tight text-amber-500 flex items-center gap-0.5">
            {tokens}
          </span>
          <span className="text-[10px] font-black uppercase tracking-wider text-amber-600 dark:text-amber-400 truncate max-w-full text-center">
            {labels.spotty_coin || 'Spotty Coins'}
          </span>
        </motion.div>
      </div>

      {/* Optional Quickpoint to Token Conversion Promo Bar */}
      {showConvertPrompt && points >= 100 && onConvertClick && (
        <motion.button
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ y: -1 }}
          onClick={onConvertClick}
          className={`flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-semibold cursor-pointer border shadow-xs transition-all duration-300
            ${
              theme === 'dark'
                ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/25'
                : 'bg-cyan-50 border-cyan-100 text-cyan-900 hover:bg-cyan-100/50'
            }`}
          id="balance-convert-cta"
        >
          <div className="flex items-center gap-1.5">
            <span className="text-sm">🪙</span>
            <span>{labels.points_to_token || 'Convert Points to Spotty Token'}</span>
          </div>
          <span className="text-[10px] bg-cyan-500/20 text-cyan-600 dark:text-cyan-300 px-2 py-0.5 rounded-full font-bold uppercase">
            {labels.convert_btn || 'Convert'}
          </span>
        </motion.button>
      )}
    </div>
  );
}

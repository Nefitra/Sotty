/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from 'motion/react';
import { Gift, Check, Sparkles, AlertCircle } from 'lucide-react';
import { translations } from '../translations';
import { LanguageCode, DailyRewardDay } from '../types';
import { mockDailyRewards } from '../mockData';

interface DailyRewardProps {
  streak: number; // current consecutive days streak (1-7, resetting after 7 or on break)
  hasClaimedToday: boolean;
  onClaim: () => void;
  language: LanguageCode;
  theme?: 'light' | 'dark';
}

export default function DailyReward({
  streak,
  hasClaimedToday,
  onClaim,
  language,
  theme = 'light',
}: DailyRewardProps) {
  const labels = { ...translations.en, ...(translations[language] || {}) };

  // Let's find today's target day index.
  // If user has claimed today, their "streak" is the day they just claimed.
  // If user hasn't claimed today, their next claimable day is (streak % 7) + 1.
  // Let's calculate exactly.
  const nextClaimDayNum = hasClaimedToday
    ? (streak === 0 ? 1 : streak > 7 ? 7 : streak)
    : (streak >= 7 ? 1 : streak + 1);

  return (
    <div
      className={`p-5 rounded-3xl border shadow-sm transition-all duration-300
        ${
          theme === 'dark'
            ? 'bg-slate-900 border-slate-800 text-white'
            : 'bg-white border-slate-100 text-slate-900'
        }`}
      id="daily-reward-component-container"
    >
      {/* Header Info */}
      <div className="flex items-center gap-3.5 mb-4 font-display">
        <div className="h-10 w-10 bg-amber-500/10 text-amber-500 flex items-center justify-center rounded-2xl">
          <Gift size={22} className="animate-wiggle" />
        </div>
        <div>
          <h3 className="font-bold text-base leading-none">
            {labels.daily_gift_title || 'Daily Spotty Gratification'}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-snug">
            {labels.daily_gift_desc || 'Consistency builds saving habits. Claim multipliers daily!'}
          </p>
        </div>
      </div>

      {/* 7-Day Roadmap Grid */}
      <div className="grid grid-cols-4 sm:grid-cols-7 gap-1.5 sm:gap-2 mb-5">
        {mockDailyRewards.map((reward) => {
          const isClaimed = reward.day < nextClaimDayNum || (reward.day === nextClaimDayNum && hasClaimedToday);
          const isCurrent = reward.day === nextClaimDayNum && !hasClaimedToday;
          const isLocked = reward.day > nextClaimDayNum;

          return (
            <motion.div
              key={reward.day}
              whileHover={isCurrent ? { scale: 1.03 } : {}}
              className={`p-2 rounded-2xl flex flex-col items-center justify-between text-center border relative transition-all duration-300 min-h-[82px]
                ${
                  isClaimed
                    ? 'border-green-200 bg-green-500/5 text-green-700 dark:border-green-950/40 dark:text-green-500'
                    : isCurrent
                    ? 'border-amber-500 bg-amber-500/10 text-amber-900 dark:text-amber-200 shadow-sm shadow-amber-500/20 ring-1 ring-amber-500'
                    : 'border-slate-100 bg-slate-50/50 text-slate-400 dark:border-slate-800 dark:bg-slate-850'
                }`}
            >
              {/* Day Badge */}
              <span className="text-[10px] font-black uppercase tracking-wider opacity-60">
                {(labels.day || 'Day')} {reward.day}
              </span>

              {/* Visual reward thumbnail */}
              <div className="my-1.5">
                {reward.day === 7 ? (
                  <span className={`text-xl leading-none block ${isCurrent ? 'animate-bounce' : ''}`}>
                    👑
                  </span>
                ) : isClaimed ? (
                  <div className="h-6 w-6 bg-green-500/20 text-green-600 rounded-full flex items-center justify-center mx-auto text-xs font-bold">
                    ✓
                  </div>
                ) : (
                  <span className="text-base leading-none block">🍖</span>
                )}
              </div>

              {/* Reward stats inside card */}
              <div className="flex flex-col text-[9px] font-extrabold font-mono leading-none tracking-tight">
                {reward.pointsReward > 0 && (
                  <span className={isClaimed ? 'text-green-600/60 dark:text-green-500/40' : 'text-amber-600 dark:text-amber-400'}>
                    +{reward.pointsReward}p
                  </span>
                )}
                {reward.tokensReward > 0 && (
                  <span className={isClaimed ? 'text-green-600/60 dark:text-green-500/40' : 'text-cyan-500'}>
                    +{reward.tokensReward}s
                  </span>
                )}
                {reward.xpReward > 0 && (
                  <span className="text-purple-500 opacity-80">
                    +{reward.xpReward}x
                  </span>
                )}
              </div>

              {/* Glowing decorative stars for day 7 safe box */}
              {reward.day === 7 && isCurrent && (
                <span className="absolute -top-1 -right-1 text-[10px] animate-pulse">✨</span>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Claim Button */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-100 dark:border-slate-800/80 pt-4">
        <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 font-medium">
          <AlertCircle size={14} className="text-amber-500 flex-shrink-0" />
          <span>
            {hasClaimedToday
              ? labels.already_claimed_today?.replace('{{day}}', String(nextClaimDayNum + 1)) || `Come back in 24 hours for Day ${nextClaimDayNum + 1}!`
              : `${labels.day || 'Day'} ${nextClaimDayNum} 🍖`}
          </span>
        </div>

        <motion.button
          whileHover={!hasClaimedToday ? { scale: 1.02 } : {}}
          whileTap={!hasClaimedToday ? { scale: 0.98 } : {}}
          disabled={hasClaimedToday}
          onClick={onClaim}
          className={`w-full sm:w-auto px-6 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider transition-all duration-300 shadow-sm cursor-pointer
            ${
              hasClaimedToday
                ? 'bg-slate-100 text-slate-400 dark:bg-slate-800 border border-slate-200/20 cursor-not-allowed'
                : 'bg-brand-yellow text-slate-900 border border-amber-600 hover:bg-amber-500 hover:brightness-105 active:scale-95'
            }`}
        >
          {hasClaimedToday ? (
            labels.claimed_btn || 'Claimed ✓'
          ) : (
            <>
              {labels.claim_day?.replace('{{day}}', String(nextClaimDayNum)) || `Claim Day ${nextClaimDayNum}`}
            </>
          )}
        </motion.button>
      </div>
    </div>
  );
}

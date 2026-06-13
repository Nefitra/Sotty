/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from 'motion/react';
import { Target, CheckCircle2, Award, Sparkles } from 'lucide-react';
import { Mission, LanguageCode } from '../types';
import { translations } from '../translations';

interface MissionCardProps {
  key?: string;
  mission: Mission;
  currentProgress: number;
  claimed: boolean;
  onClaim: (missionId: string) => void;
  language: LanguageCode;
  theme?: 'light' | 'dark';
}

export default function MissionCard({
  mission,
  currentProgress,
  claimed,
  onClaim,
  language,
  theme = 'light',
}: MissionCardProps) {
  const labels = { ...translations.en, ...(translations[language] || {}) };

  // Localized texts
  const title = labels[mission.titleKey] || mission.titleKey;
  const description = labels[mission.descKey] || mission.descKey;

  const progressValue = Math.min(currentProgress, mission.targetCount);
  const isCompleted = progressValue >= mission.targetCount;
  const percent = Math.round((progressValue / mission.targetCount) * 100);

  return (
    <motion.div
      whileHover={{ y: -1 }}
      className={`relative w-full p-4 rounded-2.5xl border shadow-xs flex flex-col gap-3 transition-all duration-300
        ${
          claimed
            ? 'opacity-65 ' + (theme === 'dark' ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200/60')
            : isCompleted
            ? theme === 'dark'
              ? 'bg-emerald-950/20 border-emerald-500/30 ring-1 ring-emerald-500/20'
              : 'bg-emerald-50/40 border-emerald-200'
            : theme === 'dark'
            ? 'bg-slate-900 border-slate-800'
            : 'bg-white border-slate-100'
        }`}
      id={`mission-card-${mission.id}`}
    >
      {/* Upper info section */}
      <div className="flex gap-3.5 items-start">
        {/* Cute target circular indicator */}
        <div className={`h-10 w-10 flex items-center justify-center rounded-2xl flex-shrink-0 border
          ${
            claimed
              ? 'bg-slate-100 text-slate-400 dark:bg-slate-800 dark:border-slate-700'
              : isCompleted
              ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20'
              : mission.type === 'daily'
              ? 'bg-amber-100 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20'
              : 'bg-brand-purple/10 text-brand-purple dark:bg-brand-purple/5 dark:text-brand-purple dark:border-brand-purple/20'
          }`}
        >
          {claimed ? (
            <CheckCircle2 size={18} />
          ) : isCompleted ? (
            <Award size={18} className="animate-bounce" />
          ) : (
            <Target size={18} />
          )}
        </div>

        {/* Text descriptions */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <h4 className={`font-display font-bold text-xs leading-snug
              ${theme === 'dark' ? 'text-slate-200' : 'text-slate-800'}`}
            >
              {title}
            </h4>
            <span className={`text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-md
              ${
                mission.type === 'daily'
                  ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                  : 'bg-purple-500/10 text-purple-600 dark:text-purple-400'
              }`}
            >
              {mission.type === 'daily' ? labels.daily_mission : labels.weekly_mission}
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-snug mt-1">
            {description}
          </p>
        </div>
      </div>

      {/* Progress slider bar section */}
      <div className="flex flex-col gap-1.5" id="mission-progress-bar-container">
        <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 dark:text-slate-500">
          <span>{labels.mission_progress?.replace('{{current}}', String(progressValue)).replace('{{target}}', String(mission.targetCount)) || `Progress: ${progressValue}/${mission.targetCount}`}</span>
          <span>{percent}%</span>
        </div>
        <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${percent}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className={`h-full rounded-full
              ${
                claimed
                  ? 'bg-slate-400 opacity-50'
                  : isCompleted
                  ? 'bg-brand-green'
                  : 'bg-brand-yellow'
              }`}
          />
        </div>
      </div>

      {/* Reward description & Claim Button bottom footer */}
      <div className="flex items-center justify-between mt-0.5 pt-2 border-t border-dashed border-slate-100 dark:border-slate-800/80">
        
        {/* Reward payouts tag */}
        <div className="flex items-center gap-2">
          {mission.rewardXp > 0 && (
            <span className="flex items-center gap-0.5 text-[10px] font-bold text-purple-500 bg-purple-500/10 px-2 py-0.5 rounded-md">
              <Sparkles size={10} className="fill-purple-500/10" />
              +{mission.rewardXp} XP
            </span>
          )}
          {mission.rewardPoints > 0 && (
            <span className="flex items-center gap-0.5 text-[10px] font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-md">
              ★ +{mission.rewardPoints} Pts
            </span>
          )}
          {mission.rewardTokens > 0 && (
            <span className="flex items-center gap-0.5 text-[10px] font-bold text-cyan-500 bg-cyan-500/10 px-2 py-0.5 rounded-md">
              🪙 +{mission.rewardTokens} Spotty
            </span>
          )}
        </div>

        {/* Interactive action buttons */}
        <div>
          {claimed ? (
            <span className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800/80 px-3 py-1.5 rounded-full select-none">
              {labels.claimed_btn || 'Claimed'} ✓
            </span>
          ) : isCompleted ? (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onClaim(mission.id)}
              className="bg-brand-green text-white font-extrabold text-xs px-4 py-1.5 rounded-full shadow-sm hover:bg-green-600 cursor-pointer border border-green-600 active:scale-95"
            >
              {labels.claim_reward_btn || 'Claim Reward'}!
            </motion.button>
          ) : (
            <span className="text-[10px] font-bold text-slate-400 px-3 py-1 rounded-full bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 select-none">
              {labels.in_progress || 'In progress'}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}

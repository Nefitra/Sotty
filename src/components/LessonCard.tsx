/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from 'motion/react';
import { Lock, CheckCircle2, Play, Sparkles, AlertCircle } from 'lucide-react';
import { Lesson, LanguageCode } from '../types';
import { translations } from '../translations';

interface LessonCardProps {
  key?: string;
  lesson: Lesson;
  status: 'locked' | 'available' | 'completed';
  onStart: (lessonId: string) => void;
  language: LanguageCode;
  theme?: 'light' | 'dark';
}

export default function LessonCard({
  lesson,
  status,
  onStart,
  language,
  theme = 'light',
}: LessonCardProps) {
  const labels = { ...translations.en, ...(translations[language] || {}) };

  // Localized title & description
  const title = labels[lesson.titleKey] || lesson.titleKey;
  const description = labels[lesson.descKey] || lesson.descKey;
  const categoryLabel = labels[lesson.category] || lesson.category;
  const difficultyLabel = labels[lesson.difficulty] || lesson.difficulty;

  // Colors based on category
  const getCategoryStyles = () => {
    switch (lesson.category) {
      case 'basics':
        return {
          bg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
          border: 'border-emerald-100 dark:border-emerald-900/30',
          indicator: 'bg-emerald-500',
        };
      case 'saving':
        return {
          bg: 'bg-pink-500/10 text-pink-600 dark:text-pink-400',
          border: 'border-pink-100 dark:border-pink-900/30',
          indicator: 'bg-pink-500',
        };
      case 'budgeting':
        return {
          bg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
          border: 'border-amber-100 dark:border-amber-900/30',
          indicator: 'bg-amber-500',
        };
      case 'crypto':
        return {
          bg: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400',
          border: 'border-cyan-100 dark:border-cyan-900/30',
          indicator: 'bg-cyan-500',
        };
      case 'safety':
        return {
          bg: 'bg-rose-500/10 text-rose-600 dark:text-rose-400',
          border: 'border-rose-100 dark:border-rose-900/30',
          indicator: 'bg-rose-500',
        };
      case 'spending':
        return {
          bg: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400',
          border: 'border-indigo-100 dark:border-indigo-900/30',
          indicator: 'bg-indigo-500',
        };
      default:
        return {
          bg: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
          border: 'border-purple-100 dark:border-purple-900/30',
          indicator: 'bg-purple-500',
        };
    }
  };

  const styleSet = getCategoryStyles();

  // Difficulty colors
  const getDiffStyles = () => {
    switch (lesson.difficulty) {
      case 'beginner':
        return 'bg-green-500/10 text-green-600 dark:text-green-400';
      case 'intermediate':
        return 'bg-blue-500/10 text-blue-600 dark:text-blue-400';
      case 'advanced':
        return 'bg-purple-500/10 text-purple-600 dark:text-purple-400';
      default:
        return 'bg-slate-500/10 text-slate-500';
    }
  };

  return (
    <motion.div
      whileHover={status !== 'locked' ? { y: -3, scale: 1.01 } : {}}
      transition={{ duration: 0.2 }}
      className={`relative w-full p-4.5 rounded-3xl border shadow-xs flex flex-col gap-3.5 overflow-hidden transition-all duration-300
        ${
          status === 'locked'
            ? 'opacity-65 select-none pointer-events-none ' + (theme === 'dark' ? 'bg-slate-900/40 border-slate-800' : 'bg-slate-100/60 border-slate-200')
            : status === 'completed'
            ? theme === 'dark'
              ? 'bg-slate-900 border-green-900/40'
              : 'bg-green-500/5 border-green-100'
            : theme === 'dark'
            ? 'bg-slate-900 border-slate-800'
            : 'bg-white border-slate-100'
        }`}
      id={`lesson-card-${lesson.id}`}
    >
      {/* Category and Difficulty Tag Header */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 overflow-hidden">
          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full truncate ${styleSet.bg}`}>
            {categoryLabel}
          </span>
          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full truncate ${getDiffStyles()}`}>
            {difficultyLabel}
          </span>
        </div>

        {/* Status indicator */}
        <div className="flex items-center">
          {status === 'locked' ? (
            <Lock size={14} className="text-slate-400" />
          ) : status === 'completed' ? (
            <div className="flex items-center gap-1 text-emerald-500 text-xs font-bold">
              <CheckCircle2 size={15} className="fill-emerald-500/10" />
              <span className="hidden sm:inline">{labels.completed || 'Completed'}</span>
            </div>
          ) : (
            <div className="flex items-center gap-1 text-blue-500 text-xs font-bold animate-pulse">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-500"></span>
              <span>{labels.available || 'Available'}</span>
            </div>
          )}
        </div>
      </div>

      {/* Main Content Info */}
      <div className="flex gap-4 items-start">
        {/* Large visual illustration card */}
        <div className={`text-2xl h-11 w-11 flex items-center justify-center rounded-2xl select-none flex-shrink-0 shadow-xs border
          ${
            theme === 'dark'
              ? 'bg-slate-800 border-slate-700/60'
              : 'bg-slate-50 border-slate-200/50'
          }`}
        >
          {lesson.emoji}
        </div>

        {/* Title & Description */}
        <div className="flex-1 min-w-0">
          <h4 className={`font-display font-bold text-sm leading-snug truncate
            ${theme === 'dark' ? 'text-slate-100' : 'text-slate-900'}`}
          >
            {title}
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mt-1 line-clamp-2">
            {description}
          </p>
        </div>
      </div>

      {/* Bottom reward tags and button footer */}
      <div className="flex items-center justify-between border-t border-dashed mt-1.5 pt-3.5 border-slate-100 dark:border-slate-800/80">
        
        {/* Estimated reward counts */}
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1 text-xs font-bold text-purple-600 dark:text-purple-400">
            <Sparkles size={13} className="fill-purple-500/10 text-purple-500" />
            <span>+{lesson.rewardXp} {labels.xp || 'XP'}</span>
          </div>
          <div className="flex items-center gap-1 text-xs font-bold text-amber-500">
            <span>🪙</span>
            <span>+{lesson.rewardPoints} {labels.pts || 'pts'}</span>
          </div>
        </div>

        {/* Start button */}
        <button
          onClick={() => status !== 'locked' && onStart(lesson.id)}
          disabled={status === 'locked'}
          className={`px-3.5 py-1.5 rounded-full text-xs font-extrabold flex items-center gap-1.5 cursor-pointer transition-all shadow-sm
            ${
              status === 'completed'
                ? theme === 'dark'
                  ? 'bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-755'
                  : 'bg-green-500/15 border border-green-200 text-green-700 hover:bg-green-500/20'
                : 'bg-brand-green border border-green-600 text-white hover:bg-green-600 active:scale-95'
            }`}
        >
          {status === 'completed' ? (
            <>
              {labels.completed || 'Review'}
            </>
          ) : (
            <>
              <span>{labels.start_lesson || 'Start'}</span>
              <Play size={11} className="fill-white" />
            </>
          )}
        </button>
      </div>
    </motion.div>
  );
}

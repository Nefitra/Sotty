/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type LanguageCode = 
  | 'en' 
  | 'ru' 
  | 'de' 
  | 'es' 
  | 'fr' 
  | 'it' 
  | 'pt' 
  | 'tr' 
  | 'ar' 
  | 'zh' 
  | 'hi'
  | 'bn';

export interface User {
  name: string;
  avatar: string;
  level: number;
  xp: number;
  points: number;
  spottyTokens: number;
  streak: number;
  lastDailyRewardClaimDate: string | null; // e.g., '2026-06-02'
  completedLessons: string[]; // ids of completed lessons
  completedMissions: string[]; // ids of completed missions
  claimedMissionRewards: string[]; // ids of claimed missions
  unlockedAchievements: string[]; // ids of achievements
  purchasedItems: string[]; // ids of store items
  referralsCount: number;
  language: LanguageCode;
  theme: 'light' | 'dark';
  isTonConnected: boolean;
  tonWalletAddress: string | null;
  learnedWords: string[]; // list of financial words discovered
  completedLessonsToday?: string[]; // list of lesson IDs completed on the current day
  completedTodayDate?: string | null; // YYYY-MM-DD
  dailyGoalTarget?: number; // target lessons count per day, e.g., 2
  dailyGoalHistory?: { date: string; completedCount: number; target: number; isMet: boolean; }[];
}

export interface LessonBlock {
  id: string;
  type: 'text' | 'tip' | 'quote' | 'warning';
  contentKey: string; // Key in translations (e.g. 'lesson_money_basics_b1')
  emoji?: string;
}

export interface QuizQuestion {
  id: string;
  questionKey: string; // Translation key
  optionsKeys: string[]; // Translation keys for options
  correctAnswerIndex: number;
  explanationKey: string; // Translation key for explanation
}

export interface Lesson {
  id: string;
  category: 'basics' | 'saving' | 'spending' | 'budgeting' | 'crypto' | 'safety' | 'trading';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  rewardXp: number;
  rewardPoints: number;
  rewardTokens: number;
  titleKey: string; // Translation key
  descKey: string; // Translation key
  emoji: string;
  blocks: LessonBlock[];
  quiz: QuizQuestion;
}

export interface Mission {
  id: string;
  key: string; // unique identification string
  type: 'daily' | 'weekly';
  titleKey: string;
  descKey: string;
  targetCount: number;
  rewardPoints: number;
  rewardXp: number;
  rewardTokens: number;
  actionType: 'lesson_completed' | 'quiz_answered' | 'invite_friend' | 'daily_checkin' | 'learn_financial_word';
}

export interface Achievement {
  id: string;
  titleKey: string;
  descKey: string;
  badgeEmoji: string;
  requirementXp?: number;
  requirementLessons?: number;
  requirementStreaks?: number;
}

export interface StoreItem {
  id: string;
  titleKey: string;
  descKey: string;
  costPoints: number;
  costTokens?: number;
  emoji: string;
  category: 'avatar' | 'title' | 'booster' | 'reward';
  isTonExclusive?: boolean;
}

export interface Transaction {
  id: string;
  amount: number;
  currency: 'XP' | 'PTS' | 'SPOTTY';
  type: 'earn' | 'spend';
  titleKey: string;
  date: string;
}

export interface DailyRewardDay {
  day: number;
  xpReward: number;
  pointsReward: number;
  tokensReward: number;
}


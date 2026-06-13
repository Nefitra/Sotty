/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  Award,
  Wallet,
  Zap,
  BookOpen,
  Gamepad2,
  ListTodo,
  ShoppingBag,
  User,
  ArrowLeft,
  Copy,
  Plus,
  Coins,
  Smile,
  ShieldCheck,
  ChevronRight,
  Sun,
  Moon,
  Info
} from 'lucide-react';

// Custom reusable components
import SpottyCharacter from './components/SpottyCharacter';
import BalanceDisplay from './components/BalanceDisplay';
import LessonCard from './components/LessonCard';
import MissionCard from './components/MissionCard';
import DailyReward from './components/DailyReward';
import BottomNavigation, { TabType } from './components/BottomNavigation';
import LanguageSwitcher from './components/LanguageSwitcher';
import QuizComponent from './components/QuizComponent';
import RewardEffects from './components/RewardEffects';
import confetti from 'canvas-confetti';
import {
  playCelebrationSound,
  playCoinDropSound,
  playXpBubbleSound
} from './utils/audio';

// Mock DB and Translations
import { translations, languageNames } from './translations';
import {
  mockLessons,
  mockMissions,
  mockAchievements,
  mockStoreItems,
  mockDailyRewards,
  mockScenarios
} from './mockData';
import { User as UserType, LanguageCode, Lesson, Mission } from './types';

// Default initial state for student
const DEFAULT_USER: UserType = {
  name: 'Sparky Cadet',
  avatar: '🐶',
  level: 1,
  xp: 45,
  points: 15,
  spottyTokens: 0,
  streak: 0,
  lastDailyRewardClaimDate: null,
  completedLessons: [],
  completedMissions: [],
  claimedMissionRewards: [],
  unlockedAchievements: [],
  purchasedItems: [],
  referralsCount: 0,
  language: 'en',
  theme: 'light',
  isTonConnected: false,
  tonWalletAddress: null,
  learnedWords: [],
  completedLessonsToday: [],
  completedTodayDate: null,
  dailyGoalTarget: 2,
};

// Key financial glossary dictionary to teach children financial vocabulary as requested
const FINANCIAL_GLOSSARY: Record<string, { term: string; definition: Record<string, string> }> = {
  barter: {
    term: 'Barter (Трог / Tausch)',
    definition: {
      en: 'Swapping items directly instead of using cash. For example, trading a toy car for a cute sticker book!',
      ru: 'Прямой обмен вещами без денег. Например, обмен твоей игрушечной машинки на красивый альбом наклеек!',
      de: 'Der direkte Tausch von Gegenständen ohne Geld. Z.B. das Tauschen eines Spielzeugautos gegen Sticker!',
      es: 'Intercambio directo de objetos sin dinero. ¡Por ejemplo, cambiar un juguete por una calcomanía!'
    }
  },
  inflation: {
    term: 'Inflation (Инфляция)',
    definition: {
      en: 'When prices of items rise slowly over time, meaning a single coin buys less candy tomorrow than it does today.',
      ru: 'Когда цены на вещи медленно растут со временем. Это значит, что завтра на ту же монетку пулучишь меньше конфет.',
      de: 'Wenn Preise für Dinge mit der Zeit steigen. Das bedeutet, dass man morgen weniger Süßigkeiten für dieselbe Münze bekommt.',
      es: 'Cuando los precios suben con el tiempo, lo que significa que tu moneda comprará menos dulces mañana.'
    }
  },
  compound_interest: {
    term: 'Compound Interest (Сложный процент)',
    definition: {
      en: 'Interest earned on your interest! It acts like a snowball, making your savings grow faster and faster over time.',
      ru: 'Процент на процент! Твои сбережения растут как снежный ком — всё быстрее со временем.',
      de: 'Zinseszins! Er wirkt wie ein Schneeball, der deine Ersparnisse immer schneller wachsen lässt.',
      es: '¡Interés ganado sobre tu interés! Funciona como una bola de nieve, haciendo que tus ahorros crezcan más rápido.'
    }
  }
};

export default function App() {
  // 1. Core States
  const [user, setUser] = useState<UserType>(DEFAULT_USER);
  const [activeTab, setActiveTab] = useState<TabType | 'welcome'>('welcome');
  const [currentLessonId, setCurrentLessonId] = useState<string | null>(null);
  
  // Modals / Overlays
  const [showLevelUp, setShowLevelUp] = useState<number | null>(null);
  const [particleTriggerId, setParticleTriggerId] = useState<string | null>(null);
  const [particleType, setParticleType] = useState<'xp' | 'point' | 'coin' | 'all'>('all');
  const [showWordUnlock, setShowWordUnlock] = useState<string | null>(null);
  const [showTonConnectModal, setShowTonConnectModal] = useState<boolean>(false);
  const [copyFeedback, setCopyFeedback] = useState<boolean>(false);
  const [rewardToast, setRewardToast] = useState<string | null>(null);

  // Quiz Streak / Multiplier States
  const [activeQuizStreak, setActiveQuizStreak] = useState<number>(0);
  const [activeQuizMultiplier, setActiveQuizMultiplier] = useState<number>(1.0);
  const [quizAnsweredCorrectly, setQuizAnsweredCorrectly] = useState<boolean>(false);

  // Mini-Game specific States
  const [scenarioIndex, setScenarioIndex] = useState<number>(0);
  const [gameStreak, setGameStreak] = useState<number>(0);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [showScenarioSolution, setShowScenarioSolution] = useState<boolean>(false);
  const [scenarioSuccess, setScenarioSuccess] = useState<boolean>(false);

  // Active language labels shorthand
  const labels = useMemo(() => {
    return { ...translations.en, ...(translations[user.language] || {}) };
  }, [user.language]);

  // 2. Load and Sync Local Storage & Sync with Telegram properties
  useEffect(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    try {
      const saved = localStorage.getItem('spotty_user_progress');
      if (saved) {
        const parsed = JSON.parse(saved);
        const hydrated = {
          ...parsed,
          completedLessonsToday: parsed.completedLessonsToday ?? [],
          completedTodayDate: parsed.completedTodayDate ?? todayStr,
          dailyGoalTarget: parsed.dailyGoalTarget ?? 2,
        };
        // Reset daily lessons progress if date changed
        if (hydrated.completedTodayDate !== todayStr) {
          hydrated.completedLessonsToday = [];
          hydrated.completedTodayDate = todayStr;
        }
        setUser(hydrated);
        // If they already completed welcome, go straight to dashboard
        if (hydrated.completedLessons?.length > 0 || hydrated.xp > DEFAULT_USER.xp) {
          setActiveTab('dashboard');
        }
      } else {
        // Set correctly initialized date tags for new users
        setUser((prev) => ({
          ...prev,
          completedLessonsToday: [],
          completedTodayDate: todayStr,
          dailyGoalTarget: 2,
        }));
      }
    } catch (e) {
      console.warn('Could not read from local storage', e);
    }

    // Connect with Telegram Mini App (Simulated integration)
    if (typeof window !== 'undefined' && (window as any).Telegram?.WebApp) {
      const tg = (window as any).Telegram.WebApp;
      tg.ready();
      tg.expand();
      if (tg.initDataUnsafe?.user) {
        const tgUser = tg.initDataUnsafe.user;
        setUser((prev) => ({
          ...prev,
          name: tgUser.first_name || prev.name,
        }));
      }
    }
  }, []);

  const saveUserProgress = (updatedUser: UserType) => {
    setUser(updatedUser);
    try {
      localStorage.setItem('spotty_user_progress', JSON.stringify(updatedUser));
    } catch (e) {
      console.warn('Could not write state to local storage', e);
    }

    // Check level ups continuously
    const expectedLevel = Math.floor(updatedUser.xp / 150) + 1;
    if (expectedLevel > updatedUser.level) {
      // Trigger dynamic level up animation & happy graduation fanfare!
      playCelebrationSound();
      setShowLevelUp(expectedLevel);
      setUser((prev) => {
        const withLevel = { ...prev, ...updatedUser, level: expectedLevel };
        localStorage.setItem('spotty_user_progress', JSON.stringify(withLevel));
        return withLevel;
      });
    }
  };

  // 3. XP & points claim actions helper
  const awardPointsAndXp = (xpAward: number, ptAward: number, tokenAward = 0, sourceText: string) => {
    const updated = {
      ...user,
      xp: user.xp + xpAward,
      points: user.points + ptAward,
      spottyTokens: user.spottyTokens + tokenAward,
    };
    saveUserProgress(updated);

    // Play sounds & trigger particle animations
    const triggerId = `award-${Date.now()}-${Math.random()}`;
    if (tokenAward > 0) {
      setParticleType('all');
      playCoinDropSound();
    } else if (xpAward > 0 && ptAward > 0) {
      setParticleType('all');
      playXpBubbleSound();
    } else if (xpAward > 0) {
      setParticleType('xp');
      playXpBubbleSound();
    } else if (ptAward > 0) {
      setParticleType('point');
      playXpBubbleSound();
    }
    setParticleTriggerId(triggerId);

    setRewardToast(`+${xpAward} XP, +${ptAward} ${labels.pts || 'pts'} (${sourceText})! 🦴`);
    setTimeout(() => setRewardToast(null), 3500);
  };

  // 4. Mission tracking helper
  // Verifies user count, triggers completed, but forces them to claim it manually inside "Missions" tab as requested!
  const triggerMissionAction = (actionType: Mission['actionType']) => {
    let changed = false;
    const currentCompleted = [...user.completedMissions];

    mockMissions.forEach((mission) => {
      if (mission.actionType === actionType && !currentCompleted.includes(mission.id)) {
        // Evaluate condition count.
        // e.g., m1 needs 1 lesson. User has CompletedLessons.length.
        let isAchieved = false;
        if (mission.id === 'm1') {
          isAchieved = user.completedLessons.length >= mission.targetCount;
        } else if (mission.id === 'm2') {
          // Quiz answered correctly can be simulated via completedLessons count * 1 + gameStreak
          isAchieved = (user.completedLessons.length + gameStreak) >= mission.targetCount;
        } else if (mission.id === 'm3') {
          isAchieved = user.referralsCount >= mission.targetCount;
        } else if (mission.id === 'm4') {
          isAchieved = user.learnedWords.length >= mission.targetCount;
        }

        if (isAchieved) {
          currentCompleted.push(mission.id);
          changed = true;
        }
      }
    });

    if (changed) {
      saveUserProgress({
        ...user,
        completedMissions: currentCompleted,
      });
    }
  };

  // 5. Daily rewardClaim Handler
  const claimDailyStreakReward = () => {
    const todayStr = new Date().toISOString().split('T')[0];
    if (user.lastDailyRewardClaimDate === todayStr) return;

    const nextStreak = user.streak >= 7 ? 1 : user.streak + 1;
    const rewardTier = mockDailyRewards[nextStreak - 1] || mockDailyRewards[0];

    const updatedUser = {
      ...user,
      streak: nextStreak,
      lastDailyRewardClaimDate: todayStr,
      xp: user.xp + rewardTier.xpReward,
      points: user.points + rewardTier.pointsReward,
      spottyTokens: user.spottyTokens + rewardTier.tokensReward,
    };

    saveUserProgress(updatedUser);
    triggerMissionAction('daily_checkin');

    // Trigger golden particles & custom audio chime
    playCelebrationSound();
    setParticleType('all');
    setParticleTriggerId(`daily-${Date.now()}-${Math.random()}`);

    setRewardToast(`Day ${rewardTier.day} bonus bone claimed! 🥇`);
    setTimeout(() => setRewardToast(null), 3000);
  };

  // 6. Lesson view handlers
  const handleStartLesson = (lessonId: string) => {
    setCurrentLessonId(lessonId);
    setQuizAnsweredCorrectly(false);
    setActiveQuizMultiplier(1.0);
    setActiveQuizStreak(0);
  };

  const handleLessonPassed = (lesson: Lesson) => {
    if (user.completedLessons.includes(lesson.id)) {
      // Review mode, just exit back
      setCurrentLessonId(null);
      return;
    }

    const multiplier = activeQuizMultiplier || 1.0;
    const bonusPoints = Math.round(lesson.rewardPoints * (multiplier - 1.0));
    const totalEarnedPoints = lesson.rewardPoints + bonusPoints;

    const todayStr = new Date().toISOString().split('T')[0];
    const todayLessons = user.completedLessonsToday ?? [];
    const updatedTodayLessons = todayLessons.includes(lesson.id)
      ? todayLessons
      : [...todayLessons, lesson.id];

    const target = user.dailyGoalTarget ?? 2;
    const reachedGoalNow = todayLessons.length < target && updatedTodayLessons.length >= target;
    const goalBonusPoints = reachedGoalNow ? 15 : 0;
    const goalBonusXp = reachedGoalNow ? 20 : 0;

    const updatedCompleted = [...user.completedLessons, lesson.id];
    const nextUser = {
      ...user,
      completedLessons: updatedCompleted,
      completedLessonsToday: updatedTodayLessons,
      completedTodayDate: todayStr,
      xp: user.xp + lesson.rewardXp + goalBonusXp,
      points: user.points + totalEarnedPoints + goalBonusPoints,
      spottyTokens: user.spottyTokens + lesson.rewardTokens,
    };

    setUser(nextUser);
    try {
      localStorage.setItem('spotty_user_progress', JSON.stringify(nextUser));
    } catch (e) {
      console.warn(e);
    }

    // Trigger full screen sparkles & positive sounds
    playCelebrationSound();
    setParticleType('all');
    setParticleTriggerId(`lesson-${Date.now()}-${Math.random()}`);

    if (reachedGoalNow) {
      // Trigger canvas confetti explosion
      confetti({
        particleCount: 150,
        spread: 90,
        origin: { y: 0.5 },
        colors: ['#10b981', '#fbbf24', '#3b82f6', '#ec4899', '#8b5cf6']
      });
    }

    // Trigger mission monitoring
    setTimeout(() => {
      // Force evaluate levels
      const expectedLevel = Math.floor(nextUser.xp / 150) + 1;
      if (expectedLevel > nextUser.level) {
        setShowLevelUp(expectedLevel);
        setUser(p => ({ ...p, level: expectedLevel }));
      }
      triggerMissionAction('lesson_completed');
      triggerMissionAction('quiz_answered');
    }, 400);

    let toastMsg = `Passed "${labels[lesson.titleKey] || lesson.titleKey}"! Got +${totalEarnedPoints} PTS 🏆`;
    if (bonusPoints > 0) {
      toastMsg = `Passed "${labels[lesson.titleKey] || lesson.titleKey}"! Got +${totalEarnedPoints} PTS (+${bonusPoints} Streak Bonus Multiplier of ${multiplier.toFixed(2)}x) 🏆🔥`;
    }
    if (reachedGoalNow) {
      toastMsg += ` 🎯 DAILY LEARNING GOAL ACHIEVED! Spotty rewarded you with +20 XP & +15 PTS! 🎉🐶`;
    }
    setRewardToast(toastMsg);
    setTimeout(() => setRewardToast(null), 4500);
    setCurrentLessonId(null);
  };

  const handleUpdateDailyGoalTarget = (newTarget: number) => {
    const updated = {
      ...user,
      dailyGoalTarget: newTarget,
    };
    saveUserProgress(updated);
  };

  // 7. Mission reward claiming
  const handleClaimMission = (missionId: string) => {
    if (user.claimedMissionRewards.includes(missionId)) return;
    const mission = mockMissions.find((m) => m.id === missionId);
    if (!mission) return;

    const nextUser = {
      ...user,
      claimedMissionRewards: [...user.claimedMissionRewards, missionId],
      xp: user.xp + mission.rewardXp,
      points: user.points + mission.rewardPoints,
      spottyTokens: user.spottyTokens + mission.rewardTokens,
    };

    saveUserProgress(nextUser);

    // Play sound and trigger coin/xp particle stream
    playCelebrationSound();
    setParticleType('all');
    setParticleTriggerId(`mission-${Date.now()}-${Math.random()}`);

    setRewardToast(`Claimed "${labels[mission.titleKey] || mission.titleKey}" reward successfully!`);
    setTimeout(() => setRewardToast(null), 3500);
  };

  // 8. Scenario Mini-game Handlers
  const handleScenarioOptionClick = (optionId: string) => {
    setSelectedOptionId(optionId);
  };

  const handleScenarioSubmit = () => {
    if (!selectedOptionId) return;

    const currentScen = mockScenarios[scenarioIndex];
    const pickedOption = currentScen.options.find((o) => o.id === selectedOptionId);
    if (!pickedOption) return;

    setShowScenarioSolution(true);
    setScenarioSuccess(pickedOption.isCorrect);

    if (pickedOption.isCorrect) {
      const nextStr = gameStreak + 1;
      setGameStreak(nextStr);
      awardPointsAndXp(pickedOption.xpGained, pickedOption.pointsGained, 0, 'Scenario win');
      triggerMissionAction('quiz_answered');
    } else {
      setGameStreak(0);
      awardPointsAndXp(pickedOption.xpGained, pickedOption.pointsGained, 0, 'Spotty consultation feedback');
    }
  };

  const handleNextScenario = () => {
    setSelectedOptionId(null);
    setShowScenarioSolution(false);
    setScenarioIndex((prev) => (prev + 1) % mockScenarios.length);
  };

  // 9. Store Purchasing Logic
  const handleBuyStoreItem = (item: typeof mockStoreItems[0]) => {
    if (user.purchasedItems.includes(item.id)) {
      setRewardToast(labels.item_already_owned || 'You already own this item!');
      setTimeout(() => setRewardToast(null), 2500);
      return;
    }

    if (item.isTonExclusive && !user.isTonConnected) {
      setShowTonConnectModal(true);
      return;
    }

    if (user.points < item.costPoints) {
      setRewardToast(labels.not_enough_points || 'Needs more points!');
      setTimeout(() => setRewardToast(null), 2500);
      return;
    }

    const nextUser = {
      ...user,
      points: user.points - item.costPoints,
      purchasedItems: [...user.purchasedItems, item.id],
    };

    saveUserProgress(nextUser);
    setRewardToast(labels.item_purchased || 'Item obtained successfully! 🎁');
    setTimeout(() => setRewardToast(null), 3000);
  };

  // 10. Point conversion to Spotty Tokens
  const convertPointsToTokens = () => {
    if (user.points < 100) {
      setRewardToast(labels.not_enough_points || 'Need more points!');
      setTimeout(() => setRewardToast(null), 2000);
      return;
    }

    const nextUser = {
      ...user,
      points: user.points - 100,
      spottyTokens: user.spottyTokens + 1,
    };
    saveUserProgress(nextUser);

    // Audio jingle and golden particles stream
    playCoinDropSound();
    setParticleType('coin');
    setParticleTriggerId(`convert-${Date.now()}-${Math.random()}`);

    setRewardToast('Successful Points-to-Token exchange! 🦄');
    setTimeout(() => setRewardToast(null), 3000);
  };

  // 11. Copy Referral link Simulation
  const simulateInviteFriend = () => {
    const nextReferrals = user.referralsCount + 1;
    const nextUser = {
      ...user,
      referralsCount: nextReferrals,
      points: user.points + 25, // bonus 25 points for invite
    };
    saveUserProgress(nextUser);
    triggerMissionAction('invite_friend');

    setRewardToast('Friend Simulated Joining! +25 Points Awarded! 🎉');
    setTimeout(() => setRewardToast(null), 3500);
  };

  const copyReferralCode = () => {
    navigator.clipboard.writeText(`https://t.me/spotty_learning_bot?start=ref_${user.name.replace(/\s+/g, '_')}`);
    setCopyFeedback(true);
    setTimeout(() => setCopyFeedback(false), 2000);
  };

  // 12. Learning financial word trigger
  const learnFinancialWord = (wordKey: string) => {
    if (user.learnedWords.includes(wordKey)) {
      setShowWordUnlock(wordKey);
      return;
    }

    const updatedWords = [...user.learnedWords, wordKey];
    const nextUser = {
      ...user,
      learnedWords: updatedWords
    };
    saveUserProgress(nextUser);
    triggerMissionAction('learn_financial_word');
    setShowWordUnlock(wordKey);
  };

  // 13. Simulated TON Connect Action
  const handleFakeTonConnect = () => {
    const mockAddr = 'EQA2n9vK_Q-T8L82H-X5f3k1uM0U-9n9z8k7L6r_1102U3';
    setUser((prev) => ({
      ...prev,
      isTonConnected: true,
      tonWalletAddress: mockAddr
    }));
    setShowTonConnectModal(false);
    setRewardToast('TON Wallet Securely Linked! 🔐');
    setTimeout(() => setRewardToast(null), 2500);
  };

  const handleDisconnectTon = () => {
    setUser((prev) => ({
      ...prev,
      isTonConnected: false,
      tonWalletAddress: null
    }));
    setRewardToast('TON Wallet Disconnected.');
    setTimeout(() => setRewardToast(null), 2000);
  };

  // Quick helper to check if today's reward is done
  const todayStr = new Date().toISOString().split('T')[0];
  const hasClaimedToday = user.lastDailyRewardClaimDate === todayStr;

  // Render selected Active Lesson Screen
  const activeLesson = currentLessonId ? mockLessons.find((l) => l.id === currentLessonId) : null;

  return (
    <div
      className={`min-h-screen w-full flex items-center justify-center p-0 md:p-6 transition-colors duration-500 relative select-none overflow-hidden
        ${user.theme === 'dark' ? 'bg-[#030712] text-slate-100' : 'bg-[#eef3f9] text-slate-900'}`}
      id="spotty-root-canvas"
    >
      {/* PERSPECTIVE NEON GRID & LIGHTING (Spotty Logo Style) on Wide screens */}
      <div className="absolute inset-0 pointer-events-none hidden md:block overflow-hidden" id="desktop-logo-decorations">
        {/* Soft glowing ambient orbs */}
        <div className="absolute top-[-10%] left-[-10%] w-[45%] h-[45%] rounded-full bg-cyan-500/10 blur-[130px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-pink-500/10 blur-[150px] animate-pulse" />

        {/* Diagonal glowing rain/neon streaks matching the logo */}
        <div className="absolute top-10 right-[15%] w-0.5 h-36 bg-gradient-to-b from-[#22d3ee] to-transparent rotate-12 opacity-30 animate-pulse" />
        <div className="absolute top-36 left-[10%] w-0.5 h-48 bg-gradient-to-b from-[#ec4899] to-transparent rotate-12 opacity-25" />
        <div className="absolute bottom-20 left-[20%] w-0.5 h-28 bg-gradient-to-b from-[#8b5cf6] to-transparent rotate-[15deg] opacity-25" />
        <div className="absolute bottom-40 right-[25%] w-0.5 h-40 bg-gradient-to-b from-[#06b6d4] to-transparent rotate-[10deg] opacity-20 animate-pulse" />

        {/* Cyber Floor Grid Perspective */}
        {user.theme === 'dark' && (
          <div 
            className="absolute bottom-0 left-0 right-0 h-[30%] opacity-[0.22] pointer-events-none"
            style={{
              perspective: '500px',
              transform: 'rotateX(75deg)',
              transformOrigin: 'bottom',
            }}
          />
        )}
        
        {/* Floating Playful Tiny Star Badges */}
        <span className="absolute top-1/4 left-[8%] text-2xl opacity-15 animate-ping">✨</span>
        <span className="absolute bottom-1/3 right-[8%] text-3xl opacity-20 animate-bounce">⭐</span>
      </div>

      {/* Centered Telegram App Mock Simulator Screen Chassis */}
      <div
        className={`w-full max-w-sm md:max-w-md min-h-screen md:min-h-[820px] md:h-[840px] flex flex-col justify-start relative transition-all duration-300 md:rounded-[42px] md:shadow-[0_25px_60px_rgba(0,0,0,0.45)] md:border-[10px] md:border-slate-800 dark:md:border-slate-900 overflow-hidden pb-20 ${
          user.theme === 'dark' ? 'bg-[#090d16] text-slate-100' : 'bg-[#fcfbf9] text-slate-900'
        }`}
        id="app-device-shell"
      >
        {/* Mock phone status notches decoration */}
        <div className="hidden md:flex absolute top-0 left-0 right-0 h-6 bg-slate-800 dark:bg-slate-900 border-b border-transparent items-center justify-between px-6 text-[10px] font-black tracking-wider text-slate-400 z-50 pointer-events-none">
          <span>9:41 🐶</span>
          <div className="w-24 h-4.5 bg-slate-900 dark:bg-slate-950 rounded-b-2xl absolute top-0 left-1/2 -translate-x-1/2" />
          <div className="flex items-center gap-1.5">
            <span>LTE</span>
            <span>🔋 100%</span>
          </div>
        </div>

        {/* Dynamic Inner Application Scroll and Frame Container */}
        <div className="flex-1 flex flex-col overflow-y-auto w-full relative pt-0 md:pt-6">
          
          {/* Upper Status Header bar */}
          <header
            className={`w-full px-4 py-3.5 flex items-center justify-between border-b transition-colors shrink-0
              ${user.theme === 'dark' ? 'bg-[#0b1122]/90 border-slate-850/60' : 'bg-white border-slate-150'}`}
            id="app-global-header"
          >
            <div className="flex items-center gap-2">
              {activeTab !== 'welcome' && (
                <div className="h-7 w-7 rounded-full bg-brand-green/10 text-brand-green flex items-center justify-center font-bold text-xs select-none">
                  🐶
                </div>
              )}
              <span className="font-display font-black text-base tracking-tight text-brand-green">Spotty Academy</span>
            </div>

            {/* Action controllers (Theme toggler, Language Switcher) */}
            <div className="flex items-center gap-2">
              
              {/* Light/Dark mode Switcher */}
              <button
                onClick={() => setUser(p => ({ ...p, theme: p.theme === 'light' ? 'dark' : 'light' }))}
                className={`p-1.5 rounded-full border transition-all cursor-pointer text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200
                  ${user.theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}
                id="theme-toggle-btn"
              >
                {user.theme === 'dark' ? <Sun size={13} /> : <Moon size={13} />}
              </button>

              {/* Lang switcher */}
              <LanguageSwitcher
                currentLanguage={user.language}
                onLanguageChange={(lang) => saveUserProgress({ ...user, language: lang })}
                theme={user.theme}
              />
            </div>
          </header>

          {/* Primary content card wrapper modeled representing Telegram Mini App layout */}
          <main className="w-full px-4 pt-4 flex-1 flex flex-col gap-4">
            
            <AnimatePresence mode="wait">
          
          {/* SCREEN A: Welcome Screen */}
          {activeTab === 'welcome' && (
            <motion.div
              key="welcome-screen"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="flex-1 flex flex-col items-center justify-center text-center py-6"
              id="screen-welcome"
            >
              <div className="relative mb-6">
                <SpottyCharacter mood="excited" size={170} />
                <span className="absolute bottom-0 right-3 bg-brand-yellow font-extrabold text-[10px] px-2.5 py-1 rounded-full border-2 border-white shadow-sm rotate-6">
                  Finances!
                </span>
              </div>

              <h1 className="font-display font-black text-3xl leading-none text-brand-green tracking-tight">
                Spotty
              </h1>
              
              <p className="text-sm font-bold text-slate-500 mt-2 tracking-wide uppercase">
                {labels.app_slogan || 'Learn. Play. Earn knowledge.'}
              </p>

              {/* Dynamic Spotty friendly introduction bubble */}
              <div className={`mt-6 p-4 rounded-3xl relative text-xs leading-relaxed max-w-xs border rounded-br-none font-medium transition-all duration-300
                ${
                  user.theme === 'dark'
                    ? 'bg-slate-900 border-slate-850 text-slate-300'
                    : 'bg-white border-slate-150 text-slate-700'
                }`}
              >
                <p>{labels.welcome_spotty_intro}</p>
                {/* bubble pointer arrow */}
                <div className={`absolute bottom-0 right-4 h-3.5 w-3.5 translate-y-[8px] rotate-45 border-r border-b
                  ${user.theme === 'dark' ? 'bg-slate-900 border-slate-850' : 'bg-white border-slate-150'}`}
                />
              </div>

              {/* Action play button */}
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setActiveTab('dashboard')}
                className="w-full max-w-xs mt-10 bg-brand-green border border-green-600 text-white font-black text-sm py-4 rounded-3xl cursor-pointer shadow-md shadow-green-500/10 hover:bg-green-600 hover:brightness-105 active:scale-95 transition-all text-center uppercase tracking-wider"
                id="welcome-start-learning-btn"
              >
                {labels.start_learning || 'Start Learning'}
              </motion.button>

              <p className="text-[10px] font-bold text-slate-400 mt-5 uppercase tracking-widest">
                Telegram ready • Mini App client v1.0
              </p>
            </motion.div>
          )}

          {/* SCREEN B: Main Dashboard Tab */}
          {activeTab === 'dashboard' && !currentLessonId && (
            <motion.div
              key="dashboard-screen"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex flex-col gap-4"
              id="screen-dashboard"
            >
              {/* User overview block */}
              <div className="flex items-center justify-between gap-3 font-display">
                <div className="flex items-center gap-3">
                  <div className="h-11 w-11 bg-brand-green/20 rounded-2xl flex items-center justify-center text-xl font-bold select-none border border-green-500/10 shadow-sm">
                    {user.purchasedItems.includes('store_item_🎓') ? '🎓' : '🐶'}
                  </div>
                  <div>
                    <h2 className="font-extrabold text-sm leading-tight flex items-center gap-1.5">
                      <span>{user.name}</span>
                      {user.purchasedItems.includes('store_item_🛡️') && (
                        <span className="text-xs">🛡️</span>
                      )}
                    </h2>
                    <p className="text-[11px] font-bold text-slate-400 mt-0.5">
                      {labels.current_level?.replace('{{level}}', String(user.level)) || `Level ${user.level}`} (Financial Pupil)
                    </p>
                  </div>
                </div>

                {/* Study Streak Badge counter */}
                <div className="flex items-center gap-1 bg-amber-500/10 border border-amber-500/20 text-amber-500 text-[11px] font-black tracking-tight px-2.5 py-1.5 rounded-full shadow-xs">
                  <span>🔥</span>
                  <span>{labels.streak?.replace('{{count}}', String(user.streak)) || `${user.streak}-Day Streak!`}</span>
                </div>
              </div>

              {/* Dynamic bento points visualizer */}
              <BalanceDisplay
                xp={user.xp}
                points={user.points}
                tokens={user.spottyTokens}
                language={user.language}
                theme={user.theme}
                onConvertClick={convertPointsToTokens}
                showConvertPrompt={true}
              />

              {/* Level XP Progress Meter bar */}
              <div className={`p-4 rounded-3xl border flex flex-col gap-2
                ${user.theme === 'dark' ? 'bg-slate-900 border-slate-850' : 'bg-white border-slate-100'}`}
              >
                <div className="flex justify-between items-center text-[10px] font-extrabold text-slate-400">
                  <span className="uppercase tracking-wider">{labels.daily_progress || 'Level Progress'}</span>
                  <span>{user.xp % 150} / 150 XP</span>
                </div>
                <div className="w-full h-3 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden relative">
                  <div
                    className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full transition-all duration-300"
                    style={{ width: `${((user.xp % 150) / 150) * 100}%` }}
                  />
                </div>
              </div>

              {/* Daily Goal circular progress tracker */}
              {(() => {
                const target = user.dailyGoalTarget ?? 2;
                const completedTodayList = user.completedLessonsToday ?? [];
                const completedCount = completedTodayList.length;
                const percentage = Math.min(100, Math.round((completedCount / target) * 100));

                const radius = 28;
                const stroke = 5;
                const strokeCircumference = radius * 2 * Math.PI;
                const offset = strokeCircumference - (percentage / 100) * strokeCircumference;

                const isCompleted = completedCount >= target;

                return (
                  <div className={`p-4 rounded-3xl border flex flex-col sm:flex-row items-center gap-4.5 min-h-[110px] relative overflow-hidden transition-all duration-300
                    ${user.theme === 'dark' 
                      ? 'bg-slate-900 border-slate-850' 
                      : 'bg-white border-slate-100'}`}
                    id="dashboard-daily-goal-card"
                  >
                    {isCompleted && (
                      <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-cyan-500/5 pointer-events-none animate-pulse" />
                    )}

                    {/* SVG Circular Progress tracker */}
                    <div className="relative flex-shrink-0 flex items-center justify-center">
                      <svg className="w-20 h-20 transform -rotate-90">
                        <circle
                          className={user.theme === 'dark' ? 'text-slate-800' : 'text-slate-100'}
                          strokeWidth={stroke}
                          stroke="currentColor"
                          fill="transparent"
                          r={radius}
                          cx="40"
                          cy="40"
                        />
                        <motion.circle
                          className={isCompleted ? "text-emerald-500" : "text-brand-blue"}
                          strokeWidth={stroke}
                          strokeDasharray={strokeCircumference}
                          initial={{ strokeDashoffset: strokeCircumference }}
                          animate={{ strokeDashoffset: offset }}
                          transition={{ duration: 0.8, ease: "easeOut" }}
                          strokeLinecap="round"
                          stroke="currentColor"
                          fill="transparent"
                          r={radius}
                          cx="40"
                          cy="40"
                        />
                      </svg>
                      {/* Interactive Center Indicator */}
                      <div className="absolute flex flex-col items-center justify-center">
                        {isCompleted ? (
                          <motion.span 
                            initial={{ scale: 0.3, rotate: -45 }}
                            animate={{ scale: 1, rotate: 0 }}
                            className="text-2xl"
                          >
                            🏆
                          </motion.span>
                        ) : (
                          <span className={`text-sm font-black tracking-tight ${user.theme === 'dark' ? 'text-slate-100' : 'text-slate-900'}`}>
                            {completedCount}<span className="text-[10px] text-slate-400 font-bold mx-0.5">/</span>{target}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Goal Description Text */}
                    <div className="flex-1 text-center sm:text-left">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center justify-center sm:justify-start gap-1.5">
                          <span className="text-base">🎯</span>
                          <h4 className={`font-black text-sm ${user.theme === 'dark' ? 'text-slate-100' : 'text-slate-900'}`}>
                            {labels.daily_lesson_goal || 'Daily Lesson Goal'}
                          </h4>
                        </div>

                        {/* Interactive Pill Selector to adjust goal */}
                        <div className="flex items-center justify-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                          <span className="text-[9px] font-bold text-slate-400 px-1 uppercase">{labels.goal_short || 'Goal'}:</span>
                          {[1, 2, 3, 4].map((pillVal) => (
                            <button
                              key={pillVal}
                              onClick={() => handleUpdateDailyGoalTarget(pillVal)}
                              className={`text-[10px] font-extrabold w-5.5 h-5.5 rounded-lg flex items-center justify-center transition-all cursor-pointer
                                ${target === pillVal
                                  ? 'bg-brand-blue text-white shadow-xs'
                                  : 'text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-750'
                                }`}
                              id={`goal-pill-${pillVal}`}
                            >
                              {pillVal}
                            </button>
                          ))}
                        </div>
                      </div>

                      <p className={`text-xs mt-1 leading-relaxed ${user.theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>
                        {isCompleted ? (
                          <span className="font-semibold text-emerald-600 dark:text-emerald-400 block animate-bounce mt-1">
                            ✨ {labels.daily_goal_complete || "Objective reached! You got extra +20 XP & +15 PTS! Spotty says yay!"} 🐶🎉
                          </span>
                        ) : (
                          <span>
                            {labels.daily_goal_prompt?.replace('{{count}}', String(target - completedCount)) || 
                              `You're on track! Read and correct quizzes for ${target - completedCount} more lessons to hit today's objective.`}
                          </span>
                        )}
                      </p>

                      <div className="mt-2.5 flex items-center justify-center sm:justify-start gap-1.5">
                        <div className="h-1.5 w-1.5 rounded-full bg-brand-green animate-ping" />
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                          {isCompleted ? 'Superlative effort today!' : `${percentage}% Completed`}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Mascot interactive advice panel */}
              <div className={`p-4.5 rounded-3xl border flex gap-4 items-center relative
                ${user.theme === 'dark' ? 'bg-slate-900 border-slate-850' : 'bg-white border-slate-100'}`}
              >
                <SpottyCharacter
                  mood={user.streak > 0 ? 'saving' : 'neutral'}
                  size={64}
                  className="flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className={`text-xs italic leading-relaxed font-semibold
                    ${user.theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}
                  >
                    "{user.streak > 0 
                      ? (labels.spotty_dashboard_tip_streak || "Awesome job! Gold coins compounding streaks require patience. Let's tackle today's safety online lesson to bolster our castle defenses!") 
                      : (labels.spotty_dashboard_tip_no_streak || "Did you know shell money was used thousands of years ago? Grab a lesson below and study!")}"
                  </p>
                </div>
              </div>

              {/* Vocabulary Building Block section (Unlocks and teaches core glossary terms) */}
              <div className="flex flex-col gap-2 mt-1">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                  {labels.spotty_financial_dictionary || 'Spotty Financial Dictionary'}
                </span>
                <div className="grid grid-cols-3 gap-2">
                  {Object.keys(FINANCIAL_GLOSSARY).map((wordKey) => {
                    const data = FINANCIAL_GLOSSARY[wordKey];
                    const isLearned = user.learnedWords.includes(wordKey);

                    return (
                      <button
                        key={wordKey}
                        onClick={() => learnFinancialWord(wordKey)}
                        className={`p-2.5 rounded-2xl cursor-pointer text-center text-xs font-bold border transition-all duration-200 truncate
                          ${
                            isLearned
                              ? 'bg-brand-green/10 text-brand-green border-brand-green/35'
                              : user.theme === 'dark'
                              ? 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                              : 'bg-white border-slate-150 text-slate-500 hover:bg-slate-50'
                          }`}
                      >
                        {wordKey === 'barter' 
                          ? (labels.glossary_barter || 'Barter') 
                          : wordKey === 'inflation' 
                          ? (labels.glossary_inflation || 'Inflation') 
                          : (labels.glossary_compound_interest || 'Compound')} {isLearned ? '✓' : '🔒'}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Inline collapsible or direct Daily Reward Block */}
              <DailyReward
                streak={user.streak}
                hasClaimedToday={hasClaimedToday}
                onClaim={claimDailyStreakReward}
                language={user.language}
                theme={user.theme}
              />

              {/* Primary dashboard navigation tiles (Bento navigation shortcut links) */}
              <div className="flex flex-col gap-2 mt-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                  {labels.quick_shortcuts || 'Quick Shortcuts'}
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setActiveTab('lessons')}
                    className="p-3 bg-brand-green/10 text-brand-green rounded-2xl text-xs font-black cursor-pointer flex items-center justify-between border border-transparent hover:border-brand-green/20"
                  >
                    <span>📚 {labels.shortcut_lessons || 'Lessons Area'}</span>
                    <ChevronRight size={13} />
                  </button>
                  <button
                    onClick={() => setActiveTab('missions')}
                    className="p-3 bg-purple-500/10 text-purple-600 rounded-2xl text-xs font-black cursor-pointer flex items-center justify-between border border-transparent hover:border-purple-500/20"
                  >
                    <span>🎯 {labels.shortcut_missions || 'Active Missions'}</span>
                    <ChevronRight size={13} />
                  </button>
                  <button
                    onClick={() => setActiveTab('game')}
                    className="p-3 bg-amber-500/10 text-amber-600 rounded-2xl text-xs font-black cursor-pointer flex items-center justify-between border border-transparent hover:border-amber-500/20"
                  >
                    <span>🎮 {labels.shortcut_game || 'Game Arena'}</span>
                    <ChevronRight size={13} />
                  </button>
                  <button
                    onClick={() => {
                      // We toggle a custom secondary screen of STORE
                      setActiveTab('profile');
                    }}
                    className="p-3 bg-cyan-500/10 text-cyan-600 rounded-2xl text-xs font-black cursor-pointer flex items-center justify-between border border-transparent hover:border-cyan-500/20"
                  >
                    <span>👤 {labels.shortcut_profile || 'My Accomplishments'}</span>
                    <ChevronRight size={13} />
                  </button>
                </div>
              </div>

              {/* TON Connect simulation pane */}
              <div className={`p-4 rounded-3xl border flex flex-col gap-3
                ${
                  user.isTonConnected
                    ? 'border-cyan-500/20 bg-cyan-500/5'
                    : user.theme === 'dark'
                    ? 'bg-slate-900 border-slate-800'
                    : 'bg-white border-slate-100'
                }`}
              >
                <div className="flex items-center justify-between gap-2.5">
                  <div className="flex items-center gap-2">
                    <Wallet size={16} className="text-cyan-500" />
                    <span className="text-xs font-black uppercase tracking-wider text-cyan-500">{labels.ton_blockchain_space || 'TON Blockchain Space'}</span>
                  </div>
                  {user.isTonConnected ? (
                    <span className="text-[9px] font-black bg-cyan-500/15 text-cyan-600 px-2 py-0.5 rounded-full select-none">
                      {labels.wallet_connected || 'CONNECTED ✓'}
                    </span>
                  ) : (
                    <span className="text-[9px] font-black bg-slate-150 text-slate-500 dark:bg-slate-800 dark:text-slate-400 px-2.5 py-0.5 rounded-full select-none">
                      {labels.locked_ton || 'UNCONNECTED'}
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-400 leading-snug">
                  {labels.ton_connect_desc || 'Connect secure TON Wallet to double multipliers and access exclusive collectibles!'}
                </p>

                {user.isTonConnected ? (
                  <div className="flex items-center justify-between gap-2 mt-1 bg-slate-800/10 dark:bg-slate-950/40 p-2.5 rounded-2xl">
                    <span className="text-[10px] font-mono text-slate-500 truncate select-all">{user.tonWalletAddress}</span>
                    <button
                      onClick={handleDisconnectTon}
                      className="text-[10px] font-bold text-red-500 hover:underline px-2 py-0.5 cursor-pointer"
                    >
                      {labels.disconnect_wallet_btn || 'Disconnect'}
                    </button>
                  </div>
                ) : (
                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowTonConnectModal(true)}
                    className="w-full py-2.5 bg-cyan-500 border border-cyan-600 hover:bg-cyan-600 text-white font-extrabold text-xs rounded-2xl cursor-pointer text-center flex items-center justify-center gap-1.5 transition-all"
                  >
                    <span>{labels.connect_wallet || 'Connect TON Web3 Wallet'}</span>
                  </motion.button>
                )}
              </div>
            </motion.div>
          )}

          {/* SCREEN C: Lessons Tab (Available Lessons) */}
          {activeTab === 'lessons' && !currentLessonId && (
            <motion.div
              key="lessons-screen"
              initial={{ opacity: 0, scale: 0.99 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col gap-3.5"
              id="screen-lessons"
            >
              <div className="font-display">
                <h2 className="font-black text-lg">{labels.lessons_tab || 'Financial Academy'}</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {labels.lessons_tab_desc || 'Complete interactive lessons with final verification questions to increase asset ratios!'}
                </p>
              </div>

              {/* Render listings categorized */}
              <div className="flex flex-col gap-3">
                {mockLessons.map((lesson) => {
                  let status: 'locked' | 'available' | 'completed' = 'locked';
                  
                  if (user.completedLessons.includes(lesson.id)) {
                    status = 'completed';
                  } else if (lesson.id === 'l1' || user.completedLessons.length >= mockLessons.findIndex(l => l.id === lesson.id)) {
                    // Previous lesson is completed, or it's lesson 1: unlock
                    status = 'available';
                  }

                  return (
                    <LessonCard
                      key={lesson.id}
                      lesson={lesson}
                      status={status}
                      onStart={handleStartLesson}
                      language={user.language}
                      theme={user.theme}
                    />
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* SCREEN D: Active Interactive Lesson view */}
          {currentLessonId && activeLesson && (
            <motion.div
              key="lesson-active-screen"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              className="flex flex-col gap-4 py-1"
              id="screen-active-lesson-player"
            >
              {/* Back out Button */}
              <button
                onClick={() => setCurrentLessonId(null)}
                className="flex items-center gap-1 text-xs font-bold text-slate-500 dark:text-slate-400 self-start cursor-pointer hover:underline"
              >
                <ArrowLeft size={14} />
                <span>{labels.back_to_lessons || 'Cancel Lesson'}</span>
              </button>

              {/* Title Header */}
              <div className="flex items-center gap-3 font-display">
                <span className="text-3xl leading-none">{activeLesson.emoji}</span>
                <div>
                  <h2 className="font-black text-base text-slate-900 dark:text-white leading-tight">
                    {labels[activeLesson.titleKey] || activeLesson.titleKey}
                  </h2>
                  <p className="text-[11px] font-semibold text-slate-400 mt-1 uppercase tracking-wider">
                    {labels[activeLesson.category] || activeLesson.category}
                  </p>
                </div>
              </div>

              {/* Structured child-friendly story blocks punctuated with micro SVG illustrations in Spotty character */}
              <div className="flex flex-col gap-3.5 mt-2" id="lesson-text-blocks-flow">
                {activeLesson.blocks.map((block) => {
                  const bodyText = labels[block.contentKey] || block.contentKey;
                  
                  if (block.type === 'tip') {
                    return (
                      <div
                        key={block.id}
                        className="p-4 rounded-3xl border border-amber-200 bg-amber-500/5 text-amber-900 dark:text-amber-300 flex items-start gap-3 text-xs leading-relaxed"
                      >
                        <span className="text-lg leading-none mt-0.5">{block.emoji || '💡'}</span>
                        <p className="font-medium">{bodyText}</p>
                      </div>
                    );
                  }

                  if (block.type === 'warning') {
                    return (
                      <div
                        key={block.id}
                        className="p-4 rounded-3xl border border-rose-200 bg-rose-500/5 text-rose-950 dark:text-rose-300 flex items-start gap-3 text-xs leading-relaxed"
                      >
                        <span className="text-lg leading-none mt-0.5">⚠️</span>
                        <p className="font-semibold">{bodyText}</p>
                      </div>
                    );
                  }

                  if (block.type === 'quote') {
                    return (
                      <div
                        key={block.id}
                        className="p-4 rounded-3xl border border-blue-100 bg-blue-500/5 text-blue-900 dark:text-blue-300 flex items-start gap-3 italic text-xs leading-relaxed"
                      >
                        <span className="text-xl opacity-40 leading-none">“</span>
                        <p className="font-medium">{bodyText}</p>
                      </div>
                    );
                  }

                  return (
                    <p
                      key={block.id}
                      className="text-xs leading-relaxed text-slate-600 dark:text-slate-300 font-semibold p-1 px-2.5"
                    >
                      {bodyText}
                    </p>
                  );
                })}
              </div>

              {/* Dynamic Spotty character reacting alongside lesson details */}
              <div className="w-full flex justify-center py-4 my-2 border-y border-dashed border-slate-100 dark:border-slate-800">
                <div className="flex flex-col items-center text-center max-w-xs gap-1.5">
                  <SpottyCharacter mood="smart" size={96} />
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                    {labels.scroll_for_challenge || 'Keep scrolling down for the challenge!'}
                  </p>
                </div>
              </div>

              {/* Quiz component blocks graduation */}
              <QuizComponent
                quiz={activeLesson.quiz}
                onCorrectAnswer={(streak, multiplier) => {
                  setActiveQuizStreak(streak);
                  setActiveQuizMultiplier(multiplier);
                  setQuizAnsweredCorrectly(true);
                }}
                language={user.language}
                theme={user.theme}
              />

              {/* Finish & Claim action panel (unlocks only after passing the quiz) */}
              <div className={`p-4 rounded-3xl border text-center flex flex-col items-center gap-3 mt-4 transition-all duration-300
                ${
                  user.completedLessons.includes(activeLesson.id) 
                  ? 'border-green-200 bg-green-500/5' 
                  : quizAnsweredCorrectly
                  ? 'border-cyan-200 bg-cyan-500/5 ring-1 ring-cyan-400/20'
                  : user.theme === 'dark' 
                  ? 'bg-slate-900/60 border-slate-800' 
                  : 'bg-slate-50/50 border-slate-200'
                }`}
              >
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  {user.completedLessons.includes(activeLesson.id)
                    ? (labels.reviewing_awesome || 'Reviewing is awesome! You already got the certificates.')
                    : quizAnsweredCorrectly
                    ? `Spotty Quiz approved! Consecutives Streak: ${activeQuizStreak} 🔥 Multiplier: ${activeQuizMultiplier.toFixed(2)}x. Claim your rewards below! 🐶✨`
                    : (labels.done_reading_hint || 'Done reading? Correctly submit the Spotty challenge quiz elements above to enable validation.')}
                </p>

                <motion.button
                  whileHover={(!user.completedLessons.includes(activeLesson.id) && !quizAnsweredCorrectly) ? {} : { scale: 1.02 }}
                  whileTap={(!user.completedLessons.includes(activeLesson.id) && !quizAnsweredCorrectly) ? {} : { scale: 0.98 }}
                  disabled={!user.completedLessons.includes(activeLesson.id) && !quizAnsweredCorrectly}
                  onClick={() => handleLessonPassed(activeLesson)}
                  className={`w-full py-3 font-black text-xs rounded-2xl cursor-pointer text-center uppercase tracking-wider transition-all
                    ${
                      (!user.completedLessons.includes(activeLesson.id) && !quizAnsweredCorrectly)
                        ? 'bg-slate-200 text-slate-400 dark:bg-slate-800 dark:text-slate-600 cursor-not-allowed border-none'
                        : 'bg-brand-green hover:bg-green-600 text-white shadow-md shadow-emerald-500/10'
                    }`}
                  id="final-claim-rewards-btn"
                >
                  {user.completedLessons.includes(activeLesson.id)
                    ? (labels.back_to_syllabus || 'Back to Syllabus')
                    : labels.complete_and_claim || 'Complete & Claim Rewards'}
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* SCREEN E: Missions Tab */}
          {activeTab === 'missions' && !currentLessonId && (
            <motion.div
              key="missions-screen"
              initial={{ opacity: 0, scale: 0.99 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col gap-3.5"
              id="screen-missions"
            >
              <div className="font-display">
                <h2 className="font-black text-lg">{labels.missions_tab || 'Survival Missions'}</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {labels.missions_complete_tasks || 'Do missions to unlock achievements, coins and special profile items!'}
                </p>
              </div>

              {/* Custom referral fast link simulation builder */}
              <div className="p-4 bg-brand-purple/10 border border-brand-purple/20 text-brand-purple rounded-3xl flex flex-col gap-2 relative">
                <div className="flex items-center justify-between gap-1">
                  <span className="text-xs font-black uppercase tracking-wider">{labels.fast_referral_simulator || 'Fast Referral Simulator'}</span>
                  <span className="text-[10px] bg-brand-purple text-white px-2 py-0.5 rounded-full font-bold">
                    +25 Points
                  </span>
                </div>
                <p className="text-[11px] text-purple-950 dark:text-purple-300 leading-snug">
                  {labels.referral_sim_desc || 'Invite your friends to Spotty. Simulate an invitation now to satisfy the "Tell Your Team" mission instantly!'}
                </p>
                <div className="flex gap-2 mt-1">
                  <button
                    onClick={simulateInviteFriend}
                    className="flex-1 bg-brand-purple hover:bg-purple-600 text-white font-extrabold text-xs py-2 rounded-2xl cursor-pointer shadow-sm text-center transition-colors"
                  >
                    {labels.simulate_friend_btn || 'Simulate Invited Friend ✓'}
                  </button>
                </div>
              </div>

              {/* Render dynamic mission cards */}
              <div className="flex flex-col gap-3">
                {mockMissions.map((mission) => {
                  // Determine user actual accomplished value or action progress
                  let progressValue = 0;
                  if (mission.id === 'm1') {
                    progressValue = user.completedLessons.length;
                  } else if (mission.id === 'm2') {
                    progressValue = user.completedLessons.length + gameStreak; // mix of lessons and game sessions
                  } else if (mission.id === 'm3') {
                    progressValue = user.referralsCount;
                  } else if (mission.id === 'm4') {
                    progressValue = user.learnedWords.length;
                  }

                  const alreadyClaimed = user.claimedMissionRewards.includes(mission.id);

                  return (
                    <MissionCard
                      key={mission.id}
                      mission={mission}
                      currentProgress={progressValue}
                      claimed={alreadyClaimed}
                      onClaim={handleClaimMission}
                      language={user.language}
                      theme={user.theme}
                    />
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* SCREEN F: Educational Mini-Game Choice Arena */}
          {activeTab === 'game' && !currentLessonId && (
            <motion.div
              key="game-screen"
              initial={{ opacity: 0, scale: 0.99 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col gap-4 py-1"
              id="screen-game"
            >
              <div className="font-display">
                <h2 className="font-black text-lg">{labels.game_intro_title || 'Spotty Choice Arena 🎮'}</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {labels.game_intro_desc || 'Identify wise budget answers, gain score multipliers and evade online scams!'}
                </p>
              </div>

              {/* Game Score metric */}
              <div className="flex items-center justify-between p-3.5 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-900 rounded-3xl shadow-sm">
                <div className="flex items-center gap-1.5 font-display text-xs font-black uppercase tracking-wider">
                  <span>🎮 SCORE</span>
                </div>
                <span className="font-mono text-sm font-black uppercase tracking-wider bg-white/20 text-slate-900 px-3 py-1 rounded-full">
                  {labels.game_score?.replace('{{score}}', String(gameStreak)) || `Streak: ${gameStreak}`}
                </span>
              </div>

              {/* Active Scenario Card */}
              <div className={`p-4.5 rounded-3xl border flex flex-col gap-4 relative overflow-hidden transition-all duration-300
                ${user.theme === 'dark' ? 'bg-slate-900 border-slate-850' : 'bg-white border-slate-100'}`}
              >
                {/* upper Scenario indicator */}
                <div className="flex items-center gap-2">
                  <span className="text-2xl leading-none">{mockScenarios[scenarioIndex].emoji}</span>
                  <h4 className="font-display font-black text-xs text-brand-yellow uppercase tracking-wider">
                    {mockScenarios[scenarioIndex].titles[user.language] || mockScenarios[scenarioIndex].titles.en}
                  </h4>
                </div>

                {/* Scenario Scenario Body */}
                <p className={`text-xs leading-relaxed font-semibold
                  ${user.theme === 'dark' ? 'text-slate-350' : 'text-slate-600'}`}
                >
                  {mockScenarios[scenarioIndex].scenarioTexts[user.language] || mockScenarios[scenarioIndex].scenarioTexts.en}
                </p>

                {/* Multiple Options lists */}
                <div className="flex flex-col gap-2 mt-1">
                  {mockScenarios[scenarioIndex].options.map((option) => {
                    const optionLabel = option.textKeys[user.language] || option.textKeys.en;
                    const isSelected = selectedOptionId === option.id;

                    let cardStyles = '';
                    if (showScenarioSolution) {
                      if (isSelected) {
                        cardStyles = option.isCorrect
                          ? 'border-green-500 bg-green-500/10 text-green-700 dark:text-green-400'
                          : 'border-rose-500 bg-rose-500/10 text-rose-700 dark:text-rose-400';
                      } else if (option.isCorrect) {
                        cardStyles = 'border-green-500/65 bg-green-500/5 text-green-700 dark:text-green-400';
                      } else {
                        cardStyles = 'opacity-50 border-transparent';
                      }
                    } else {
                      cardStyles = isSelected
                        ? 'border-brand-yellow bg-amber-500/10 text-amber-900 dark:text-amber-200'
                        : user.theme === 'dark'
                        ? 'border-slate-800 bg-slate-800/30 text-slate-300 hover:bg-slate-800/60'
                        : 'border-slate-150 bg-slate-50/50 text-slate-700 hover:bg-slate-100/50';
                    }

                    return (
                      <button
                        key={option.id}
                        disabled={showScenarioSolution}
                        onClick={() => handleScenarioOptionClick(option.id)}
                        className={`p-3.5 rounded-2xl border text-xs text-left font-semibold cursor-pointer transition-all ${cardStyles}`}
                      >
                        {optionLabel}
                      </button>
                    );
                  })}
                </div>

                {/*解决方案 Solution explanation */}
                <AnimatePresence>
                  {showScenarioSolution && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className={`p-3.5 rounded-2xl border flex items-start gap-3 mt-1.5 text-xs leading-relaxed
                        ${
                          scenarioSuccess 
                            ? 'border-green-100 bg-green-500/10 text-green-950 dark:text-green-300' 
                            : 'border-rose-100 bg-rose-500/10 text-rose-950 dark:text-rose-300'
                        }`}
                      id="scenario-explanation-panel"
                    >
                      <span className="text-xl leading-none mt-0.5">
                        {scenarioSuccess ? '🎉' : '💡'}
                      </span>
                      <div>
                        <p className="font-extrabold text-sm mb-0.5">
                          {scenarioSuccess 
                            ? (labels.correct_notification || 'Excellent choice!') 
                            : (labels.game_mistake_title || 'Spotty Tip:')}
                        </p>
                        <p className="font-semibold text-xs leading-snug">
                          {mockScenarios[scenarioIndex].options.find(o => o.id === selectedOptionId)?.explanationKeys[user.language] 
                            || mockScenarios[scenarioIndex].options.find(o => o.id === selectedOptionId)?.explanationKeys.en}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Submiter Control */}
                <div className="flex justify-end mt-1.5">
                  {showScenarioSolution ? (
                    <motion.button
                      whileTap={{ scale: 0.98 }}
                      onClick={handleNextScenario}
                      className="bg-brand-green border border-green-600 text-white font-extrabold text-xs px-5 py-2 rounded-2xl cursor-pointer shadow-sm hover:bg-green-600 uppercase tracking-wider"
                      id="scenario-next-btn"
                    >
                      {labels.next_scenario || 'Next Scenario'}
                    </motion.button>
                  ) : (
                    <button
                      disabled={!selectedOptionId}
                      onClick={handleScenarioSubmit}
                      className={`px-5 py-2.5 rounded-2xl text-xs font-extrabold uppercase tracking-wider cursor-pointer border shadow-xs transition-colors
                        ${
                          !selectedOptionId
                            ? 'bg-slate-100 text-slate-400 dark:bg-slate-800 border-none cursor-not-allowed'
                            : 'bg-brand-yellow border-amber-600 text-slate-900 hover:bg-amber-500'
                        }`}
                      id="scenario-submit-btn"
                    >
                      Verify Choice
                    </button>
                  )}
                </div>
              </div>

              {/* Friendly Spotty cheering mascot */}
              <div className="flex flex-col items-center text-center mt-3 gap-2">
                <SpottyCharacter mood={gameStreak > 0 ? 'excited' : 'neutral'} size={110} />
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-relaxed">
                  Spotty referee awards XP and spendable points for all scenarios inside the choice arena!
                </p>
              </div>
            </motion.div>
          )}

          {/* SCREEN G: Profile Tab (Stats, referrall, achievements) */}
          {activeTab === 'profile' && !currentLessonId && (
            <motion.div
              key="profile-screen"
              initial={{ opacity: 0, scale: 0.99 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col gap-4 py-1"
              id="screen-profile"
            >
              <div className="font-display">
                <h2 className="font-black text-lg">{labels.profile_welcome || 'Academic Profile'}</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {labels.profile_desc || 'Evaluate your learning stats, copy your Telegram referral code, and verify unlocked achievements below!'}
                </p>
              </div>

              {/* Master visual user card */}
              <div className={`p-4.5 rounded-3xl border flex flex-col gap-4
                ${user.theme === 'dark' ? 'bg-slate-900 border-slate-850' : 'bg-white border-slate-100'}`}
              >
                <div className="flex items-center gap-3.5">
                  <div className="h-12 w-12 bg-amber-500/10 text-xl flex items-center justify-center rounded-2xl shadow-sm border border-amber-500/25">
                    {user.purchasedItems.includes('store_item_🎓') ? '🎓' : '🐶'}
                  </div>
                  <div>
                    <h3 className="font-display font-black text-base text-slate-900 dark:text-white leading-tight flex items-center gap-1.5">
                      <span>{user.name}</span>
                      {user.purchasedItems.includes('store_item_🛡️') && <span className="text-xs">🛡️</span>}
                    </h3>
                    <p className="text-xs text-slate-400 font-semibold mt-0.5">
                      {labels.classroom_rank_label || 'Class Room Rank:'} {labels.classroom_rank_value || 'Financial superhero'} level {user.level}
                    </p>
                  </div>
                </div>

                {/* Stats grid */}
                <div className="grid grid-cols-3 gap-2 text-center border-t border-slate-100 dark:border-slate-800/80 pt-3.5">
                  <div className="flex flex-col">
                    <span className="font-mono font-black text-base text-brand-green">{user.xp}</span>
                    <span className="text-[10px] text-slate-400 font-extrabold uppercase mt-0.5">{labels.total_xp || 'XP Points'}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-mono font-black text-base text-brand-purple">{user.completedLessons.length}</span>
                    <span className="text-[10px] text-slate-400 font-extrabold uppercase mt-0.5">{labels.completed_label || 'Passed'}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-mono font-black text-base text-brand-yellow">{user.referralsCount}</span>
                    <span className="text-[10px] text-slate-400 font-extrabold uppercase mt-0.5">{labels.referral_stats || 'Referrals'}</span>
                  </div>
                </div>
              </div>

              {/* Quick rewards store toggle bento trigger (Provides Store access as requested) */}
              <div className="p-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-3xl flex items-center justify-between gap-4 shadow-sm relative overflow-hidden">
                <div className="flex-1">
                  <h4 className="font-display font-black text-sm">{labels.open_store_banner || 'Open the Rewards Store 🛍️'}</h4>
                  <p className="text-[10px] text-cyan-100 font-semibold mt-1">
                    {labels.store_banner_desc || 'Exchange stars for Spotty graduation hats, protection shields or convertible virtual gold safe items!'}
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab('welcome')} // Or we can trigger an inline view or simply toggle a state
                  className="bg-white text-cyan-600 font-extrabold text-xs px-3.5 py-1.5 rounded-xl cursor-pointer self-center"
                  style={{ contentVisibility: 'auto' }}
                  onClickCapture={(e) => {
                    e.stopPropagation();
                    // Navigate to secondary page of Store
                    // Let's toggle a temporary state of "activeTab" to "store"!
                    // Wait, we can implement Store screen under profile list easily, or toggle a primary component!
                    setActiveTab('profile'); // stay on profile or toggle store view
                  }}
                >
                  {labels.go_to_store_btn || 'Go to Store'}
                </button>
              </div>

              {/* Rewards Store Section directly rendered inside Profile flow for elite access! */}
              <div className="flex flex-col gap-2 mt-2" id="store-subpanel">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    {labels.store_title || 'Rewards Store'}
                  </span>
                  <span className="text-xs font-bold text-amber-500 font-mono">
                    {labels.pts_available || 'Pts Available:'} {user.points}★
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 leading-normal">
                  {labels.store_section_desc || 'Redeem star balances for adorable profile hats, protective pins, and secret virtual chest boxes:'}
                </p>

                <div className="grid grid-cols-2 gap-2">
                  {mockStoreItems.map((item) => {
                    const isOwned = user.purchasedItems.includes(item.id);
                    const title = labels[item.titleKey] || item.titleKey;
                    
                    return (
                      <motion.div
                        whileHover={!isOwned ? { y: -1 } : {}}
                        key={item.id}
                        className={`p-3 rounded-2.5xl border flex flex-col justify-between gap-2.5 transition-all duration-300
                          ${
                            isOwned
                              ? 'border-green-200 bg-green-500/5 opacity-75'
                              : user.theme === 'dark'
                              ? 'bg-slate-900 border-slate-800'
                              : 'bg-white border-slate-100'
                          }`}
                      >
                        <div className="flex items-center justify-between gap-1.5">
                          <span className="text-xl">{item.emoji}</span>
                          {item.isTonExclusive && (
                            <span className="text-[8px] bg-cyan-500 text-white px-1.5 py-0.5 rounded-md font-extrabold uppercase">
                              TON Exclusive
                            </span>
                          )}
                        </div>

                        <div>
                          <h5 className={`font-display font-black text-[11px] leading-tight
                            ${user.theme === 'dark' ? 'text-slate-200' : 'text-slate-900'}`}
                          >
                            {title}
                          </h5>
                          <p className="text-[9px] text-slate-500 dark:text-slate-400 leading-snug mt-1">
                            {labels[item.descKey] || item.descKey}
                          </p>
                        </div>

                        <button
                          disabled={isOwned}
                          onClick={() => handleBuyStoreItem(item)}
                          className={`w-full py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider text-center cursor-pointer transition-colors
                            ${
                              isOwned
                                ? 'bg-slate-100 text-slate-400 dark:bg-slate-800 cursor-not-allowed'
                                : 'bg-brand-yellow text-slate-900 hover:bg-amber-500 border border-amber-600'
                            }`}
                        >
                          {isOwned ? (labels.claimed_btn || 'Owned') : `${item.costPoints} Pts`}
                        </button>
                      </motion.div>
                    );
                  })}
                </div>
              </div>

              {/* Referral dynamic code block */}
              <div className={`p-4 rounded-3xl border flex flex-col gap-3
                ${user.theme === 'dark' ? 'bg-slate-900 border-slate-850' : 'bg-white border-slate-100'}`}
              >
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                  {labels.referrals_code || 'Referral Milestone'}
                </span>
                <p className="text-[11px] text-slate-500 leading-snug">
                  {labels.referral_card_desc || 'Share Spotty with your school friends! Every invite awards you 25 bonus points.'}
                </p>

                <div className="flex gap-2">
                  <div className="flex-1 bg-slate-50 dark:bg-slate-800/60 border border-slate-150 p-2.5 rounded-2xl flex items-center justify-between overflow-hidden">
                    <span className="font-mono text-xs select-all truncate">
                      SPOTTY_REF_{user.name.toUpperCase().replace(/\s+/g, '_')}
                    </span>
                  </div>
                  <button
                    onClick={copyReferralCode}
                    className="p-2.5 bg-brand-green hover:bg-green-600 text-white rounded-2xl cursor-pointer"
                  >
                    {copyFeedback ? '✓' : <Copy size={15} />}
                  </button>
                </div>
                {copyFeedback && (
                  <span className="text-[9px] font-bold text-brand-green leading-none">
                    {labels.copied || 'Link Copied to clipboard! ✓'}
                  </span>
                )}
              </div>

              {/* Achievements listing block */}
              <div className="flex flex-col gap-2 mt-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                  {labels.achievements_title || 'Academy Milestones'}
                </span>

                <div className="flex flex-col gap-2">
                  {/* Achievement 1: First Coin Miner */}
                  <div className={`p-3.5 rounded-2.5xl border flex items-center gap-4 transition-all duration-300
                    ${
                      user.completedLessons.length >= 1 
                        ? 'border-purple-200 bg-brand-purple/5' 
                        : 'opacity-60 border-slate-100 dark:border-slate-800'
                    }`}
                  >
                    <span className="text-2xl leading-none">🪙</span>
                    <div>
                      <h4 className="font-display font-black text-xs">
                        {labels.ach1_title || 'First Coin Miner'} {user.completedLessons.length >= 1 ? '✓' : '🔒'}
                      </h4>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                        {labels.ach1_desc || 'Passed your first tutorial lesson quiz successfully.'}
                      </p>
                    </div>
                  </div>

                  {/* Achievement 2: Streak Titan */}
                  <div className={`p-3.5 rounded-2.5xl border flex items-center gap-4 transition-all duration-300
                    ${
                      user.streak >= 3 
                        ? 'border-purple-200 bg-brand-purple/5' 
                        : 'opacity-60 border-slate-100 dark:border-slate-800'
                    }`}
                  >
                    <span className="text-2xl leading-none">🔥</span>
                    <div>
                      <h4 className="font-display font-black text-xs font-bold">
                        {labels.ach2_title || 'Streak Titan'} {user.streak >= 3 ? '✓' : '🔒'}
                      </h4>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                        {labels.ach2_desc || 'Maintain a 3-day continuous learning streak.'}
                      </p>
                    </div>
                  </div>

                  {/* Achievement 3: Spotty Successor */}
                  <div className={`p-3.5 rounded-2.5xl border flex items-center gap-4 transition-all duration-300
                    ${
                      user.xp >= 500 
                        ? 'border-purple-200 bg-brand-purple/5' 
                        : 'opacity-60 border-slate-100 dark:border-slate-800'
                    }`}
                  >
                    <span className="text-2xl leading-none">👑</span>
                    <div>
                      <h4 className="font-display font-black text-xs font-bold">
                        {labels.ach3_title || 'Spotty Successor'} {user.xp >= 500 ? '✓' : '🔒'}
                      </h4>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                        {labels.ach3_desc || 'Gather more than 500 XP points via lessons and missions.'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </main>

      {/* Floating Interactive rewards toasts notification */}
      {rewardToast && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-55 px-5 py-3 rounded-2xl bg-slate-900 border border-slate-800 text-slate-100 flex items-center gap-2.5 shadow-2xl backdrop-blur-md animate-bounce max-w-[90%] text-xs font-black">
          <Sparkles className="text-brand-yellow flex-shrink-0 animate-pulse" size={15} />
          <span>{rewardToast}</span>
        </div>
      )}

      {/* Dynamic flying reward particles overlay */}
      <RewardEffects triggerId={particleTriggerId} type={particleType} />

      {/* MODAL 1: Level Up celebration screen */}
      {showLevelUp !== null && (
        <div className="fixed inset-0 z-55 bg-black/65 backdrop-blur-xs flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={`w-full max-w-xs rounded-3xl p-6 text-center border shadow-2xl relative
              ${user.theme === 'dark' ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-100 text-slate-950'}`}
          >
            <div className="relative mb-4 flex justify-center">
              <SpottyCharacter mood="excited" size={130} />
              <span className="absolute text-5xl animate-bounce top-0 right-10">🎉</span>
            </div>

            <h3 className="font-display font-black text-xl text-brand-green">
              {labels.level_up_title || 'Level Up! 🎉'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
              {labels.level_up_desc?.replace('{{level}}', String(showLevelUp)) || `Spotty is dancing around! You reached Level ${showLevelUp} of our Academic!`}. Keep up the smart habits!
            </p>

            <button
              onClick={() => setShowLevelUp(null)}
              className="mt-6 w-full py-3 bg-brand-green hover:bg-green-600 text-white text-xs font-extrabold rounded-2xl cursor-pointer uppercase tracking-wider transition-colors shadow-sm"
            >
              Fabulous! Let's Continue
            </button>
          </motion.div>
        </div>
      )}

      {/* MODAL 2: Financial Word Glossar detailed explanation pop-up */}
      {showWordUnlock !== null && FINANCIAL_GLOSSARY[showWordUnlock] && (
        <div className="fixed inset-0 z-55 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className={`w-full max-w-xs rounded-3xl p-6 border shadow-2xl text-slate-700 dark:text-slate-300
              ${user.theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}
          >
            <div className="flex items-center gap-2 mb-3 text-brand-green">
              <Info size={18} />
              <h4 className="font-display font-black text-sm uppercase tracking-wider text-brand-green">
                {labels.m4_title || 'New Word'}
              </h4>
            </div>

            <h3 className="font-display font-black text-base text-slate-900 dark:text-white leading-tight">
              {showWordUnlock === 'barter' 
                ? (labels.glossary_barter_term || 'Barter')
                : showWordUnlock === 'inflation'
                ? (labels.glossary_inflation_term || 'Inflation')
                : (labels.glossary_compound_interest_term || 'Compound Interest')}
            </h3>

            <p className="text-xs mt-3 leading-relaxed font-semibold">
              {showWordUnlock === 'barter' 
                ? (labels.glossary_barter_def || FINANCIAL_GLOSSARY[showWordUnlock].definition[user.language] || FINANCIAL_GLOSSARY[showWordUnlock].definition.en)
                : showWordUnlock === 'inflation'
                ? (labels.glossary_inflation_def || FINANCIAL_GLOSSARY[showWordUnlock].definition[user.language] || FINANCIAL_GLOSSARY[showWordUnlock].definition.en)
                : (labels.glossary_compound_interest_def || FINANCIAL_GLOSSARY[showWordUnlock].definition[user.language] || FINANCIAL_GLOSSARY[showWordUnlock].definition.en)}
            </p>

            <div className={`mt-4 p-3.5 rounded-2xl text-[10px] leading-relaxed flex items-start gap-2
              ${user.theme === 'dark' ? 'bg-slate-950 text-slate-400' : 'bg-slate-50 text-slate-500'}`}
            >
              <span>🐶</span>
              <p>{labels.m4_desc || 'Spotty tip: Learn and click all dictionary words inside the app to complete vocabulary objectives!'}</p>
            </div>

            <button
              onClick={() => setShowWordUnlock(null)}
              className="mt-5 w-full py-2.5 bg-brand-green hover:bg-green-600 text-white text-xs font-extrabold rounded-2xl cursor-pointer uppercase tracking-wider text-center"
            >
              Great, got it!
            </button>
          </motion.div>
        </div>
      )}

      {/* MODAL 3: Simulated TON Connect wallet choice */}
      {showTonConnectModal && (
        <div className="fixed inset-0 z-55 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div
            className={`w-full max-w-xs rounded-3xl p-6 border shadow-2xl relative
              ${user.theme === 'dark' ? 'bg-slate-900 border-slate-850 text-white' : 'bg-white border-slate-100 text-slate-900'}`}
          >
            <div className="flex items-center gap-2.5 mb-4">
              <Wallet className="text-cyan-500 animate-pulse" size={20} />
              <h4 className="font-display font-black text-sm uppercase tracking-wider">TON Connect Arena</h4>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 leading-snug mb-4">
              Select your favorite secure Tonkeeper, OpenMask or MyTon Wallet to simulate linking Web3 items!
            </p>

            {/* List wall choices */}
            <div className="flex flex-col gap-2.5">
              <button
                onClick={handleFakeTonConnect}
                className="p-3 bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-150 rounded-2xl flex items-center justify-between text-xs font-bold leading-none cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <span className="text-base">💎</span>
                  <span>Tonkeeper</span>
                </div>
                <span className="text-[10px] text-cyan-500">Fast install</span>
              </button>

              <button
                onClick={handleFakeTonConnect}
                className="p-3 bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-150 rounded-2xl flex items-center justify-between text-xs font-bold leading-none cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <span className="text-base">🦊</span>
                  <span>MyTonWallet</span>
                </div>
                <span className="text-[10px] text-cyan-500">Connect</span>
              </button>

              <button
                onClick={handleFakeTonConnect}
                className="p-3 bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-150 rounded-2xl flex items-center justify-between text-xs font-bold leading-none cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <span className="text-base">🕸️</span>
                  <span>OpenMask</span>
                </div>
                <span className="text-[10px] text-slate-400">Offline demo</span>
              </button>
            </div>

            <button
              onClick={() => setShowTonConnectModal(false)}
              className="mt-5 w-full py-2.5 bg-slate-100 text-slate-500 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 rounded-2xl text-xs font-bold cursor-pointer text-center"
            >
              Cancel Linkage
            </button>
          </div>
        </div>
      )}

          {/* Persistent global Bottom Tab navigation switch */}
          {activeTab !== 'welcome' && (
            <BottomNavigation
              activeTab={activeTab as TabType}
              setActiveTab={(tab) => {
                // Cancel active lesson when clicking bottom tabs, enabling smooth return
                setCurrentLessonId(null);
                setActiveTab(tab);
              }}
              language={user.language}
              theme={user.theme}
            />
          )}

        </div>
      </div>
    </div>
  );
}

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { HelpCircle, Check, ArrowRight, Sparkles, Lightbulb } from 'lucide-react';
import { QuizQuestion, LanguageCode } from '../types';
import { translations } from '../translations';
import confetti from 'canvas-confetti';
import { playCorrectSound, playWrongSound } from '../utils/audio';

export const getQuizMultiplier = (streak: number): number => {
  if (streak <= 0) return 1.0;
  if (streak === 1) return 1.1;
  if (streak === 2) return 1.25;
  if (streak === 3) return 1.5;
  if (streak === 4) return 1.75;
  return 2.0; // 5+ consecutive gets 2x points!
};

interface QuizComponentProps {
  quiz: QuizQuestion;
  onCorrectAnswer: (streak: number, multiplier: number) => void;
  onWrongAnswer?: () => void;
  language: LanguageCode;
  theme?: 'light' | 'dark';
}

export default function QuizComponent({
  quiz,
  onCorrectAnswer,
  onWrongAnswer,
  language,
  theme = 'light',
}: QuizComponentProps) {
  const labels = { ...translations.en, ...(translations[language] || {}) };
  
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Tracks the consecutive quiz answering streak loading from local storage
  const [streakCount, setStreakCount] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('spotty_quiz_streak');
      return saved ? parseInt(saved, 10) : 0;
    } catch {
      return 0;
    }
  });

  // Track if they failed a question on this specific component instance
  const [hasMadeMistake, setHasMadeMistake] = useState<boolean>(false);

  const questionText = labels[quiz.questionKey] || quiz.questionKey;
  const explanationText = labels[quiz.explanationKey] || quiz.explanationKey;

  const handleOptionClick = (idx: number) => {
    if (isSubmitted && selectedIdx === quiz.correctAnswerIndex) return; // Already passed
    setSelectedIdx(idx);
    setIsSubmitted(false);
    setErrorMessage(null);
  };

  const handleVerify = () => {
    if (selectedIdx === null) return;

    const isCorrect = selectedIdx === quiz.correctAnswerIndex;

    if (isCorrect) {
      setIsSubmitted(true);
      // Celebrate with exciting canvas confetti!
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.65 },
        colors: ['#22c55e', '#3b82f6', '#fbbf24', '#ec4899', '#8b5cf6']
      });
      playCorrectSound();

      let finalStreak = 0;
      let multiplier = 1.0;

      if (!hasMadeMistake) {
        // Increment streak if correct on very 1st try!
        finalStreak = streakCount + 1;
        multiplier = getQuizMultiplier(finalStreak);
        setStreakCount(finalStreak);
      } else {
        // Reset streak due to previous mistakes on this question
        finalStreak = 0;
        multiplier = 1.0;
        setStreakCount(0);
      }

      try {
        localStorage.setItem('spotty_quiz_streak', finalStreak.toString());
      } catch (e) {
        console.warn(e);
      }

      onCorrectAnswer(finalStreak, multiplier);
    } else {
      setIsSubmitted(true);
      setErrorMessage(explanationText);
      playWrongSound();

      // Made a mistake - instantly reset streak to 0
      setHasMadeMistake(true);
      setStreakCount(0);
      try {
        localStorage.setItem('spotty_quiz_streak', '0');
      } catch (e) {
        console.warn(e);
      }

      if (onWrongAnswer) onWrongAnswer();
    }
  };

  const isCorrectState = isSubmitted && selectedIdx === quiz.correctAnswerIndex;
  const isWrongState = isSubmitted && selectedIdx !== quiz.correctAnswerIndex;

  return (
    <div
      className={`p-4.5 rounded-3xl border shadow-sm flex flex-col gap-4 font-sans transition-all duration-300
        ${
          theme === 'dark'
            ? 'bg-slate-900 border-slate-800'
            : 'bg-white border-slate-100'
        }`}
      id={`quiz-widget-${quiz.id}`}
    >
      {/* Header Topic Banner */}
      <div className="flex items-center justify-between">
        <div className="p-1 px-2.5 bg-brand-yellow/10 text-brand-yellow rounded-xl flex items-center gap-1.5 text-xs font-black uppercase tracking-wider">
          <HelpCircle size={13} />
          <span>{labels.quiz_title || 'Spotty Challenge'}</span>
        </div>
      </div>

      {/* Streak Dashboard Visual Badge */}
      <div className={`p-3 rounded-2xl border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs leading-none transition-all duration-300
        ${
          theme === 'dark'
            ? 'bg-slate-800/40 border-slate-700/60'
            : 'bg-slate-50 border-slate-100'
        }`}
        id="spotty-streak-bar-badge"
      >
        <div className="flex items-center gap-2.5">
          <span className="text-xl animate-bounce">🔥</span>
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-505 uppercase tracking-wider">
              {labels.quiz_streak_caption || 'Spotty Quiz Streak'}
            </span>
            <span className="font-extrabold text-slate-700 dark:text-slate-300">
              {streakCount} {streakCount === 1 ? 'Correct Answer' : 'Consecutive Answers'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {hasMadeMistake ? (
            <span className="text-[10px] font-bold bg-rose-500/10 text-rose-500 px-2 py-1.5 rounded-xl">
              ❌ Streak Reset (Mistake Made)
            </span>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase">Multiplier:</span>
              <div className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-white font-black text-xs shadow-sm
                ${
                  streakCount >= 4 
                    ? 'bg-gradient-to-r from-red-500 to-amber-500 animate-pulse'
                    : streakCount >= 2
                    ? 'bg-gradient-to-r from-orange-500 to-yellow-500'
                    : 'bg-gradient-to-r from-brand-blue to-teal-500'
                }`}
              >
                <Sparkles size={11} />
                <span>{getQuizMultiplier(streakCount).toFixed(2)}x</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Question Phrase */}
      <h3 className={`font-display font-black text-sm leading-snug
        ${theme === 'dark' ? 'text-slate-100' : 'text-slate-900'}`}
      >
        {questionText}
      </h3>

      {/* Answer Options Grid */}
      <div className="flex flex-col gap-2">
        {quiz.optionsKeys.map((optionKey, index) => {
          const optionLabel = labels[optionKey] || optionKey;
          const isSelected = selectedIdx === index;
          const isItCorrect = index === quiz.correctAnswerIndex;

          let btnStyles = '';
          if (isSubmitted) {
            if (isSelected) {
              btnStyles = isItCorrect
                ? 'border-green-500 bg-green-500/10 text-green-700 dark:text-green-400'
                : 'border-amber-400 bg-amber-500/10 text-amber-800 dark:text-amber-300 ring-2 ring-amber-400/20';
            } else if (isCorrectState && isItCorrect) {
              // Highlight the correct one even if not picked on submit
              btnStyles = 'border-green-500/60 bg-green-500/5 text-green-700 dark:text-green-400';
            } else {
              btnStyles = theme === 'dark'
                ? 'border-slate-850 text-slate-500'
                : 'border-slate-100 text-slate-400';
            }
          } else {
            btnStyles = isSelected
              ? 'border-brand-blue bg-blue-500/10 text-blue-700 dark:text-blue-400 ring-2 ring-blue-500/30'
              : theme === 'dark'
              ? 'border-slate-800 bg-slate-800/20 text-slate-300 hover:bg-slate-800/40'
              : 'border-slate-150 bg-slate-50/50 text-slate-700 hover:bg-slate-100/50';
          }

          return (
            <motion.button
              key={index}
              disabled={isCorrectState}
              whileTap={{ scale: 0.99 }}
              onClick={() => handleOptionClick(index)}
              className={`w-full p-3.5 rounded-2xl border text-left text-xs font-semibold cursor-pointer transition-all duration-150 flex items-center justify-between gap-3
                ${btnStyles} ${isCorrectState ? 'cursor-not-allowed' : ''}`}
            >
              <div className="flex items-center gap-3">
                <span className={`h-6 w-6 rounded-lg text-[10px] font-black tracking-tight flex items-center justify-center uppercase
                  ${
                    isSelected
                      ? 'bg-blue-500 text-white'
                      : theme === 'dark'
                      ? 'bg-slate-800 text-slate-400'
                      : 'bg-slate-200/60 text-slate-600'
                  }`}
                >
                  {String.fromCharCode(65 + index)}
                </span>
                <span className="leading-snug">{optionLabel}</span>
              </div>

              {/* Action check/fail decorations */}
              {isSubmitted && isSelected && (
                <div>
                  {isItCorrect ? (
                    <span className="text-emerald-500 font-bold">✓</span>
                  ) : (
                    <span className="text-amber-500 font-bold text-sm">💡</span>
                  )}
                </div>
              )}
            </motion.button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        {/* Wrong Feedback Explanation Banner */}
        {isWrongState && errorMessage && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className={`p-3.5 rounded-2xl border text-xs leading-relaxed flex flex-col gap-2 border-amber-200 bg-amber-500/10 text-amber-900 dark:text-amber-200`}
            id="quiz-error-explanation"
          >
            <div className="flex items-start gap-2.5">
              <Lightbulb size={16} className="text-amber-500 flex-shrink-0 mt-0.5 animate-pulse" />
              <div>
                <p className="font-extrabold text-amber-700 dark:text-amber-400">
                  {labels.wrong_notification || 'Oops! Let’s think again! Spotty says:'}
                </p>
                <p className="mt-1 font-medium">{errorMessage}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 p-2 rounded-xl text-[10px] font-bold text-amber-700 dark:text-yellow-600">
              <span>⚠️ Streak status: Reset to 0 count due to this incorrect response. Select another option to get correct!</span>
            </div>
          </motion.div>
        )}

        {/* Success Feedback Banner */}
        {isCorrectState && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="p-3.5 rounded-2xl border border-green-100 bg-green-500/10 text-green-900 dark:text-green-300 text-xs leading-relaxed flex flex-col gap-2.5 animate-fade-in"
            id="quiz-success-explanation"
          >
            <div className="flex items-start gap-2.5">
              <Sparkles size={16} className="text-emerald-500 flex-shrink-0 mt-0.5 animate-bounce" />
              <div>
                <p className="font-extrabold text-emerald-600 dark:text-emerald-400">
                  {labels.correct_notification || 'Correct! Spotty is so proud! 🐶✨'}
                </p>
                <p className="mt-1 font-medium italic">
                  {explanationText}
                </p>
              </div>
            </div>

            {/* Multiplier notification inside the explanation card */}
            <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 p-2.5 rounded-xl mt-1">
              <span className="text-base">🎁</span>
              <div className="text-[11px]">
                {hasMadeMistake ? (
                  <span className="font-bold text-emerald-700 dark:text-green-400">
                    You cleared this quiz, but because of a previous mistake, the streak was reset to 0. Keep going to start a new streak!
                  </span>
                ) : (
                  <span className="font-bold text-emerald-700 dark:text-green-400">
                    Perfect Answer! Your streak is now <span className="text-orange-500 font-extrabold">{streakCount} 🔥</span>! You've locked in a <span className="text-orange-500 font-extrabold">{getQuizMultiplier(streakCount).toFixed(2)}x Multiplier</span> for completing & claiming lesson rewards!
                  </span>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom control submit button */}
      {!isCorrectState && (
        <div className="flex justify-end mt-1">
          <motion.button
            whileHover={selectedIdx !== null ? { scale: 1.02 } : {}}
            whileTap={selectedIdx !== null ? { scale: 0.98 } : {}}
            disabled={selectedIdx === null}
            onClick={handleVerify}
            className={`px-5 py-2 rounded-2xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-sm transition-all cursor-pointer
              ${
                selectedIdx === null
                  ? 'bg-slate-100 text-slate-400 dark:bg-slate-800 border-none cursor-not-allowed'
                  : 'bg-brand-blue border border-cyan-600 text-white hover:bg-cyan-600 active:scale-95'
              }`}
            id="quiz-submit-verification-btn"
          >
            <span>{labels.submit_verification || 'Submit Verification'}</span>
            <ArrowRight size={13} className="stroke-[2.5]" />
          </motion.button>
        </div>
      )}
    </div>
  );
}

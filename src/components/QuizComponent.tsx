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

interface QuizComponentProps {
  quiz: QuizQuestion;
  onCorrectAnswer: () => void;
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

    setIsSubmitted(true);
    const isCorrect = selectedIdx === quiz.correctAnswerIndex;

    if (isCorrect) {
      // Celebrate with exciting canvas confetti!
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.65 },
        colors: ['#22c55e', '#3b82f6', '#fbbf24', '#ec4899', '#8b5cf6']
      });
      playCorrectSound();
      onCorrectAnswer();
    } else {
      setErrorMessage(explanationText);
      playWrongSound();
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
      <div className="flex items-center gap-2">
        <div className="p-1 px-2.5 bg-brand-yellow/10 text-brand-yellow rounded-xl flex items-center gap-1.5 text-xs font-black uppercase tracking-wider">
          <HelpCircle size={13} />
          <span>{labels.quiz_title || 'Spotty Challenge'}</span>
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
            className={`p-3.5 rounded-2xl border text-xs leading-relaxed flex items-start gap-2.5 border-amber-200 bg-amber-500/10 text-amber-900 dark:text-amber-200`}
            id="quiz-error-explanation"
          >
            <Lightbulb size={16} className="text-amber-500 flex-shrink-0 mt-0.5 animate-pulse" />
            <div>
              <p className="font-extrabold text-amber-700 dark:text-amber-400">
                {labels.wrong_notification || 'Oops! Let’s think again! Spotty says:'}
              </p>
              <p className="mt-1 font-medium">{errorMessage}</p>
            </div>
          </motion.div>
        )}

        {/* Success Feedback Banner */}
        {isCorrectState && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="p-3.5 rounded-2xl border border-green-100 bg-green-500/10 text-green-900 dark:text-green-300 text-xs leading-relaxed flex items-start gap-2.5"
            id="quiz-success-explanation"
          >
            <Sparkles size={16} className="text-emerald-500 flex-shrink-0 mt-0.5 animate-bounce" />
            <div>
              <p className="font-extrabold text-emerald-600 dark:text-emerald-400">
                {labels.correct_notification || 'Correct! Spotty is so proud! 🐶✨'}
              </p>
              <p className="mt-1 font-medium italic">
                {explanationText}
              </p>
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

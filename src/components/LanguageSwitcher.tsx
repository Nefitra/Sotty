/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { languageNames, translations } from '../translations';
import { LanguageCode } from '../types';
import { Globe, Check, X } from 'lucide-react';

interface LanguageSwitcherProps {
  currentLanguage: LanguageCode;
  onLanguageChange: (lang: LanguageCode) => void;
  className?: string;
  theme?: 'light' | 'dark';
}

export default function LanguageSwitcher({
  currentLanguage,
  onLanguageChange,
  className = '',
  theme = 'light',
}: LanguageSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false);
  const currentInfo = languageNames[currentLanguage] || { label: 'English', flag: '🇬🇧' };
  const labels = { ...translations.en, ...(translations[currentLanguage] || {}) };

  return (
    <div className={`relative ${className}`} id="language-switcher-root">
      {/* Current Language Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all shadow-sm cursor-pointer
          ${
            theme === 'dark'
              ? 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700'
              : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        id="language-switcher-trigger"
      >
        <span>{currentInfo.flag}</span>
        <span className="uppercase">{currentLanguage}</span>
        <Globe size={13} className="opacity-60" />
      </button>

      {/* Language Popup Dialog Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in" id="language-switcher-modal">
          <div
            className={`w-full max-w-sm rounded-3xl p-5 shadow-2xl relative overflow-hidden transition-all duration-300 transform scale-100 border
              ${
                theme === 'dark'
                  ? 'bg-slate-900 border-slate-800 text-white'
                  : 'bg-white border-slate-100 text-slate-900'
              }`}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Globe className="text-brand-blue" size={18} />
                <h3 className="font-display font-bold text-lg">
                  {labels.choose_language || 'Choose Language'}
                </h3>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className={`p-1.5 rounded-full transition-colors cursor-pointer
                  ${
                    theme === 'dark'
                      ? 'hover:bg-slate-800 text-slate-400'
                      : 'hover:bg-slate-100 text-slate-500'
                  }`}
              >
                <X size={18} />
              </button>
            </div>

            {/* Language grid */}
            <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto pr-1">
              {(Object.keys(languageNames) as LanguageCode[]).map((langCode) => {
                const info = languageNames[langCode];
                const isSelected = currentLanguage === langCode;
                return (
                  <button
                    key={langCode}
                    onClick={() => {
                      onLanguageChange(langCode);
                      setIsOpen(false);
                    }}
                    className={`flex items-center justify-between p-2.5 rounded-2xl text-sm font-medium border text-left transition-all duration-200 cursor-pointer
                      ${
                        isSelected
                          ? 'border-brand-green bg-green-500/10 text-brand-green font-bold'
                          : theme === 'dark'
                          ? 'border-slate-800 bg-slate-800/40 text-slate-300 hover:bg-slate-800'
                          : 'border-slate-100 bg-slate-50/50 text-slate-700 hover:bg-slate-100'
                      }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-lg leading-none">{info.flag}</span>
                      <span>{info.label}</span>
                    </div>
                    {isSelected && <Check size={14} className="stroke-[3]" />}
                  </button>
                );
              })}
            </div>
            
            {/* Spotty footer hint */}
            <div className={`mt-4 p-3 rounded-2xl flex items-center gap-2.5 text-xs rounded-br-none
              ${
                theme === 'dark'
                  ? 'bg-slate-800/60 text-slate-300'
                  : 'bg-amber-50 text-amber-800'
              }`}
            >
              <span className="text-lg">🐶</span>
              <p className="leading-relaxed">Spotty translates learning concepts into 11 languages automatically!</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

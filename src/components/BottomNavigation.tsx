/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Home, BookOpen, Target, Gamepad2, User2 } from 'lucide-react';
import { translations } from '../translations';
import { LanguageCode } from '../types';

export type TabType = 'dashboard' | 'lessons' | 'missions' | 'game' | 'profile';

interface BottomNavigationProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  language: LanguageCode;
  theme?: 'light' | 'dark';
}

export default function BottomNavigation({
  activeTab,
  setActiveTab,
  language,
  theme = 'light',
}: BottomNavigationProps) {
  const labels = { ...translations.en, ...(translations[language] || {}) };

  const tabsConfig = [
    { id: 'dashboard' as TabType, label: labels.dashboard_tab || 'Dashboard', icon: Home },
    { id: 'lessons' as TabType, label: labels.lessons_tab || 'Lessons', icon: BookOpen },
    { id: 'missions' as TabType, label: labels.missions_tab || 'Missions', icon: Target },
    { id: 'game' as TabType, label: labels.game_tab || 'Game', icon: Gamepad2 },
    { id: 'profile' as TabType, label: labels.profile_tab || 'Profile', icon: User2 },
  ];

  return (
    <nav
      className={`fixed bottom-0 left-0 right-0 z-40 border-t flex justify-around items-center px-1 py-1.5 pb-safe shadow-lg md:max-w-md md:mx-auto md:rounded-t-3xl transition-all duration-300
        ${
          theme === 'dark'
            ? 'bg-slate-900/95 border-slate-800 text-slate-100 backdrop-blur-md'
            : 'bg-white/95 border-slate-100 text-slate-900 backdrop-blur-md'
        }`}
      id="app-bottom-navigation-bar"
    >
      {tabsConfig.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-2xl flex-1 transition-all duration-200 relative select-none cursor-pointer
              ${
                isActive
                  ? 'text-brand-green font-black scale-105'
                  : theme === 'dark'
                  ? 'text-slate-400 hover:text-slate-350'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            id={`bottom-tab-btn-${tab.id}`}
          >
            {/* Active micro dotted pointer */}
            {isActive && (
              <span className="absolute top-1 right-1/2 translate-x-1.5 h-1.5 w-1.5 rounded-full bg-brand-green" />
            )}

            {/* Icon representation */}
            <Icon
              size={19}
              className={`transition-transform duration-200 stroke-[2.2]
                ${isActive ? 'scale-110 text-brand-green' : 'opacity-85 text-current'}`}
            />

            {/* Title label */}
            <span className="text-[9px] font-bold mt-1 tracking-wide truncate max-w-[64px] text-center">
              {tab.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}

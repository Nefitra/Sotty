/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from 'motion/react';
import spottySittingSmiling from '../assets/images/spotty_sitting_smiling_1780442353193.png';
import spottyStandingWaving from '../assets/images/spotty_standing_waving_1780442371420.png';
import spottyStandingSmart from '../assets/images/spotty_standing_smart_1780442389046.png';

interface SpottyCharacterProps {
  mood?: 'happy' | 'sad' | 'smart' | 'crypto' | 'excited' | 'saving' | 'neutral';
  size?: number;
  className?: string;
}

export default function SpottyCharacter({
  mood = 'happy',
  size = 140,
  className = '',
}: SpottyCharacterProps) {
  // Map moods to the corresponding high-fidelity 3D assets
  const getCharacterImage = () => {
    switch (mood) {
      case 'excited':
      case 'happy':
        return spottyStandingWaving;
      case 'smart':
      case 'crypto':
        return spottyStandingSmart;
      case 'saving':
      case 'neutral':
      case 'sad':
      default:
        return spottySittingSmiling;
    }
  };

  return (
    <div
      className={`relative flex items-center justify-center select-none ${className}`}
      style={{ width: size, height: size }}
      id={`spotty-mascot-container-${mood}`}
    >
      {/* 3D clay Spotty Character image */}
      <motion.img
        src={getCharacterImage()}
        alt={`Spotty Mascot - ${mood}`}
        referrerPolicy="no-referrer"
        className="w-full h-full object-contain rounded-2xl drop-shadow-md"
        initial={{ scale: 0.95 }}
        animate={{
          scale: mood === 'excited' ? [0.95, 1.02, 0.95] : [0.95, 0.98, 0.95],
          rotate: mood === 'excited' ? [-2, 2, -2] : 0,
        }}
        transition={{
          repeat: Infinity,
          duration: mood === 'excited' ? 1.5 : 3.5,
          ease: 'easeInOut',
        }}
      />

      {/* Accessories / Smart Academy Graduation Cap SVG Overlay */}
      {mood === 'smart' && (
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
          <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible">
            <g transform="translate(18, -4)" className="drop-shadow-lg">
              <polygon points="32,0 64,12 32,24 0,12" fill="#1e293b" stroke="#0f172a" strokeWidth="2" />
              <rect x="18" y="11" width="28" height="9" fill="#334155" stroke="#0f172a" strokeWidth="2" />
              <path d="M 32 20 C 32 20, 32 24, 30 24" stroke="#fbbf24" strokeWidth="2" fill="none" />
              {/* Yellow tassel dangling down */}
              <motion.line
                x1="58"
                y1="10"
                x2="65"
                y2="28"
                stroke="#fbbf24"
                strokeWidth="2.5"
                animate={{ x2: [64, 66, 64] }}
                transition={{ repeat: Infinity, duration: 1.2 }}
              />
              <circle cx="65" cy="28" r="2.5" fill="#f59e0b" />
            </g>
          </svg>
        </div>
      )}

      {/* Accessories / Crypto Floating Bitcoin Badge SVG Overlay */}
      {mood === 'crypto' && (
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
          <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible">
            <motion.g
              transform="translate(74, 12)"
              className="drop-shadow-md"
              animate={{ y: [0, -4, 0] }}
              transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
            >
              <circle cx="10" cy="10" r="10" fill="#fbbf24" stroke="#d97706" strokeWidth="1.5" />
              <text x="7" y="15" fill="#ffffff" fontSize="13" fontWeight="bold" fontFamily="monospace">B</text>
            </motion.g>
          </svg>
        </div>
      )}

      {/* Accessories / Sad expression visual modifier */}
      {mood === 'sad' && (
        <div className="absolute inset-0 bg-blue-500/10 mix-blend-color-burn rounded-2xl pointer-events-none" />
      )}
    </div>
  );
}

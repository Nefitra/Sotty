/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles } from 'lucide-react';

export interface FloatingRewardParticle {
  id: string;
  type: 'xp' | 'point' | 'coin';
  x: number; // starting x coordinate %
  y: number; // starting y coordinate %
  delay: number;
}

interface RewardEffectsProps {
  triggerId: string | null; // change this to trigger a burst
  type: 'xp' | 'point' | 'coin' | 'all';
  count?: number;
}

export default function RewardEffects({ triggerId, type, count = 12 }: RewardEffectsProps) {
  const [particles, setParticles] = useState<FloatingRewardParticle[]>([]);

  useEffect(() => {
    if (!triggerId) return;

    // Generate cute particles distributed layout
    const newParticles: FloatingRewardParticle[] = [];
    const types: ('xp' | 'point' | 'coin')[] = [];
    
    if (type === 'all') {
      types.push('xp', 'point', 'coin');
    } else {
      types.push(type);
    }

    for (let i = 0; i < count; i++) {
      const pType = types[i % types.length];
      newParticles.push({
        id: `${triggerId}-${i}-${Math.random()}`,
        type: pType,
        x: 30 + Math.random() * 40, // Concentrated around middle horizontal
        y: 65 + Math.random() * 15, // Concentrated around middle-bottom of mock screens
        delay: (i * 0.08) + Math.random() * 0.05,
      });
    }

    setParticles(newParticles);

    // Clean up after animations complete (about 2.5 seconds total)
    const timer = setTimeout(() => {
      setParticles([]);
    }, 2500);

    return () => clearTimeout(timer);
  }, [triggerId, type, count]);

  if (particles.length === 0) return null;

  return (
    <div className="absolute inset-0 pointer-events-none z-50 overflow-hidden" id="flying-rewards-canvas">
      <AnimatePresence>
        {particles.map((p) => {
          // Define target positions pointing towards the balance cards at the top
          // XP goes to top-left (~15% x, ~10% y)
          // Points goes to top-center (~50% x, ~10% y)
          // Coins goes to top-right (~85% x, ~10% y)
          let targetX = 50;
          if (p.type === 'xp') targetX = 16;
          else if (p.type === 'point') targetX = 50;
          else if (p.type === 'coin') targetX = 84;

          const targetY = 10; // near the balance cards

          return (
            <motion.div
              key={p.id}
              initial={{ 
                x: `${p.x}%`, 
                y: `${p.y}%`, 
                scale: 0.2, 
                opacity: 0,
                rotate: 0 
              }}
              animate={{
                // Sequence of actions:
                // 1. Burst outwards and upwards
                // 2. Converge towards the specific balance display card at top
                x: [
                  `${p.x}%`, 
                  `${p.x + (Math.random() * 30 - 15)}%`, // expand
                  `${targetX}%`, // target
                ],
                y: [
                  `${p.y}%`, 
                  `${p.y - 15 - Math.random() * 15}%`, // hover raise
                  `${targetY}%`, // target
                ],
                scale: [0.3, 1.4, 0.5],
                opacity: [0, 1, 1, 0.4, 0],
                rotate: [0, Math.random() * 180 - 90, Math.random() * 360],
              }}
              transition={{
                duration: 1.6,
                ease: 'easeInOut',
                delay: p.delay,
              }}
              className="absolute w-8 h-8 flex items-center justify-center"
            >
              {p.type === 'xp' && (
                <div className="relative">
                  {/* Purple Star for XP */}
                  <span className="text-xl filter drop-shadow-[0_0_5px_rgba(168,85,247,0.8)]">★</span>
                  <span className="absolute -top-1 -right-1 text-[8px] text-purple-200">✨</span>
                </div>
              )}

              {p.type === 'point' && (
                <div className="relative">
                  {/* Orange Star/Bone for activity points */}
                  <span className="text-xl filter drop-shadow-[0_0_5px_rgba(245,158,11,0.8)]">⭐</span>
                  <span className="absolute -bottom-1 -left-1 text-[9px]">🦴</span>
                </div>
              )}

              {p.type === 'coin' && (
                <div className="relative w-7 h-7 flex items-center justify-center">
                  <div className="absolute inset-0 rounded-full bg-amber-400/30 blur-xs scale-110" />
                  {/* Miniature beautiful spotty coin */}
                  <svg viewBox="0 0 100 100" className="w-5 h-5 filter drop-shadow-[0_1px_2px_rgba(180,83,9,0.5)]">
                    <circle cx="50" cy="50" r="46" fill="url(#miniGoldGrad)" stroke="#b45309" strokeWidth="6" />
                    <circle cx="50" cy="50" r="34" fill="none" stroke="#fffbeb" strokeWidth="3" strokeDasharray="5 5" opacity="0.8" />
                    <text x="50" y="65" textAnchor="middle" fill="#78350f" fontSize="46" fontWeight="950" fontFamily="sans-serif">S</text>
                    <defs>
                      <linearGradient id="miniGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#fffbeb" />
                        <stop offset="40%" stopColor="#fbbf24" />
                        <stop offset="100%" stopColor="#d97706" />
                      </linearGradient>
                    </defs>
                  </svg>
                </div>
              )}
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, X, Heart, Shield, Award, BookOpen, Send, MessageCircle, HelpCircle, ArrowRight } from 'lucide-react';
import { User as UserType } from '../types';

import spottySittingSmiling from '../assets/images/spotty_sitting_smiling_1780442353193.png';
import spottyStandingWaving from '../assets/images/spotty_standing_waving_1780442371420.png';
import spottyStandingSmart from '../assets/images/spotty_standing_smart_1780442389046.png';
import spottyCyberSitting from '../assets/images/spotty_cyber_sitting_1780442874216.png';
import spottyCyberExcited from '../assets/images/spotty_cyber_excited_1780442891062.png';
import spottyCyberSmart from '../assets/images/spotty_cyber_smart_1780442909833.png';

interface SpottyAssistantProps {
  user: UserType;
  updateUserScore: (updates: Partial<UserType>) => void;
  activeTab: string;
}

interface Particle {
  id: number;
  emoji: string;
  x: number;
  y: number;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export default function SpottyAssistant({
  user,
  updateUserScore,
  activeTab,
}: SpottyAssistantProps) {
  const [isVisible, setIsVisible] = useState<boolean>(true);
  const [mood, setMood] = useState<'happy' | 'excited' | 'smart'>('happy');
  const [outfit, setOutfit] = useState<'classic' | 'cyber'>(() => {
    try {
      return (localStorage.getItem('spotty_assistant_outfit') as 'classic' | 'cyber') || 'classic';
    } catch {
      return 'classic';
    }
  });

  const [speech, setSpeech] = useState<string>('');
  const [showSpeech, setShowSpeech] = useState<boolean>(false);
  const [showBackpack, setShowBackpack] = useState<boolean>(false);
  const [particles, setParticles] = useState<Particle[]>([]);
  const speechTimeout = useRef<any>(null);
  const particleIdCounter = useRef<number>(0);

  // sound visual alert barks
  const [barkSound, setBarkSound] = useState<string>('');

  // Spotty Virtual Assistant chat states
  const [showChat, setShowChat] = useState<boolean>(false);
  const [childAge, setChildAge] = useState<number>(() => {
    try {
      const persisted = localStorage.getItem('spotty_chat_age');
      return persisted ? parseInt(persisted, 10) : 10;
    } catch {
      return 10;
    }
  });

  const [messages, setMessages] = useState<Message[]>(() => {
    try {
      const persisted = localStorage.getItem('spotty_chat_messages');
      if (persisted) {
        return JSON.parse(persisted);
      }
    } catch {}
    
    // Default initial welcoming message from Spotty dog
    return [
      {
        id: 'init-1',
        role: 'assistant',
        content: `Woof woof! 🐾 Hey there, young money wizard! I'm Spotty, your AI financial play-buddy and coach! I'm trained to help kids and teens understand pocket money, piggy banks, chores, budget formulas, inflation, and compound interest. I adjust my answers for ages 6 to 16! How can I help you save or earn today? Bark!`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }
    ];
  });

  const [inputMsg, setInputMsg] = useState<string>('');
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  // Auto scroll to latest chat
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping, showChat]);

  // Persist messages whenever changed
  useEffect(() => {
    try {
      localStorage.setItem('spotty_chat_messages', JSON.stringify(messages));
    } catch {}
  }, [messages]);

  // Handle saving age choice
  const handleAgeChange = (newAge: number) => {
    setChildAge(newAge);
    try {
      localStorage.setItem('spotty_chat_age', String(newAge));
    } catch {}
    
    // Quick puppy comments on age mode shift
    if (newAge <= 9) {
      triggerSpeech(`Woof! Kid Mode active! I will now explain concepts with simple candies, piggy jars, and puppy bones! 🦴`, 'happy', 5000);
    } else if (newAge <= 13) {
      triggerSpeech(`Pawsome! Pre-Teen mode! Let's talk about video game credits, sport gear savings, and allowances! 🎮`, 'excited', 5000);
    } else {
      triggerSpeech(`Smart cookie! Teen mode! Ready to explore smart freelancing, compounding growth, and debit cards! 🚀`, 'smart', 5000);
    }
  };

  // Bark templates
  const barks = ["Woof!", "Bark bark!", "Awooo!", "Sniff sniff!", "Yip!"];

  // Tips bank for quick widget triggers
  const tipsByTab: Record<string, string[]> = {
    dashboard: [
      "Compounding math is pure puppy magic! Start saving small coins today to build a massive cookie fort tomorrow! 🏰",
      "Compete to maintain your daily targets! Click the indicator card to unlock analytics! 🎯",
      "Bark! Have you claimed your Daily reward chest today? Check in now!",
      "Keeping a daily learning streak active secures extra token multipliers! 🔥",
      "Try long pressing the interactive goal pills on the dashboard to customize your theme style! 🎨"
    ],
    lessons: [
      "Every financial vocabulary word learned is a major stepping stone to wisdom! 🧠",
      "Stuck on a quiz? Spotty says review the flashcards slowly, clues are right there!",
      "Completing lessons grants Spotty Points (PTS). Spend them to feed me cookies! 🥯",
      "Let's tackle budget plans today! Budgeting is like packing a pup's backpack nicely!"
    ],
    missions: [
      "Weekly quests grant huge XP rewards! Let's complete them together, bark!",
      "Missions are special achievements! They boost our Spotty user ranking!",
      "Look at our current goals checklist. We are super close!"
    ],
    game: [
      "Deflexes ready! Choose the high-interest savings to beat inflation monsters! 👾",
      "Saving multipliers are doubled in the mini-game challenges today!",
      "Be smart! Keep some reserve cash instead of betting it all on risky assets! ⚖️"
    ],
    profile: [
      "Woof! You look extremely professional and clean today, " + user.name + "! ✨",
      "Level " + user.level + " is magnificent! Next rank is within your paw-reach!",
      "Look at our trophy collection! Each badge represents a cool money superpower!"
    ],
    general: [
      "Bark woof! Saving 20% of your allowance is a great general rule of thumb! 🪙",
      "Woof! Spotty is always here to coach you through pocket money challenges! 🐶",
      "Learning financial concepts is super fun when we study together! Let's go!",
      "A clever budget map helps you buy what's truly and deeply important first!"
    ]
  };

  // Helper to trigger floating bubble dialogue speech
  const triggerSpeech = (text: string, companionMood: 'happy' | 'excited' | 'smart' = 'happy', duration: number = 7000) => {
    setSpeech(text);
    setMood(companionMood);
    setShowSpeech(true);
    
    const randomBark = barks[Math.floor(Math.random() * barks.length)];
    setBarkSound(randomBark);
    setTimeout(() => setBarkSound(''), 1500);

    if (speechTimeout.current) clearTimeout(speechTimeout.current);
    speechTimeout.current = setTimeout(() => {
      setShowSpeech(false);
      setMood('happy');
    }, duration);
  };

  const triggerNotification = (text: string, companionMood: 'happy' | 'excited' | 'smart' = 'happy') => {
    triggerSpeech(text, companionMood, 5000);
  };

  // Swapping clothing styles
  const handleOutfitToggle = () => {
    const nextOutfit = outfit === 'classic' ? 'cyber' : 'classic';
    setOutfit(nextOutfit);
    try {
      localStorage.setItem('spotty_assistant_outfit', nextOutfit);
    } catch {}
    triggerNotification("Wearing my brand new " + nextOutfit + " clothing! How do I look? Woof!", "excited");
  };

  // Click on character triggers short random popup tip
  const handleSpottyClick = () => {
    const emojis = ['⭐', '🐾', '💰', '✨', '❤️'];
    const newParticles: Particle[] = [];
    for (let i = 0; i < 5; i++) {
      newParticles.push({
        id: particleIdCounter.current++,
        emoji: emojis[Math.floor(Math.random() * emojis.length)],
        x: (Math.random() - 0.5) * 60,
        y: -(Math.random() * 40 + 20),
      });
    }
    setParticles((prev) => [...prev, ...newParticles]);

    setTimeout(() => {
      setParticles((prev) => prev.filter(p => !newParticles.find(np => np.id === p.id)));
    }, 1200);

    const currentTabPhrases = tipsByTab[activeTab] || [];
    const generalPhrases = tipsByTab.general;
    const pool = [...currentTabPhrases, ...generalPhrases];
    const phrase = pool[Math.floor(Math.random() * pool.length)];
    
    triggerSpeech(phrase, 'excited');
  };

  // Feed treat helper: costs 5 Points
  const handleFeedSpotty = () => {
    if (user.points < 5) {
      triggerSpeech("Bark! We need at least 5 PTS to fetch a crunchy financial cookie! Complete a lesson first!", 'smart');
      return;
    }

    updateUserScore({
      points: Math.max(0, user.points - 5),
    });

    const cookieParticles: Particle[] = [];
    for (let i = 0; i < 8; i++) {
      cookieParticles.push({
        id: particleIdCounter.current++,
        emoji: i < 3 ? '🍪' : '❤️',
        x: (Math.random() - 0.5) * 80,
        y: -(Math.random() * 50 + 20),
      });
    }
    setParticles((prev) => [...prev, ...cookieParticles]);
    setTimeout(() => {
      setParticles((prev) => prev.filter(p => !cookieParticles.find(cp => cp.id === p.id)));
    }, 1500);

    triggerSpeech("CHOMP! 🍪 Crunchiest cookie ever! Spotty feels hyper-boosted now! Keep studying, buddy! Woof!", 'excited', 7000);
  };

  // Triggers sending message to Gemini API backend on server
  const handleSendChatMessage = async (presetText?: string) => {
    const textToSend = presetText || inputMsg;
    if (!textToSend.trim()) return;

    // Add user message to UI
    const userMsg: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    setInputMsg('');
    setIsTyping(true);
    setMood('smart');

    // Mini animation sparks
    const randomBark = barks[Math.floor(Math.random() * barks.length)];
    setBarkSound(randomBark);
    setTimeout(() => setBarkSound(''), 1500);

    try {
      // Map messages for Gemini API
      const conversationHistory = nextMessages.map(m => ({
        role: m.role,
        content: m.content
      }));

      const res = await fetch('/api/spotty/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: conversationHistory,
          age: childAge
        })
      });

      if (!res.ok) {
        throw new Error("Dog server error");
      }

      const data = await res.json();
      const botResponse = data.text || "Woof, I had a micro daydream! Let's talk about savings again!";

      // Add Spotty's response to UI
      const spottyMsg: Message = {
        id: `spotty-${Date.now()}`,
        role: 'assistant',
        content: botResponse,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages(prev => [...prev, spottyMsg]);
      setMood('excited');
    } catch (err) {
      console.error(err);
      const errMsg: Message = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        content: `Bark! My connection leash got a bit tangled! Please verify your internet or study keys in Settings, and let's try again! Woof!`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => [...prev, errMsg]);
      setMood('happy');
    } finally {
      setIsTyping(false);
    }
  };

  // Clearing history
  const handleClearHistory = () => {
    setMessages([
      {
        id: 'init-reset',
        role: 'assistant',
        content: `Reset complete! My digital memory is fresh like a newly washed tennis ball! 🐾 Ask me anything about pocket coins!`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }
    ]);
  };

  // Welcome popups on startup
  useEffect(() => {
    const timer = setTimeout(() => {
      triggerSpeech("Bark! Try tapping on my new 💬 AI Chat button to ask any money questions!", 'smart', 8000);
    }, 4500);
    return () => {
      clearTimeout(timer);
      if (speechTimeout.current) clearTimeout(speechTimeout.current);
    };
  }, []);

  const getImageSource = () => {
    if (outfit === 'cyber') {
      switch (mood) {
        case 'excited':
          return spottyCyberExcited;
        case 'smart':
          return spottyCyberSmart;
        case 'happy':
        default:
          return spottyCyberSitting;
      }
    } else {
      switch (mood) {
        case 'excited':
          return spottyStandingWaving;
        case 'smart':
          return spottyStandingSmart;
        case 'happy':
        default:
          return spottySittingSmiling;
      }
    }
  };

  return (
    <>
      {/* Floating Call whistle button if hidden */}
      {!isVisible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          onClick={() => {
            setIsVisible(true);
            setTimeout(() => {
              triggerSpeech("Woof! I'm back on duty! Did you miss me? Let's check some achievements! bark!", "excited");
            }, 300);
          }}
          className={`fixed bottom-24 right-5 z-40 p-3.5 rounded-full border shadow-xl flex items-center justify-center cursor-pointer select-none
            ${user.theme === 'dark' ? 'bg-[#18233c] border-slate-700 text-amber-400' : 'bg-amber-400 border-amber-300 text-white'}`}
          title="Call Spotty back!"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <span className="text-xs font-black flex items-center gap-1.5">
            <span>🐾 Call Spotty</span>
          </span>
        </motion.button>
      )}

      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.8 }}
            // Allows manual positional dragging across preview screen
            drag
            dragConstraints={{ left: -10, right: 305, top: -510, bottom: 20 }}
            dragElastic={0.1}
            dragMomentum={false}
            className="fixed bottom-24 right-7 z-40 flex flex-col items-end pointer-events-none"
            id="spotty-companion-draggable"
          >
            {/* Short floating speech bubble */}
            <AnimatePresence>
              {showSpeech && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.7, y: 15 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.8, y: 10 }}
                  className={`pointer-events-auto w-54 p-3.5 rounded-[24px] border shadow-2xl relative mb-2.5 mr-3 text-left leading-relaxed select-none
                    ${user.theme === 'dark' 
                      ? 'bg-slate-900/95 border-slate-800 text-white backdrop-blur-md' 
                      : 'bg-white/95 border-slate-100 text-slate-900 backdrop-blur-md'}`}
                  style={{ transformOrigin: 'bottom right' }}
                >
                  <div className="absolute -bottom-2.5 right-6 w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-t-[10px] border-t-white dark:border-t-slate-900" />
                  
                  <button 
                    onClick={() => setShowSpeech(false)}
                    className="absolute top-2 right-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
                    aria-label="Dismiss speech"
                  >
                    <X size={10} strokeWidth={3} />
                  </button>

                  <div className="flex items-center gap-1.5 mb-1.5 border-b border-slate-100 dark:border-slate-805 pb-1 shrink-0">
                    <span className="text-[10px] font-black uppercase text-brand-green flex items-center gap-1">
                      <span>🐶 Spotty</span>
                      {mood === 'excited' && <Sparkles size={8} className="text-amber-500 animate-spin" />}
                    </span>
                    {barkSound && (
                      <span className="text-[9px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 px-1 rounded animate-bounce">
                        {barkSound}
                      </span>
                    )}
                  </div>
                  
                  <p className="text-[10.5px] font-extrabold text-slate-700 dark:text-slate-200">
                    {speech}
                  </p>

                  <div className="mt-2.5 flex items-center gap-1.5 border-t border-slate-100 dark:border-slate-805 pt-2">
                    <button
                      onClick={handleFeedSpotty}
                      className="text-[8.5px] font-black px-2 py-1 rounded-xl bg-amber-500 hover:bg-amber-600 text-white cursor-pointer active:scale-95 transition-transform"
                      title="Spend 5 PTS to feed Spotty a cookie"
                    >
                      🍪 Cookie
                    </button>
                    <button
                      onClick={() => {
                        setShowChat(true);
                        setShowSpeech(false);
                      }}
                      className="text-[8.5px] font-black px-2 py-1 rounded-xl bg-brand-green hover:bg-emerald-600 text-white cursor-pointer active:scale-95 transition-transform flex items-center gap-0.5"
                    >
                      💬 AI Chat
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Sparkle burst animations */}
            <div className="absolute inset-0 pointer-events-none z-50">
              {particles.map((p) => (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 1, scale: 0.5, x: p.x, y: p.y }}
                  animate={{ opacity: 0, scale: 1.5, y: p.y - 75, rotate: (Math.random() - 0.5) * 60 }}
                  transition={{ duration: 1.1, ease: "easeOut" }}
                  className="absolute text-sm font-sans left-8 bottom-8"
                >
                  {p.emoji}
                </motion.div>
              ))}
            </div>

            {/* Character Mascot & Mini menu controls */}
            <div className="flex items-center gap-1 text-right pointer-events-auto relative">
              
              <div className="flex flex-col gap-1.5 mr-1">
                {/* Launch Chat Button */}
                <motion.button
                  whileHover={{ scale: 1.15 }}
                  whileTap={{ scale: 0.85 }}
                  onClick={() => setShowChat(!showChat)}
                  className={`p-1.5 rounded-full border shadow-lg flex items-center justify-center cursor-pointer select-none
                    ${showChat 
                      ? 'bg-brand-green border-brand-green text-white' 
                      : (user.theme === 'dark' ? 'bg-[#18233c] border-slate-700 text-brand-green' : 'bg-white border-slate-200 text-brand-green')}`}
                  title="Talk with Spotty's AI"
                >
                  <MessageCircle size={12} strokeWidth={3} />
                </motion.button>

                {/* Backpack Details Menu toggle */}
                <motion.button
                  whileHover={{ scale: 1.15 }}
                  whileTap={{ scale: 0.85 }}
                  onClick={() => setShowBackpack(!showBackpack)}
                  className={`p-1.5 rounded-full border shadow-lg flex items-center justify-center cursor-pointer select-none
                    ${showBackpack 
                      ? 'bg-yellow-500 border-yellow-500 text-white' 
                      : (user.theme === 'dark' ? 'bg-[#18233c] border-slate-700 text-yellow-500' : 'bg-white border-slate-200 text-slate-700')}`}
                  title="Spotty's active bag tracker"
                >
                  <span className="text-xs">🎒</span>
                </motion.button>

                {/* Let Companion Sleep/Hide */}
                <motion.button
                  whileHover={{ scale: 1.15 }}
                  whileTap={{ scale: 0.85 }}
                  onClick={() => setIsVisible(false)}
                  className={`p-1.5 rounded-full border shadow-lg flex items-center justify-center cursor-pointer select-none
                    ${user.theme === 'dark' ? 'bg-[#18233c] border-slate-700 text-red-400' : 'bg-white border-slate-200 text-red-500'}`}
                  title="Hide Spotty"
                >
                  <X size={10} strokeWidth={3} />
                </motion.button>
              </div>

              {/* Character Mascot image */}
              <motion.div
                onClick={handleSpottyClick}
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.92 }}
                animate={{
                  y: [0, -3.5, 0],
                }}
                transition={{
                  repeat: Infinity,
                  duration: 2.8,
                  ease: "easeInOut"
                }}
                className="w-20 h-20 relative rounded-full cursor-pointer select-none active:rotate-3 group flex items-center justify-center"
              >
                {/* Glowing halo behind pup */}
                <span className="absolute inset-0 rounded-full bg-brand-green/10 dark:bg-brand-green/5 scale-100 group-hover:scale-120 transition-transform duration-300" />
                
                <img
                  src={getImageSource()}
                  alt="Spotty"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-contain filter drop-shadow-xl"
                />

                <div className="absolute -top-1 -right-0.5 pointer-events-none">
                  <motion.span 
                    className="text-xs inline-block text-amber-400"
                    animate={{ scale: [1, 1.25, 1], opacity: [0.8, 1, 0.8] }}
                    transition={{ repeat: Infinity, duration: 1.6 }}
                  >
                    ✨
                  </motion.span>
                </div>
              </motion.div>
            </div>

            {/* Backpack Info Panel */}
            <AnimatePresence>
              {showBackpack && (
                <motion.div
                  initial={{ opacity: 0, height: 0, y: 8 }}
                  animate={{ opacity: 1, height: 'auto', y: 0 }}
                  exit={{ opacity: 0, height: 0, y: 8 }}
                  className={`pointer-events-auto w-54 rounded-[24px] border p-3.5 mt-2 shadow-2xl select-none text-left
                    ${user.theme === 'dark' ? 'bg-slate-900/95 border-slate-800 text-white backdrop-blur-md' : 'bg-white/95 border-slate-100 text-slate-800 backdrop-blur-md'}`}
                >
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-805 pb-1.5 mb-2 shrink-0">
                    <span className="text-[10px] font-black uppercase text-amber-500 flex items-center gap-1">
                      <span>🎒 Spotty's Bag</span>
                    </span>
                    <button 
                      onClick={() => setShowBackpack(false)}
                      className="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                    >
                      <X size={10} strokeWidth={3} />
                    </button>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <div className="flex justify-between items-center text-[10.5px]">
                      <span className="text-slate-400 font-extrabold flex items-center gap-1"><Heart size={10} className="text-rose-500" /> Happiness:</span>
                      <span className="font-extrabold text-rose-500">100% Sparkly</span>
                    </div>

                    <div className="flex justify-between items-center text-[10.5px]">
                      <span className="text-slate-400 font-extrabold flex items-center gap-1"><Award size={10} className="text-yellow-500" /> Active Streak:</span>
                      <span className="font-extrabold text-yellow-500">{user.streak} days 🔥</span>
                    </div>

                    <div className="flex justify-between items-center text-[10.5px]">
                      <span className="text-slate-400 font-extrabold flex items-center gap-1"><Shield size={10} className="text-brand-blue" /> Costume:</span>
                      <span className="font-black text-brand-blue uppercase text-[8.5px]">{outfit} Style</span>
                    </div>

                    <div className="flex justify-between items-center text-[10.5px]">
                      <span className="text-slate-400 font-extrabold flex items-center gap-1"><BookOpen size={10} className="text-brand-green" /> Vocabularies:</span>
                      <span className="font-extrabold text-brand-green">{user.learnedWords?.length || 0} terms</span>
                    </div>
                  </div>

                  <div className="mt-3.5 pt-2 border-t border-slate-100 dark:border-slate-805 flex flex-col gap-1.5">
                    <button
                      onClick={handleFeedSpotty}
                      className="w-full py-1.5 bg-amber-500 hover:bg-amber-650 text-white rounded-xl text-[9px] font-black uppercase text-center cursor-pointer transition-colors"
                    >
                      Feed spotty cookie 🍪
                    </button>
                    <button
                      onClick={handleOutfitToggle}
                      className="w-full py-1.5 bg-brand-blue hover:bg-blue-600 text-white rounded-xl text-[9px] font-black uppercase text-center cursor-pointer transition-colors"
                    >
                      Swap Clothing Style 👔
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Spotty Virtual AI Chat Modal */}
      <AnimatePresence>
        {showChat && (
          <div className="fixed inset-0 z-55 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.94, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.94, opacity: 0, y: 15 }}
              transition={{ type: "spring", stiffness: 320, damping: 26 }}
              className={`w-full max-w-md rounded-[32px] overflow-hidden shadow-2xl flex flex-col h-[540px] border relative
                ${user.theme === 'dark' ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-100 text-slate-800'}`}
            >
              {/* Header section with mascot */}
              <div className="p-4 flex items-center justify-between border-b shrink-0 relative bg-brand-green text-white">
                <div className="flex items-center gap-2 text-left">
                  <div className="w-10 h-10 rounded-full border border-white/20 bg-white/10 flex items-center justify-center overflow-hidden">
                    <img 
                      src={getImageSource()} 
                      alt="Spotty chat mascot" 
                      className="w-[85%] h-[85%] object-contain"
                    />
                  </div>
                  <div>
                    <h3 className="font-display font-black text-sm tracking-tight flex items-center gap-1.5">
                      <span>Spotty's AI Money Coach</span>
                      <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded-full font-bold">Kids v1.2</span>
                    </h3>
                    <p className="text-[10px] text-white/80 font-bold">Adapts financial analogies from ages 6 to 16</p>
                  </div>
                </div>

                {/* Close modal */}
                <button
                  onClick={() => setShowChat(false)}
                  className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors cursor-pointer text-white"
                  aria-label="Close Chat"
                >
                  <X size={16} strokeWidth={3} />
                </button>
              </div>

              {/* Age adaptive bar */}
              <div className={`px-4 py-2 flex flex-col gap-1 border-b shrink-0 text-left
                ${user.theme === 'dark' ? 'bg-slate-950/60' : 'bg-slate-50'}`}>
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Set Kid Age for Explanations:</span>
                  <span className="text-[11px] font-black text-brand-green bg-brand-green/10 px-2 py-0.5 rounded-full">
                    {childAge} Years Old
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="6"
                    max="16"
                    value={childAge}
                    onChange={(e) => handleAgeChange(parseInt(e.target.value, 10))}
                    className="flex-1 h-1.5 bg-slate-200 dark:bg-slate-805 rounded-lg appearance-none cursor-pointer accent-brand-green"
                  />
                  <span className="text-[10px] font-extrabold text-slate-500 dark:text-slate-400 min-w-[70px] text-right truncate">
                    {childAge <= 9 ? '🐶 Kid Easy' : childAge <= 13 ? '🎮 Pre-teen' : '🚀 Teen Pro'}
                  </span>
                </div>
              </div>

              {/* scrollable text screen area */}
              <div className={`flex-1 overflow-y-auto p-4 space-y-4 text-left
                ${user.theme === 'dark' ? 'bg-slate-950/20' : 'bg-slate-50/20'}`}>
                
                {messages.map((m, index) => {
                  const isSpotty = m.role === 'assistant';
                  return (
                    <div
                      key={m.id}
                      className={`flex gap-2.5 ${isSpotty ? 'justify-start' : 'justify-end'}`}
                    >
                      {/* Spotty avatar icon aligned with message */}
                      {isSpotty && (
                        <div className="w-7 h-7 rounded-full bg-amber-500/10 border border-amber-500/20 flex-shrink-0 flex items-center justify-center overflow-hidden">
                          <img 
                            src={getImageSource()} 
                            alt="spotty tiny" 
                            className="w-[90%] h-[90%] object-contain"
                          />
                        </div>
                      )}

                      {/* Chat bubble body */}
                      <div className="max-w-[75%] flex flex-col">
                        <div
                          className={`p-3 rounded-2xl text-[11px] font-bold leading-normal shadow-xs whitespace-pre-wrap
                            ${isSpotty 
                              ? (user.theme === 'dark' ? 'bg-slate-805 text-slate-150 rounded-tl-none border border-slate-800' : 'bg-slate-100 text-slate-800 rounded-tl-none') 
                              : 'bg-brand-green text-white rounded-tr-none'}`}
                        >
                          {m.content}
                        </div>
                        <span className={`text-[8.5px] text-slate-400 font-semibold mt-1 ml-1 ${!isSpotty && 'text-right mr-1'}`}>
                          {m.timestamp}
                        </span>
                      </div>
                    </div>
                  );
                })}

                {/* Spotty typing indicator */}
                {isTyping && (
                  <div className="flex gap-2.5 justify-start">
                    <div className="w-7 h-7 rounded-full bg-amber-500/10 border border-amber-500/20 flex-shrink-0 flex items-center justify-center overflow-hidden animate-pulse">
                      <img src={getImageSource()} alt="spotty tiny" className="w-[90%] h-[90%] object-contain" />
                    </div>
                    <div className="flex flex-col">
                      <div className={`p-3 rounded-2xl rounded-tl-none border
                        ${user.theme === 'dark' ? 'bg-slate-805 border-slate-800' : 'bg-slate-100 border-slate-200'}`}>
                        <div className="flex items-center gap-1">
                          <span className="text-[10px] font-black text-slate-400 animate-pulse uppercase tracking-widest mr-1">Spotty is sniffing bones...</span>
                          <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-bounce delay-100" />
                          <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-bounce delay-200" />
                          <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-bounce delay-300" />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* suggested instant questions if conversation has few logs */}
              {messages.length <= 2 && !isTyping && (
                <div className={`p-3 select-none text-left border-t shrink-0 flex flex-col gap-1.5
                  ${user.theme === 'dark' ? 'bg-slate-900/60' : 'bg-white'}`}>
                  <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1">
                    <HelpCircle size={10} className="text-amber-500" /> TAP to ask spotty instant puppy questions:
                  </span>
                  
                  <div className="grid grid-cols-2 gap-1.5">
                    {[
                      {
                        title: "🧐 What is standard inflation?",
                        prompt: "Bark! Why does stuff become more expensive over time? Can you explain what inflation is?"
                      },
                      {
                        title: "🐷 Piggy compounding magic!",
                        prompt: "Woof! How does compound interest help my piggy bank multiply or grow coins?"
                      },
                      {
                        title: "🍕 Needs vs Wants theory",
                        prompt: "I want to buy a cool video game cosmetic, but my allowance says snack goals first. What's the difference between Needs and Wants?"
                      },
                      {
                        title: "🚲 Tips to save for a bicycle",
                        prompt: "I really want to save and buy a brand new bicycle. Can Spotty give me a master savings plan to reach this goal?"
                      }
                    ].map((item, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSendChatMessage(item.prompt)}
                        className={`p-2 rounded-xl text-[10.5px] font-bold text-left transition-transform active:scale-97 cursor-pointer hover:border-brand-green/50 border flex flex-col justify-between h-14
                          ${user.theme === 'dark' ? 'bg-slate-950/70 border-slate-800 text-slate-100' : 'bg-slate-50 border-slate-200 text-slate-800'}`}
                      >
                        <span className="truncate w-full font-black text-[10px] text-brand-green">{item.title}</span>
                        <span className="text-[8.5px] text-slate-400 font-semibold line-clamp-1">Quick-click ask</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Chat Text Input footer controls */}
              <div className={`p-3.5 border-t flex flex-col gap-2 shrink-0
                ${user.theme === 'dark' ? 'bg-slate-950' : 'bg-white'}`}>
                
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendChatMessage();
                  }}
                  className="flex items-center gap-2"
                >
                  <input
                    type="text"
                    value={inputMsg}
                    onChange={(e) => setInputMsg(e.target.value)}
                    placeholder="Ask any clever money question... Woof!"
                    maxLength={140}
                    className={`flex-1 px-3.5 py-2.5 text-[11px] font-bold rounded-2xl outline-none border transition-colors
                      ${user.theme === 'dark' 
                        ? 'bg-slate-900 border-slate-800 text-white focus:border-slate-700' 
                        : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-slate-400'}`}
                  />
                  
                  <button
                    type="submit"
                    disabled={!inputMsg.trim() || isTyping}
                    className={`p-2.5 rounded-2xl transition-transform cursor-pointer active:scale-95 flex items-center justify-center text-white shadow-md
                      ${(!inputMsg.trim() || isTyping) 
                        ? 'bg-slate-350 dark:bg-slate-800 text-slate-500 cursor-not-allowed shadow-none' 
                        : 'bg-brand-green hover:bg-emerald-600'}`}
                  >
                    <Send size={12} strokeWidth={3} />
                  </button>
                </form>

                {/* extra action helpers */}
                <div className="flex items-center justify-between text-[9px] text-slate-400 font-semibold">
                  <span>Spotty replies instantly based on your Selected Age limit.</span>
                  <button
                    onClick={handleClearHistory}
                    className="text-red-500 hover:underline font-extrabold cursor-pointer"
                  >
                    Clear History
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

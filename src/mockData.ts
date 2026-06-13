/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Lesson, Mission, Achievement, StoreItem, DailyRewardDay } from './types';

export const mockLessons: Lesson[] = [
  {
    id: 'l1',
    category: 'basics',
    difficulty: 'beginner',
    rewardXp: 50,
    rewardPoints: 30,
    rewardTokens: 1,
    titleKey: 'lesson1_title',
    descKey: 'lesson1_desc',
    emoji: '💵',
    blocks: [
      { id: 'l1_b1', type: 'text', contentKey: 'lesson1_b1' },
      { id: 'l1_b2', type: 'tip', contentKey: 'lesson1_b2', emoji: '💡' },
      { id: 'l1_b3', type: 'quote', contentKey: 'lesson1_b3' }
    ],
    quiz: {
      id: 'l1_q',
      questionKey: 'lesson1_q',
      optionsKeys: ['lesson1_o1', 'lesson1_o2', 'lesson1_o3'],
      correctAnswerIndex: 1,
      explanationKey: 'lesson1_exp'
    }
  },
  {
    id: 'l2',
    category: 'saving',
    difficulty: 'beginner',
    rewardXp: 60,
    rewardPoints: 40,
    rewardTokens: 1,
    titleKey: 'lesson2_title',
    descKey: 'lesson2_desc',
    emoji: '🐷',
    blocks: [
      { id: 'l2_b1', type: 'text', contentKey: 'lesson2_b1' },
      { id: 'l2_b2', type: 'tip', contentKey: 'lesson2_b2', emoji: '🌟' },
      { id: 'l2_b3', type: 'warning', contentKey: 'lesson2_b3' }
    ],
    quiz: {
      id: 'l2_q',
      questionKey: 'lesson2_q',
      optionsKeys: ['lesson2_o1', 'lesson2_o2', 'lesson2_o3'],
      correctAnswerIndex: 1,
      explanationKey: 'lesson2_exp'
    }
  },
  {
    id: 'l3',
    category: 'budgeting',
    difficulty: 'intermediate',
    rewardXp: 80,
    rewardPoints: 50,
    rewardTokens: 2,
    titleKey: 'lesson3_title',
    descKey: 'lesson3_desc',
    emoji: '🫙',
    blocks: [
      { id: 'l3_b1', type: 'text', contentKey: 'lesson3_b1' },
      { id: 'l3_b2', type: 'tip', contentKey: 'lesson3_b2', emoji: '🗳️' },
      { id: 'l3_b3', type: 'quote', contentKey: 'lesson3_b3' }
    ],
    quiz: {
      id: 'l3_q',
      questionKey: 'lesson3_q',
      optionsKeys: ['lesson3_o1', 'lesson3_o2', 'lesson3_o3'],
      correctAnswerIndex: 1,
      explanationKey: 'lesson3_exp'
    }
  },
  {
    id: 'l4',
    category: 'crypto',
    difficulty: 'intermediate',
    rewardXp: 90,
    rewardPoints: 60,
    rewardTokens: 3,
    titleKey: 'lesson4_title',
    descKey: 'lesson4_desc',
    emoji: '🪙',
    blocks: [
      { id: 'l4_b1', type: 'text', contentKey: 'lesson4_b1' },
      { id: 'l4_b2', type: 'tip', contentKey: 'lesson4_b2', emoji: '⛓️' },
      { id: 'l4_b3', type: 'warning', contentKey: 'lesson4_b3' }
    ],
    quiz: {
      id: 'l4_q',
      questionKey: 'lesson4_q',
      optionsKeys: ['lesson4_o1', 'lesson4_o2', 'lesson4_o3'],
      correctAnswerIndex: 1,
      explanationKey: 'lesson4_exp'
    }
  },
  {
    id: 'l5',
    category: 'safety',
    difficulty: 'advanced',
    rewardXp: 100,
    rewardPoints: 80,
    rewardTokens: 4,
    titleKey: 'lesson5_title',
    descKey: 'lesson5_desc',
    emoji: '🛡️',
    blocks: [
      { id: 'l5_b1', type: 'text', contentKey: 'lesson5_b1' },
      { id: 'l5_b2', type: 'warning', contentKey: 'lesson5_b2' },
      { id: 'l5_b3', type: 'tip', contentKey: 'lesson5_b3', emoji: '👨‍👩‍👦' }
    ],
    quiz: {
      id: 'l5_q',
      questionKey: 'lesson5_q',
      optionsKeys: ['lesson5_o1', 'lesson5_o2', 'lesson5_o3'],
      correctAnswerIndex: 1,
      explanationKey: 'lesson5_exp'
    }
  }
];

export const mockMissions: Mission[] = [
  {
    id: 'm1',
    key: 'lesson_completed_1',
    type: 'daily',
    titleKey: 'm1_title',
    descKey: 'm1_desc',
    targetCount: 1,
    rewardPoints: 20,
    rewardXp: 30,
    rewardTokens: 1,
    actionType: 'lesson_completed'
  },
  {
    id: 'm2',
    key: 'quiz_answered_3',
    type: 'weekly',
    titleKey: 'm2_title',
    descKey: 'm2_desc',
    targetCount: 3,
    rewardPoints: 50,
    rewardXp: 80,
    rewardTokens: 2,
    actionType: 'quiz_answered'
  },
  {
    id: 'm3',
    key: 'invite_friend_1',
    type: 'weekly',
    titleKey: 'm3_title',
    descKey: 'm3_desc',
    targetCount: 1,
    rewardPoints: 40,
    rewardXp: 50,
    rewardTokens: 1,
    actionType: 'invite_friend'
  },
  {
    id: 'm4',
    key: 'learn_financial_word_1',
    type: 'daily',
    titleKey: 'm4_title',
    descKey: 'm4_desc',
    targetCount: 1,
    rewardPoints: 15,
    rewardXp: 20,
    rewardTokens: 0,
    actionType: 'learn_financial_word'
  }
];

export const mockAchievements: Achievement[] = [
  {
    id: 'ach1',
    titleKey: 'ach1_title',
    descKey: 'ach1_desc',
    badgeEmoji: '🪙',
    requirementLessons: 1
  },
  {
    id: 'ach2',
    titleKey: 'ach2_title',
    descKey: 'ach2_desc',
    badgeEmoji: '🔥',
    requirementStreaks: 3
  },
  {
    id: 'ach3',
    titleKey: 'ach3_title',
    descKey: 'ach3_desc',
    badgeEmoji: '👑',
    requirementXp: 500
  }
];

export const mockStoreItems: StoreItem[] = [
  {
    id: 'store_item_🎓',
    titleKey: 'store1_title',
    descKey: 'store1_desc',
    costPoints: 120,
    emoji: '🎓',
    category: 'avatar'
  },
  {
    id: 'store_item_🛡️',
    titleKey: 'store2_title',
    descKey: 'store2_desc',
    costPoints: 200,
    emoji: '🛡️',
    category: 'booster'
  },
  {
    id: 'store_item_🏆',
    titleKey: 'store3_title',
    descKey: 'store3_desc',
    costPoints: 350,
    emoji: '🏆',
    category: 'reward'
  },
  {
    id: 'store_item_📦',
    titleKey: 'store4_title',
    descKey: 'store4_desc',
    costPoints: 100,
    emoji: '📦',
    category: 'reward',
    isTonExclusive: true
  }
];

export const mockDailyRewards: DailyRewardDay[] = [
  { day: 1, xpReward: 10, pointsReward: 10, tokensReward: 0 },
  { day: 2, xpReward: 20, pointsReward: 15, tokensReward: 0 },
  { day: 3, xpReward: 30, pointsReward: 20, tokensReward: 1 },
  { day: 4, xpReward: 40, pointsReward: 25, tokensReward: 0 },
  { day: 5, xpReward: 50, pointsReward: 35, tokensReward: 1 },
  { day: 6, xpReward: 65, pointsReward: 50, tokensReward: 1 },
  { day: 7, xpReward: 100, pointsReward: 100, tokensReward: 5 }
];

export interface Scenario {
  id: string;
  emoji: string;
  titles: Record<string, string>;
  scenarioTexts: Record<string, string>;
  options: {
    id: string;
    textKeys: Record<string, string>;
    isCorrect: boolean;
    explanationKeys: Record<string, string>;
    pointsGained: number;
    xpGained: number;
  }[];
}

export const mockScenarios: Scenario[] = [
  {
    id: 'scen1',
    emoji: '🍬',
    titles: {
      en: 'The Bubble Gum Dilemma',
      ru: 'Дилемма жвачки',
      de: 'Das Kaugummi-Dilemma',
      es: 'La Dilema de los Chicles'
    },
    scenarioTexts: {
      en: 'You get $10 pocket money for cleaning your room. You spot 10 delicious giant rainbow bubblegum packs at the local shop costing $1 each. What do you do?',
      ru: 'Тебе дали 100 рублей карманных денег за уборку комнаты. В магазине у дома как раз завезли твои любимые жвачки по 10 рублей. Что сделаешь?',
      de: 'Du bekommst 10 € Taschengeld fürs Zimmeraufräumen. Im Laden siehst du 10 bunte Riesen-Kaugummis für je 1 €. Was tust du?',
      es: 'Recibes $10 de bolsillo por limpiar tu habitación. Ves 10 paquetes de chicles arcoíris gigantes en la tienda a $1 cada uno. ¿Qué haces?'
    },
    options: [
      {
        id: 'opt1_a',
        textKeys: {
          en: 'Spend all $10 right now on bubble gums to enjoy them immediately!',
          ru: 'Потратить всё на жвачки прямо сейчас, гулять так гулять!',
          de: 'Gib alle 10 € sofort für Kaugummis aus. Voller Genuss jetzt!',
          es: '¡Gasta los $10 ahora mismo en chicles para disfrutarlos de inmediato!'
        },
        isCorrect: false,
        explanationKeys: {
          en: 'Oops! Eating 10 packs at once will give you a stomach ache, and tomorrow you will have $0 left for cool activities!',
          ru: 'Ой! Съесть 10 пачек сразу — заболит живот, а завтра у тебя останется 0 рублей на действительно крутые игры!',
          de: 'Hoppla! 10 Packungen auf einmal machen Bauchschmerzen und morgen hast du 0 € für coolere Sachen übrig!',
          es: '¡Ups! Comer 10 paquetes a la vez te dará dolor de estómago, ¡y mañana te quedarán $0 para hacer cosas divertidas!'
        },
        pointsGained: -10,
        xpGained: 5
      },
      {
        id: 'opt1_b',
        textKeys: {
          en: 'Buy 1 Pack ($1) as a treat, and deposit $9 into your smart saving jar.',
          ru: 'Купить 1 жвачку (10 р) как награду, а остальные 90 р отложить в копилку.',
          de: 'Kaufe 1 Kaugummi (1 €) als Belohnung und lege 9 € ins Sparschwein.',
          es: 'Compra 1 paquete ($1) para darte un gusto y pon $9 en tu frasco de ahorro.'
        },
        isCorrect: true,
        explanationKeys: {
          en: 'Excellent! You satisfied your cravings with patience and saved 90% of your money for bigger future aspirations!',
          ru: 'Отлично! Ты порадовал себя одной вкусняшкой и сохранил 90% капитала на действительно важные вещи!',
          de: 'Super! Du hast dir etwas gegönnt und trotzdem 90 % deines Geldes für größere Träume gespart!',
          es: '¡Excelente! ¡Satisfecho con paciencia y ahorraste el 90% de tu dinero para metas mayores!'
        },
        pointsGained: 25,
        xpGained: 20
      }
    ]
  },
  {
    id: 'scen2',
    emoji: '🧙‍♂️',
    titles: {
      en: 'The Friendly Internet Wizard',
      ru: 'Добрый интернет-волшебник',
      de: 'Der freundliche Internet-Zauberer',
      es: 'El Mago de Internet'
    },
    scenarioTexts: {
      en: 'An account called "Mister_Mega_Rich" messages you on Telegram: "Send me 10 of your Spotty Points, and my automated code will multiply it and send you back 100!" What do you say?',
      ru: 'В Телеграме пишет аккаунт «Mister_Mega_Rich»: «Просто переведи мне 10 своих баллов Спотти, и мой защищенный робот умножит их и вернет тебе 100!» Твои действия?',
      de: 'Ein Profil namens "Mister_Mega_Rich" schreibt dir bei Telegram: "Schicke mir 10 Deiner Spotty-Punkte und mein Computer-Bot schickt dir 100 zurück!" Was sagst du?',
      es: 'Una cuenta llamada "Mister_Mega_Rich" te escribe por Telegram: "¡Envíame 10 de tus Puntos Spotty y mi robot te devolverá 100 multiplicados!" ¿Qué respondes?'
    },
    options: [
      {
        id: 'opt2_a',
        textKeys: {
          en: 'Sounds amazing! Send him the points immediately to get rich.',
          ru: 'Звучит круто! Отправлю баллы сразу, хочу стать богатым.',
          de: 'Klingt genial! Sende die Punkte sofort, um reich zu werden.',
          es: '¡Suena genial! Envía los puntos de inmediato para hacerte rico.'
        },
        isCorrect: false,
        explanationKeys: {
          en: 'Wait! This is a classic "Double Your Money" scam. They take your points and block you instantly.',
          ru: 'Стоп! Это классический обман. Мошенник заберет твои баллы и сразу добавит в черный список!',
          de: 'Achtung! Das ist ein typischer Betrug. Sie nehmen deine Punkte und blockieren dich sofort.',
          es: '¡Cuidado! Esto es una estafa clásica. Se quedarán con tus puntos y te bloquearán.'
        },
        pointsGained: -15,
        xpGained: 5
      },
      {
        id: 'opt2_b',
        textKeys: {
          en: 'Ignore the message, block the user, and notify an adult or Spotty Support.',
          ru: 'Проигнорировать, заблокировать его и рассказать родителям.',
          de: 'Ignoriere die Nachricht, blockiere den Nutzer und rede mit deinen Eltern.',
          es: 'Ignora el mensaje, bloquea al usuario y avisa a tus padres.'
        },
        isCorrect: true,
        explanationKeys: {
          en: 'You are a safe internet warrior! Spotty jumps with extreme happiness! Secret passwords and funds must always stay secret!',
          ru: 'Ты настоящий молодец! Спотти прыгает от радости. Секретные пароли и средства должны всегда оставаться защищенными!',
          de: 'Du bist ein echter Sicherheitsheld! Spotty hüpft vor Freude. Vertrauliche Daten bleiben verschlossen!',
          es: '¡Eres un guerrero digital seguro! Spotty salta de felicidad. ¡Tus datos y claves deben ser privados!'
        },
        pointsGained: 30,
        xpGained: 25
      }
    ]
  },
  {
    id: 'scen3',
    emoji: '🚴',
    titles: {
      en: 'The Dream Bike Goal',
      ru: 'Мечта о велосипеде',
      de: 'Der Traum vom Fahrrad',
      es: 'La Bici de tus Sueños'
    },
    scenarioTexts: {
      en: 'There is a beautiful blue sports bicycle costing $50. You save $5 each week from helpful household chores. A new video game comes out for $25. What is the plan?',
      ru: 'Ты мечтаешь о крутом велике за 500 рублей. Убираясь дома, ты можешь откладывать по 50 рублей в неделю. Но тут выходит игра за 250 рублей. План?',
      de: 'Du sparst auf ein blaues Sportfahrrad für 50 €. Du kannst wöchentlich 5 € durch Fleiß sparen. Jetzt kommt ein neues Konsolenspiel für 25 € heraus. Dein Plan?',
      es: 'Hay una bicicleta deportiva hermosa de $50. Ahorras $5 cada semana por hacer tareas. Sale un videojuego nuevo de $25. ¿Cuál es el plan?'
    },
    options: [
      {
        id: 'opt3_a',
        textKeys: {
          en: 'Buy the video game now. Buying a bicycle is too many weeks away anyway.',
          ru: 'Куплю игру сейчас. Велосипед копить слишком долго, не хочу ждать.',
          de: 'Kaufe das Spiel sofort. Bis zum Fahrrad dauert es mir zu lange.',
          es: 'Compra el juego ahora. Esperar para la bicicleta toma demasiadas semanas.'
        },
        isCorrect: false,
        explanationKeys: {
          en: 'Patience, cadet! If you build bad spending loops, you will never unlock grand prizes like the bicycle.',
          ru: 'Терпение, кадет! Если поддаваться мимолетным желаниям, крупные цели так и останутся неисполнимыми.',
          de: 'Geduld! Wenn du dein Erspartes ständig ausgibst, erreichst du deine großen Ziele nie.',
          es: '¡Paciencia! Si gastas tus ahorros en pequeños antojos, nunca alcanzarás tus grandes metas de ahorro.'
        },
        pointsGained: -5,
        xpGained: 5
      },
      {
        id: 'opt3_b',
        textKeys: {
          en: 'Stick to the savings plan! Buy the bicycle first, then budget for the video game later.',
          ru: 'Продолжить копить! Сначала купить главную вещь (велик), а игру запланировать позже.',
          de: 'Bleibe beim Sparplan! Kaufe erst das Fahrrad und plane das Spiel für später ein.',
          es: '¡Mantén el plan de ahorro! Compra la bicicleta primero, luego planifica para el juego.'
        },
        isCorrect: true,
        explanationKeys: {
          en: 'Magnificent vision! You stick to your goals like a legendary financial supervisor. Self-discipline rules!',
          ru: 'Великолепное решение! Ты верен мечте как профессиональный инвестор. Дисциплина окупается велосипедными прогулками!',
          de: 'Großartig! Du bleibst fokussiert wie ein Profi. Disziplin zahlt sich durch Radtouren im Sommer aus!',
          es: '¡Decisión magnífica! Te mantienes enfocado en tus prioridades. ¡La disciplina se premia!'
        },
        pointsGained: 30,
        xpGained: 20
      }
    ]
  }
];

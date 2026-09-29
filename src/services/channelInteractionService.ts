import { CommentItem, CommentReplyItem, VideoItem } from '../types';

export interface FamousBlogger {
  id: string;
  name: string;
  handle: string;
  avatarColor: string;
  subscribers: number;
  quotes: string[];
}

export const FAMOUS_BLOGGERS: FamousBlogger[] = [
  {
    id: 'chan_cyber_investigator',
    name: 'Кибер Детектив',
    handle: '@cyber_detective',
    avatarColor: '#dc2626',
    subscribers: 284000,
    quotes: [
      'Хм, интересное видео. Проверил по базам данных — контент оригинальный и качественный, респект автору! 🕵️‍♂️',
      'Дело закрыто: этот ролик заслуживает миллиона просмотров! Залетел оценить подачу и монтаж. 🔎',
      'Любопытный материал. Внимательно слежу за развитием твоего канала! Детектив одобряет 👍',
      'Провел экспресс-анализ: монтаж бодрый, идея сильная. Продолжай в том же духе!',
      'Заметил этот ролик в рекомендациях. Качественная работа, однозначно лайк от Детектива! 🕵️‍♂️🔥',
    ],
  },
  {
    id: 'chan_kompot',
    name: 'Компот',
    handle: '@kompot',
    avatarColor: '#10b981',
    subscribers: 14200000,
    quotes: [
      'Привет от Компота! Видос получился очень душевным и крутым, продолжай в том же духе! 👍🌾',
      'Ого, прикольное видео! Чем-то напомнило мои первые похождения в деревне номер 13) Лайк от меня! 🔥',
      'Классный ролик! Жители деревни точно оценили бы такой контент! Удачи с развитием канала! ⛏️',
      'Привет! Заглянул на огонек, ролик реально годный. Жму руку! 🤝',
      'Круто снято! Всегда радует видеть такой креативный подход. Удачи бро! 🌾🔥',
    ],
  },
  {
    id: 'chan_mrbeast',
    name: 'MrBeast',
    handle: '@MrBeast',
    avatarColor: '#06b6d4',
    subscribers: 365000000,
    quotes: [
      'Just watched this and it is INSANE! Keep up the amazing grind! 🚀💵',
      'This video is awesome! Dropping a like and huge respect from the MrBeast team! 🔥',
      'Love the energy here! Keep making crazy videos! 💯',
      'Great work! YouTube needs more creators with this level of dedication! 🏆',
    ],
  },
  {
    id: 'chan_meme_hub',
    name: 'Влад А4',
    handle: '@a4omg',
    avatarColor: '#f59e0b',
    subscribers: 48500000,
    quotes: [
      'ВАУ! Получилось нереально круто и весело! Ставлю лайк от всей команды А4! ⚡️',
      'Офигеть, ролик просто бомба! Смеялся от души, респект автору! 💥',
      'Крутой вайб! Залетает на ура, жду новых видео! 🔥',
      'А4 команда одобряет! Продолжай разрывать тренды! 🚀',
    ],
  },
  {
    id: 'chan_tech_future',
    name: 'Роберт До Нила',
    handle: '@robert_do_nila',
    avatarColor: '#3b82f6',
    subscribers: 245000,
    quotes: [
      'Монтаж и динамика на высоте! Очень круто поработал со звуком и кадрами, лайк! 🎬',
      'Как видеомейкер заявляю: сделано со вкусом и душой! Респект! ✌️',
      'Отличная склейка и цветокор! Видно, сколько часов ушло на рендер. Мое почтение!',
    ],
  },
  {
    id: 'chan_kiselchik',
    name: 'Кисельчик',
    handle: '@kiselchik',
    avatarColor: '#f59e0b',
    subscribers: 432000,
    quotes: [
      'Годный контент! Заценил эффекты и подачу, однозначно лайк от Кисельчика! 🔥',
      'Круто вышло! Всегда приятно видеть такие качественные работы на платформе!',
      'Монтаж прям радует глаз, молодец! 🚀',
    ],
  },
  {
    id: 'chan_edison',
    name: 'Эдисон',
    handle: '@edisonpts',
    avatarColor: '#ec4899',
    subscribers: 15400000,
    quotes: [
      'ЭТО ПРОСТО ЭПИК! Лайк за старания и настроение! 🔥',
      'Ха-ха, посмеялся от души! Топовый выпуск, красавчик!',
    ],
  },
  {
    id: 'chan_fixeye',
    name: 'Фиксай',
    handle: '@fixeye',
    avatarColor: '#8b5cf6',
    subscribers: 10100000,
    quotes: [
      'Огонь ролик! Залетел на одном дыхании, респект автору! 🎮',
      'Крутой видос, продолжай снимать в том же духе!',
    ],
  },
];

// Standard author responses to general haters
export const GENERAL_AUTHOR_TO_HATER = [
  'Спасибо за активность и продвижение видео в алгоритмах! Хейтеры мотивируют расти быстрее 😉',
  'Не нравится — не смотри, тебя никто насильно не заставляет. А мы идем только вперед!',
  'Конструктивную критику я всегда ценю, а пустой хейт только показывает твой уровень 😌',
  'Завидуй молча, пока мы с подписчиками делаем следующий шедевр 💪🔥',
  'Твой гневный коммент отлично поднимает видео в тренды, спасибо за внимание!)',
];

// Standard fan responses defending the author
export const GENERAL_FAN_DEFENSES = [
  'Не слушай этого токсика, видео шикарное! 🔥',
  'Сам попробуй хоть одно видео снять и смонтировать, клоун 🤡',
  'В бан его! Автор лучший, продолжай!',
  'Иди дальше завидуй, ролик отличный!',
  'А мне очень понравилось, хейтер просто мимо проходил.',
];

// Standard author responses to fans
export const GENERAL_AUTHOR_TO_FAN = [
  'Спасибо огромное за поддержку! Ради таких зрителей и хочется творить дальше! ❤️🔥',
  'Спасибо за такие добрые и теплые слова! Рад стараться для вас!)',
  'Обнял! В следующем ролике приготовлю еще больше крутого контента! 🚀',
  'Ценю каждого из вас! Спасибо, что ты со мной! ✨',
  'Очень приятно читать такие комментарии! Сделал мой день!) ❤️',
];

// Special author responses for ЭЙР
export const AIR_AUTHOR_TO_FAN = [
  'Спасибо всем за поддержку! Рад, что шортс залетел и вам понравилось! 🔥❤️',
  'Ценю каждого зрителя! Очень приятно видеть столько тепла в комментариях! ✨',
  'Спасибо за просмотр! Монтировал этот шортс несколько дней, рад вашей отдаче! 🚀',
  'Спасибо огромное! Читаю ваши комменты с улыбкой, вы лучшие! 💫',
  'Рад стараться для вас! Всем огромное спасибо за активность и лайки! ❤️',
];

export const AIR_AUTHOR_TO_HATER = [
  'Критику принимаю, но сюжет задумывался именно таким! Спасибо за просмотр и актив 😉',
  'У каждого свое мнение, но я делаю контент от души. Спасибо за фидбек!',
  'Главное — не стоять на месте и развиваться. Спасибо за комментарий!',
];

export const AIR_AUTHOR_TO_NORMAL = [
  'Спасибо за просмотр и оценку! Рад, что ты обратил внимание на эту деталь 👍',
  'Благодарю за отзыв! Всегда интересно читать ваши мысли под шортсами ✨',
  'Спасибо за обратную связь! Буду стараться делать еще кинематографичнее 🎬',
];

// Standard fan echoes
export const GENERAL_FAN_ECHOES = [
  'Полностью согласен с комментарием! Ролик пушка! 🔥',
  'Плюсую! Лучший канал!',
  'Топ коммент, автор заслуживает миллионы просмотров!',
];

// Standard author responses to normal viewers
export const GENERAL_AUTHOR_TO_NORMAL = [
  'Спасибо за просмотр и конструктивный отзыв! Обязательно учту твое пожелание в новых роликах 👍',
  'Рад, что ты обратил на это внимание! Монтаж занял кучу времени, но результат того стоил.',
  'Спасибо за обратную связь! Всегда читаю такие адекватные комментарии.',
  'Кстати, отличная мысль! Попробую реализовать это в одном из будущих видео! ✌️',
];

// Standard normal echoes
export const GENERAL_NORMAL_ECHOES = [
  'Кстати да, интересная мысль.',
  'Тоже об этом подумал во время просмотра.',
  'Согласен, хорошая деталь.',
];

/**
 * Generates a full set of replies from the channel author and community for ANY comment
 */
export function generateRepliesForComment(
  commentText: string,
  commentType: CommentItem['type'],
  videoAuthor: string,
  _isKiselchikVideo: boolean = false
): CommentReplyItem[] {
  const now = Date.now();
  const replies: CommentReplyItem[] = [];
  const isAirAuthor = videoAuthor.toLowerCase().includes('эйр') || videoAuthor.toLowerCase() === 'air';

  if (commentType === 'hater') {
    // 1. Author's reply to hater
    const haterPool = isAirAuthor ? AIR_AUTHOR_TO_HATER : GENERAL_AUTHOR_TO_HATER;
    const authorText =
      haterPool[Math.floor(Math.random() * haterPool.length)];

    replies.push({
      id: 'rep_auth_' + now + '_' + Math.random().toString(36).substring(2, 6),
      author: videoAuthor,
      text: authorText,
      likes: Math.floor(Math.random() * 320) + 120,
      timestamp: now + 300,
      isAuthor: true,
      verified: true,
      avatarColor: isAirAuthor ? '#0284c7' : '#3ea6ff',
    });

    // 2. Fan defending the author
    const fanDefense =
      GENERAL_FAN_DEFENSES[Math.floor(Math.random() * GENERAL_FAN_DEFENSES.length)];

    replies.push({
      id: 'rep_def1_' + now + '_' + Math.random().toString(36).substring(2, 6),
      author: ['Max_Gamer', 'Danil_Pro', 'Vika_Craft', 'Alex_Real', 'Sonya_Play'][
        Math.floor(Math.random() * 5)
      ],
      text: fanDefense,
      likes: Math.floor(Math.random() * 85) + 20,
      timestamp: now + 800,
      avatarColor: '#10b981',
    });

    // 3. Second fan defending if hated hard
    if (Math.random() < 0.6) {
      replies.push({
        id: 'rep_def2_' + now + '_' + Math.random().toString(36).substring(2, 6),
        author: ['TrueFan_2026', 'Kirill_Official', 'NikitOS', 'Egor_Bro'][
          Math.floor(Math.random() * 4)
        ],
        text: 'Правильно автор сказал! Не нравится — иди мимо.',
        likes: Math.floor(Math.random() * 45) + 10,
        timestamp: now + 1400,
        avatarColor: '#8b5cf6',
      });
    }
  } else if (commentType === 'fan' || commentType === 'subscriber') {
    // 1. Author's heartfelt reply
    let authorText = '';
    const textLower = commentText.toLowerCase();
    if (textLower.includes('пак') || textLower.includes('скачать')) {
      const packReplies = [
        'Ссылка на пак монтажа в описании роликов! Пользуйтесь на здоровье 🔥',
        'Пак монтажа полностью бесплатный, без вирусов и ограничений! Рад, что пригодился!',
        'Рад, что пак зашел! В следующем ролике добавлю ещё крутых пресетов и звуков!',
      ];
      authorText = packReplies[Math.floor(Math.random() * packReplies.length)];
    } else if (textLower.includes('совет') || textLower.includes('монтаж') || textLower.includes('начинающ')) {
      const adviceReplies = [
        'Рад помочь начинающим! Главное — тренироваться каждый день и не перегружать склейки эффектами 👍',
        'Новичкам советую CapCut для быстрого старта, а для сложного монтажа — Premiere Pro!',
        'Спасибо за отзыв! Скоро сделаю вторую часть с секретами динамичного монтажа!',
      ];
      authorText = adviceReplies[Math.floor(Math.random() * adviceReplies.length)];
    } else {
      const fanPool = isAirAuthor ? AIR_AUTHOR_TO_FAN : GENERAL_AUTHOR_TO_FAN;
      authorText = fanPool[Math.floor(Math.random() * fanPool.length)];
    }

    replies.push({
      id: 'rep_auth_' + now + '_' + Math.random().toString(36).substring(2, 6),
      author: videoAuthor,
      text: authorText,
      likes: Math.floor(Math.random() * 240) + 80,
      timestamp: now + 250,
      isAuthor: true,
      verified: true,
      avatarColor: isAirAuthor ? '#0284c7' : '#3ea6ff',
    });

    // 2. Other viewer agreeing
    const echoText =
      GENERAL_FAN_ECHOES[Math.floor(Math.random() * GENERAL_FAN_ECHOES.length)];

    replies.push({
      id: 'rep_echo_' + now + '_' + Math.random().toString(36).substring(2, 6),
      author: ['SuperFan_01', 'Oleg_Vibe', 'Nastya_Art', 'Dmitry_Cool'][
        Math.floor(Math.random() * 4)
      ],
      text: echoText,
      likes: Math.floor(Math.random() * 50) + 15,
      timestamp: now + 750,
      avatarColor: '#f59e0b',
    });
  } else {
    // Normal comment: author engages
    const normalPool = isAirAuthor ? AIR_AUTHOR_TO_NORMAL : GENERAL_AUTHOR_TO_NORMAL;
    const authorText =
      normalPool[Math.floor(Math.random() * normalPool.length)];

    replies.push({
      id: 'rep_auth_' + now + '_' + Math.random().toString(36).substring(2, 6),
      author: videoAuthor,
      text: authorText,
      likes: Math.floor(Math.random() * 140) + 40,
      timestamp: now + 350,
      isAuthor: true,
      verified: true,
      avatarColor: isAirAuthor ? '#0284c7' : '#3ea6ff',
    });

    if (Math.random() < 0.5) {
      replies.push({
        id: 'rep_norm_' + now + '_' + Math.random().toString(36).substring(2, 6),
        author: ['Gamer_Viewer', 'Pro_User', 'Sergey_K'][Math.floor(Math.random() * 3)],
        text: GENERAL_NORMAL_ECHOES[Math.floor(Math.random() * GENERAL_NORMAL_ECHOES.length)],
        likes: Math.floor(Math.random() * 30) + 5,
        timestamp: now + 900,
        avatarColor: '#06b6d4',
      });
    }
  }

  return replies;
}

/**
 * Generates an instant, personalized reply from the channel author and community
 * when a user leaves a comment on ANY video.
 */
export function generateAuthorInstantReply(
  userCommentText: string,
  videoAuthor: string,
  isKiselchikVideo: boolean = false
): CommentReplyItem[] {
  const now = Date.now();
  const lower = userCommentText.toLowerCase();

  const isHater =
    lower.includes('говно') ||
    lower.includes('хрень') ||
    lower.includes('кринж') ||
    lower.includes('вор') ||
    lower.includes('спиздил') ||
    lower.includes('парадиру') ||
    lower.includes('пародиру') ||
    lower.includes('дизлайк') ||
    lower.includes('отписка') ||
    lower.includes('уебок') ||
    lower.includes('бездарь') ||
    lower.includes('даун');

  const isFan =
    lower.includes('лучш') ||
    lower.includes('топ') ||
    lower.includes('пушк') ||
    lower.includes('красав') ||
    lower.includes('обожаю') ||
    lower.includes('фанат') ||
    lower.includes('люблю') ||
    lower.includes('огонь') ||
    lower.includes('бомб') ||
    lower.includes('спасибо');

  const commentType: CommentItem['type'] = isHater ? 'hater' : isFan ? 'fan' : 'normal';

  return generateRepliesForComment(userCommentText, commentType, videoAuthor, isKiselchikVideo);
}

/**
 * Generates a VIP comment from a famous blogger (Кибер Детектив, Компот, MrBeast, А4, etc.)
 */
export function generateVipBloggerComment(
  video: VideoItem,
  specificBloggerId?: string
): CommentItem {
  const now = Date.now();

  // Pick a famous blogger (not the author of this video)
  let eligible = FAMOUS_BLOGGERS.filter(
    (b) => b.name.toLowerCase() !== video.channelName.toLowerCase()
  );
  if (specificBloggerId) {
    const found = eligible.find((b) => b.id === specificBloggerId);
    if (found) eligible = [found];
  }

  const blogger = eligible[Math.floor(Math.random() * eligible.length)] || FAMOUS_BLOGGERS[0];
  const quote = blogger.quotes[Math.floor(Math.random() * blogger.quotes.length)];

  // VIP Blogger receives lots of likes (850 - 4500)
  const likes = Math.floor(Math.random() * 3650) + 850;

  // Fan excitement replies for this blogger
  const fanReplies: CommentReplyItem[] = [
    {
      id: 'rep_auth_' + now,
      author: video.channelName,
      text: `Ого, ${blogger.name}! Спасибо огромное за просмотр и оценку! Очень ценю твой комментарий! ❤️🔥`,
      likes: Math.floor(Math.random() * 600) + 300,
      timestamp: now + 200,
      isAuthor: true,
      verified: true,
      avatarColor: '#3ea6ff',
    },
    {
      id: 'rep_vip_fan1_' + now,
      author: 'SuperFan_2026',
      text: `Аоаоа, сам ${blogger.name} в комментах! Я твой фанат! 🔥❤️`,
      likes: Math.floor(Math.random() * 210) + 60,
      timestamp: now + 500,
      avatarColor: '#f59e0b',
    },
    {
      id: 'rep_vip_fan2_' + now,
      author: 'Max_Show',
      text: `Шок! Не ожидал увидеть ${blogger.name} под этим роликом! Легенда! 😱🚀`,
      likes: Math.floor(Math.random() * 150) + 40,
      timestamp: now + 900,
      avatarColor: '#10b981',
    },
    {
      id: 'rep_vip_fan3_' + now,
      author: 'Danil_Vibe',
      text: `Лайк если тоже обожаешь ${blogger.name}! 👍🔥`,
      likes: Math.floor(Math.random() * 190) + 50,
      timestamp: now + 1300,
      avatarColor: '#8b5cf6',
    },
  ];

  return {
    id: 'vip_c_' + now + '_' + Math.random().toString(36).substring(2, 7),
    author: blogger.name,
    authorChannelId: blogger.id,
    authorSubs: blogger.subscribers,
    text: quote,
    type: 'subscriber',
    reply: `Спасибо, ${blogger.name}! Очень приятно получить отзыв от такого крутого автора! 🔥`,
    dialogue: [],
    repliesList: fanReplies,
    leftChannel: false,
    reformed: false,
    userReaction: null,
    joyReply: null,
    likes,
    isHeartedByAuthor: true,
    isPinned: true,
    verified: true,
    isVipBlogger: true,
    timestamp: now,
    avatarColor: blogger.avatarColor,
  };
}

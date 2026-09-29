import { Channel, CommentItem, CommunityComment, CommunityPost, DialogueStep, VideoItem } from '../types';
import {
  generateRepliesForComment,
  generateVipBloggerComment,
  FAMOUS_BLOGGERS,
} from './channelInteractionService';

export const BOT_NAMES = [
  'gamer_2008', 'pro_player', 'mariya_99', 'sashok', 'x_1337_x',
  'anonym_01', 'katya_cat', 'vovan', 'ilya_bro', 'super_star',
  'Kesha', 'olgabest', 'danik', 'tatarin', 'blitz_user', 'pixel_king',
  'cyber_dmitry', 'alina_stream', 'rus_nikita', 'mark_v'
];

export const HATER_NAMES = [
  'toxic_hater', '100%_critic', 'shlak_ot_boga', 'dislike_lord',
  'anti_fan', 'pravdorub_99', 'kringe_politsiya', 'hate_machine'
];

export const FAN_NAMES = [
  'super_fan_1', 'best_channel_ever', 'legend_watcher', 'love_it_bro',
  'true_subscriber', 'top_fanat', 'mega_respect', 'always_watching'
];

export const COMMUNITY_COMMENT_TEMPLATES = [
  'Ура, новый пост! Всегда читаю твои новости в сообществе! 🔥',
  'Круто! Ждем роликов и продолжения движухи!',
  'Опрос бомба, проголосовал!',
  'Спасибо за обратную связь, приятно что общаешься с подписчиками ❤️',
  'Ахахах, топ! Го следующий пост про закулисье съемок!',
  'Я с тобой с самого начала, лучший блогер!',
  'Полностью согласен с постом! 👍',
  'Привет из комментариев! Ты легенда!',
  'Ого, неожиданный пост! Поддерживаю!',
  'Голос отдал! Ждем результатов голосования!',
  'Удачи с каналом, контент огонь 🔥🔥',
  'Всегда радуешь постами, так держать!',
];

export const COMMUNITY_GREETING_TEMPLATES = [
  'Привет! Как дела?',
  'Привет привет! Как настроение?',
  'Привет! Рад видеть новый пост!)',
  'Приветик! Как проходит день?',
  'Привет, автор! Как твои дела?',
  'Ку! Привет всем в комментариях!',
  'Привет! Отличный день для поста в сообществе ✨',
  'Привет привет! Ждем новых новостей!',
];

export const COMMUNITY_CHITCHAT_TEMPLATES = [
  'Как дела? Чем занимаешься в последнее время?',
  'У меня все отлично, сижу жду твой видос) А у тебя как дела?',
  'Как настроение? Надеюсь, все супер!',
  'Какая у вас погода? У нас дождь льет весь день 🌧️',
  'Кто что делает сейчас? Я вот листаю сообщество)',
  'Как поживаешь, автор? Отдыхаешь или монтируешь?',
  'Просто зашел поболтать в сообщество, всем хорошего дня! 😊',
  'Как учеба / работа? Не перегружайся сильно!',
];

export const COMMUNITY_HOW_ARE_YOU_POLL_TEMPLATES = [
  'Проголосовал! У меня все отлично, настроение супер! ✨',
  'Выбрал свой вариант в опросе! День проходит на позитиве 👍',
  'Отдал голос! У меня все нормально, жду вечерних видосов)',
  'Проголосовал! Дела потихоньку, спасибо что интересуешься ❤️',
  'У меня сегодня продуктивный день, проголосовал в опросе!',
  'Голос в опросе оставил! Все круто, автор, а у тебя как?',
  'Опрос огонь, ответил честно! Надеюсь, у всех в комментариях тоже все топ 😊',
];

export const COMMUNITY_HOW_ARE_YOU_CHAT_TEMPLATES = [
  'Привет! У меня все отлично, сижу отдыхаю) А у тебя как дела?',
  'Привет автор! Дела супер, настроение отличное! Как твои дела?',
  'У меня все замечательно! Учебу закончил, теперь отдыхаю)',
  'Нормально все, потихоньку! Очень рад твоему посту в сообществе ❤️',
  'Привет привет! День прошел отлично, погода шикарная! Как ты?',
  'Дела пойдет, немного устал, но твой пост поднял настроение ✨',
  'У меня все топ! Жду с нетерпением новый контент, хорошего дня!',
  'Привет! Все супер, сижу с чаем и общаюсь в комментариях) Как поживаешь?',
];

export const COMMUNITY_QUESTION_TEMPLATES = [
  'Когда новое видео?',
  'А какой следующий ролик снимешь?',
  'Будут стримы на этой неделе?',
  'Как дела вообще? Чем занимаешься?',
  'Будет совместка с другими блогерами?',
  'Какой хронометраж у следующего видео будет?',
];

export const MONTAGE_BEGINNER_COMMENTS = [
  'Спасибо за советы начинающим в монтаже! Подскажи, с какой программы лучше начать — CapCut или Premiere Pro?',
  'Очень полезные советы начинающим в монтаже! Наконец-то понял, как правильно склеивать кадры по движению 🔥',
  'Качественный разбор! Самый главный совет — не перегружать видео эффектами, чистый монтаж решает!',
  'Как раз только начал учиться монтировать, твои советы начинающим в монтаже просто спасли ролик! Спасибо огромное!',
  'А как новичку работать с цветокоррекцией? Сделай отдельный туториал по советам в монтаже!',
  'Совет по саунд-дизайну и плавному затуханию аудио просто топ! Звук стал в 10 раз лучше 👍',
  'Спасибо за советы начинающим в монтаже! Смонтировал первое видео за час, всё получилось отлично!',
  'Для начинающих в монтаже это видео обязательно к просмотру! Всё четко и без воды 🚀',
  'С какого железа или ноутбука лучше начинать монтировать, чтобы таймлайн не зависал при склейках?',
  'Крутые советы начинающим в монтаже! Обязательно применю в своем следующем ролике!',
  'Самый полезный ролик по советам начинающим в монтаже! Подписался и поставил лайк ❤️',
  'Спасибо за фишку с горячими клавишами! Монтаж пошел быстрее раза в два!'
];

export const MONTAGE_PACK_COMMENTS = [
  'Где скачать этот пак монтажа? Ссылка в описании или в закрепе? 🔥',
  'Пак монтажа просто пушка! Звуки (whoosh, pop, transitions) и анимированные плашки — топовые!',
  'Огромное спасибо за пак монтажа! Все переходы и звуки сразу залетели в проект ❤️',
  'С этим паком монтажа скорость работы выросла в разы! Респект за качественную подборку!',
  'Бесплатный пак монтажа такого уровня — огромная редкость! Всё работает без багов!',
  'Пак монтажа просто имба! Особенно переходы с глитчем и кинематографичные оверлеи 👍',
  'Все пресеты из пака монтажа подошли идеально! Добавил в свою библиотеку эффектов!',
  'Звуковые эффекты из пака монтажа чистейшие, никакого фонового шума. Спасибо автор!',
  'Пак монтажа огонь! Скинь плиз ещё пак шрифтов и мемов, если есть!',
  'Скачал пак монтажа, теперь ролики выглядят как у миллионников! Спасибо огромное 🚀',
  'Пак монтажа топовый! Все файлы разбиты по папкам, очень удобно пользоваться!'
];

export const COMMENT_TEMPLATES = [
  "Автор, видео просто бомба! Сделай продолжение про '{title}'!",
  "Че за качество? Ничего не понятно в '{title}'...",
  "Я один заметил баг на 0:12 в '{title}'? Лол)",
  "Мда, раньше контент лучше был, '{title}' — полный кринж.",
  "Лучшее видео за последнее время! Жду новый ролик!",
  "Ну такое себе, ожидал большего от '{title}'.",
  "АХАХАЗХАЗХ, орнул с этого момента! Продолжай в том же духе!",
  "Ужасный звук, уши режет... исправил бы '{title}'",
  "Го взаимку на мой канал! Крутое видео кстати)",
  "Слишком короткое видео, про '{title}' можно было дольше рассказывать.",
  "Монтаж просто пушка, какой софт использовал?",
  "В тренды срочно! Почему просмотров так мало?",
  "Спасибо за честный разбор, давно искал нормальный материал."
];

export const HATER_SWEARS = [
  "Ты полный даун, автор сука конченый",
  "Иди нахер со своим говно-каналом, уебок",
  "Ебать ты кривой, кто тебя учил снимать, мразь?",
  "Хуета полная, а не видео, иди уроки учи долбоеб",
  "Соси хуй, автор полная шлюха",
  "Блядь, глаза бы мои это не видели, конченый пидорас",
  "Кринжатина тупая, удали канал и не позорься",
  "Автор бездарь, дизлайк и отписка!"
];

export const SUBSCRIBER_JOY_REACTIONS = [
  "Ура, сам автор мне ответил! Обожаю твой канал! ❤️🔥",
  "Ничего себе! Не ожидал ответа от легенды, спасибо огромное!",
  "Спасибо за ответ! Продолжай в том же духе, ты лучший!",
  "Офигеть, автор заметил коммент! Сделал мой день!)",
  "Лучший! Жду новых роликов с нетерпением! 🚀"
];

export const REFORMED_PHRASES = [
  "Ладно, убедил. Ты прав, классный ролик, сорян за негатив! Подписался 👍",
  "Ого, неожиданно адекватный ответ от блогера. Беру свои слова назад, круто сделано!",
  "Ладно, хорош ответил, признаю. Больше не буду хейтить, удачи с каналом!",
  "Уважаю за спокойствие. Пересмотрел ролик — был неправ, подписался."
];

export const CONTINUOUS_HATER_REPLIES = [
  "Да пошел ты, от твоего ответа лучше видео не стало, уебок!",
  "Сам иди нахер, оправдывайся дальше, бездарь!",
  "Чё ты мне тут пишешь, тупой долбоеб, иди учись снимать!",
  "Хахаха оправдания пошли, клоун!"
];

export const NORMAL_REACTIONS = [
  "О, автор ответил! Приятно удивлен, спасибо за обратную связь!",
  "Ничего себе, живой ответ! Круто)",
  "Спасибо за комментарий, теперь понял задумку автора."
];

export const CHANNEL_SPONTANEOUS_POSTS: Record<
  string,
  Array<{
    text: string;
    imageUrl?: string;
    poll?: {
      question?: string;
      options: string[];
    };
  }>
> = {
  // A4 / Влад А4
  a4_production: [
    {
      text: 'Всем привет! Готовим самый масштабный челлендж за всю историю канала! Съемки шли почти двое суток ⚡️🔥 Как ваши дела? #Какделанеопрос!',
      imageUrl: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800&auto=format&fit=crop&q=80',
    },
    {
      text: 'Ребята, какой ролик выпустить первым на этой неделе? Голосуйте в опросе! 👇 #Чтоснять?',
      poll: {
        question: 'Что выпустить на канале следующим?',
        options: ['Пол это лава 24 часа', 'Побег из картонной тюрьмы', 'Экстремальные прятки в ТЦ', 'Битва бургеров за 100 000$'],
      },
    },
    {
      text: 'Привет подписчики! Настроение на все 100%, как у вас дела на этой неделе? Выберите вариант в опросе! 👇 #Какдела?',
      poll: {
        question: 'Как настроение у банды А4?',
        options: ['Бодрое и веселое! 🔥', 'Отличное, жду ролик!', 'Нормально 🙂', 'Немного устал 😴'],
      },
    },
    {
      text: 'Новая коллекция мерча почти готова! Кто ждет распаковку и дроп? Напишите в комментариях, как проходит ваш день! ✨ #Какделанеопрос!',
    },
  ],
  // Компот
  chan_kompot: [
    {
      text: 'Привет всем жителям деревни номер 13! Сегодня копался в шахте и нашел кое-что очень странное... Скоро на канале! ⛏️🌾 #Какделанеопрос!',
      imageUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&auto=format&fit=crop&q=80',
    },
    {
      text: 'Что построить в деревне в новой серии? Голосуйте за лучший проект! 👇 #Чтоснять?',
      poll: {
        question: 'Новая постройка в деревне:',
        options: ['Подземный бункер с ловушками', 'Замок из бедрока', 'Авто-ферма изумрудов', 'Школа для жителей'],
      },
    },
    {
      text: 'Ребята, как ваши дела? Как проходит неделя, не болеете? Голосуем! 👇 #Какдела?',
      poll: {
        question: 'Как дела у подписчиков Компота?',
        options: ['Все отлично! 🌾', 'Хорошо, играю в кубы', 'Пойдет 🙂', 'Заболел / устал 🤒'],
      },
    },
  ],
  // Кисельчик
  chan_kiselchik: [
    {
      text: 'Занимаюсь жестким апгрейдом ПК и тестового стенда! Как вам такой сетап? 🔥 #Какделанеопрос!',
      imageUrl: 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=800&auto=format&fit=crop&q=80',
    },
    {
      text: 'Что протестировать в следующем обзоре? Голосуйте! 👇 #Чтоснять?',
      poll: {
        question: 'Следующий техно-тест:',
        options: ['ПК за 15 000 руб с Авито', 'RTX 5090 в 8K', 'Самый дешевый смартфон с Ozon', 'Сборка без видеокарты'],
      },
    },
    {
      text: 'Как у вас дела с учебой и сессией? Пишите в комменты, давайте пообщаемся! 😊 #Какделанеопрос!',
    },
    {
      text: 'Записал важные фишки для новичков: как не перегружать таймлайн и делать чистый звук! #советыначинающимвмонтаже',
    },
    {
      text: 'Дропнул свежий пак переходов, плашек и звуков для Premiere Pro и CapCut! Забирайте в описании роликов! 🔥 #пакмонтажа',
    },
  ],
  // Кибер Детектив
  chan_cyber_investigator: [
    {
      text: 'Новое расследование готово на 85%. Мы раскопали факты, которые многие пытались скрыть... Скоро премьера! 🕵️‍♂️🔍 #Какделанеопрос!',
    },
    {
      text: 'Какую тему разобрать в следующем большом видео? Опрос для зрителей: 👇 #Чтоснять?',
      poll: {
        question: 'Тема следующего расследования:',
        options: ['Схемы со скам-играми', 'Тайны заброшенных серверов', 'Фейковые разоблачители', 'История взлома биржи'],
      },
    },
    {
      text: 'Детектив на связи! Как ваше настроение сегодня? Проголосуйте в опросе: 👇 #Какдела?',
      poll: {
        question: 'Самочувствие агентов:',
        options: ['Боевое и готовое к делам! 🔎', 'Спокойное', 'Устал после работы/учебы', 'В режиме ожидания видоса'],
      },
    },
  ],
  // Роберт До Нила
  chan_tech_future: [
    {
      text: 'Сижу на таймлайне уже 8 часов подряд, рендер 4K греет комнату лучше батареи 🎬💻 Всем хорошего вечера! #Какделанеопрос!',
      imageUrl: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=800&auto=format&fit=crop&q=80',
    },
    {
      text: 'Какой разбор вы хотите увидеть первым? Выбирайте в опросе! 👇 #Чтоснять?',
      poll: {
        question: 'Тема следующего кино-разбора:',
        options: ['Секреты скрытого монтажа', 'Разбор спецэффектов Нолана', 'Почему графика 2000-х была лучше', 'Ошибки в блокбастерах'],
      },
    },
  ],
  // Стаканчик
  chan_stakanchik: [
    {
      text: 'Привет подписчики! Спасибо за активность под последними видео, вы лучшие! ❤️ Что у вас нового? #Какделанеопрос!',
    },
    {
      text: 'Голосуем, какой формат запилить на этой неделе! 👇 #Чтоснять?',
      poll: {
        question: 'Что снять в новом видео?',
        options: ['Большой обзор', 'Реакции на тренды', 'Стрим с общением', 'Челлендж со зрителями'],
      },
    },
    {
      text: 'Привет всем! Как ваше настроение на выходных? 👇 #Какдела?',
      poll: {
        question: 'Как проходит день?',
        options: ['Супер! 🔥', 'Хорошо 👍', 'Норм 🙂', 'Сплю на ходу 😴'],
      },
    },
  ],
  // MrBeast
  chan_mrbeast: [
    {
      text: 'We just gave away 100 cars to random subscribers!! Next video is going to break the internet! How is everyone doing today? 🚀💵 #Какделанеопрос!',
      imageUrl: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&auto=format&fit=crop&q=80',
    },
    {
      text: 'What challenge should we do next? Vote below! 👇 #Чтоснять?',
      poll: {
        question: 'Next massive video idea:',
        options: ['Survive 100 days in circle', 'Buy everything in a store', '$1 vs $1,000,000 Hotel', 'Last to leave island wins it'],
      },
    },
  ],
  // Generic channels fallback
  default: [
    {
      text: 'Привет всем подписчикам! Работаем над новым контентом, спасибо что остаетесь со мной! Как ваши дела? ✨ #Какделанеопрос!',
    },
    {
      text: 'Интересно ваше мнение! За какой вариант проголосуете? 👇 #Чтоснять?',
      poll: {
        question: 'Что снять в следующем выпуске?',
        options: ['Гайд и фишки', 'Прохождение на максимум', 'Ответы на вопросы', 'Стрим'],
      },
    },
    {
      text: 'Всем отличного дня! Как настроение сегодня? Голосуем в опросе! 👇 #Какдела?',
      poll: {
        question: 'Как настроение сегодня?',
        options: ['Отличное 🔥', 'Хорошее 👍', 'Нормально 🙂', 'Устал 😴'],
      },
    },
  ],
};

export const BOOST_RATES = {
  views: 0.08,     // 80 ₽ за 1000 просмотров
  likes: 0.60,     // 600 ₽ за 1000 лайков
  comments: 5.00,  // 5 ₽ за 1 комментарий
  subscribers: 5.00 // 5 ₽ за 1 подписчика
};

export function formatMoney(value: number): string {
  return `${Math.max(0, value || 0).toLocaleString('ru-RU', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })} ₽`;
}

export function formatCount(num: number): string {
  if (num >= 1_000_000) {
    return (num / 1_000_000).toFixed(1).replace('.0', '') + ' млн';
  }
  if (num >= 1_000) {
    return (num / 1_000).toFixed(1).replace('.0', '') + ' тыс.';
  }
  return num.toLocaleString('ru-RU');
}

export function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

export function pluralizeRu(num: number, one: string, two: string, five: string): string {
  const n = Math.abs(num) % 100;
  const n1 = n % 10;
  if (n > 10 && n < 20) return `${num} ${five}`;
  if (n1 > 1 && n1 < 5) return `${num} ${two}`;
  if (n1 === 1) return `${num} ${one}`;
  return `${num} ${five}`;
}

/**
 * Real-time relative timestamp formatting matching real YouTube.
 * "Лучше ассоциация с реальным временем"
 */
export function formatTimeAgo(timestamp: number): string {
  if (!timestamp || isNaN(timestamp)) return 'только что';
  const diffMs = Math.max(0, Date.now() - timestamp);
  const diffSec = Math.floor(diffMs / 1000);

  // Less than 30 seconds
  if (diffSec < 30) {
    return 'только что';
  }

  // Under 60 seconds
  if (diffSec < 60) {
    return 'минуту назад';
  }

  // 1 to 59 minutes (real minutes)
  const minutes = Math.floor(diffSec / 60);
  if (minutes < 60) {
    return pluralizeRu(minutes, 'минуту назад', 'минуты назад', 'минут назад');
  }

  // 1 to 23 hours (real hours)
  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return pluralizeRu(hours, 'час назад', 'часа назад', 'часов назад');
  }

  // 1 to 6 days
  const days = Math.floor(hours / 24);
  if (days < 7) {
    return pluralizeRu(days, 'день назад', 'дня назад', 'дней назад');
  }

  // 1 to 4 weeks
  const weeks = Math.floor(days / 7);
  if (weeks < 4) {
    return pluralizeRu(weeks, 'неделю назад', 'недели назад', 'недель назад');
  }

  // 1 to 11 months
  const months = Math.floor(days / 30);
  if (months < 12) {
    return pluralizeRu(months, 'месяц назад', 'месяца назад', 'месяцев назад');
  }

  // 1+ years
  const years = Math.floor(days / 365);
  return pluralizeRu(Math.max(1, years), 'год назад', 'года назад', 'лет назад');
}

/**
 * Checks if a video's age is 7 days or more in real time.
 */
export function isVideoSevenDaysAgoOrOlder(timestamp: number): boolean {
  const diffMs = Math.max(0, Date.now() - timestamp);
  return diffMs >= 7 * 86400 * 1000;
}

export interface SimulationResult {
  updatedChannels: Channel[];
  newEvents: Array<{
    type: 'milestone' | 'money' | 'comment';
    title: string;
    message: string;
  }>;
}

export const MAX_COMMENTS_PER_VIDEO = 50;

export function processSimulationTick(
  channels: Channel[],
  speedMultiplier: number = 1
): SimulationResult {
  const events: SimulationResult['newEvents'] = [];

  const updatedChannels = channels.map((channel) => {
    const prevSubs = channel.subscribers;
    let channelSubsGain = 0;
    let channelBalanceGain = 0;

    const hasVideos = channel.videos && channel.videos.length > 0;
    const updatedVideos = hasVideos
      ? channel.videos.map((vid) => {
          const subs = channel.subscribers || 0;
          const viralChance = Math.random();
          let viewInc = 0;
          let subInc = 0;

      if (subs < 50) {
        if (viralChance < 0.05) {
          viewInc = Math.floor(Math.random() * 91) + 60;
          subInc = Math.random() < 0.35 ? 1 : 0;
        } else {
          viewInc = Math.floor(Math.random() * 26) + 10;
          subInc = Math.random() < 0.08 ? 1 : 0;
        }
      } else if (subs < 150) {
        if (viralChance < 0.12) {
          viewInc = Math.floor(Math.random() * 351) + 150;
          subInc = Math.floor(Math.random() * 4) + 1;
        } else {
          viewInc = Math.floor(Math.random() * 71) + 30;
          subInc = Math.random() < 0.25 ? 1 : 0;
        }
      } else if (subs < 300) {
        if (viralChance < 0.18) {
          viewInc = Math.floor(Math.random() * 1701) + 800;
          subInc = Math.floor(Math.random() * 9) + 2;
        } else {
          viewInc = Math.floor(Math.random() * 201) + 100;
          subInc = Math.random() < 0.45 ? 1 : 0;
        }
      } else if (subs < 1000) {
        if (viralChance < 0.22) {
          viewInc = Math.floor(Math.random() * 12001) + 3000;
          subInc = Math.floor(Math.random() * 21) + 5;
        } else {
          viewInc = Math.floor(Math.random() * 701) + 300;
          subInc = Math.floor(Math.random() * 4);
        }
      } else if (subs < 2000) {
        if (viralChance < 0.25) {
          viewInc = Math.floor(Math.random() * 25001) + 5000;
          subInc = Math.floor(Math.random() * 31) + 5;
        } else {
          viewInc = Math.floor(Math.random() * 1801) + 500;
          subInc = Math.floor(Math.random() * 6);
        }
      } else if (subs < 10000) {
        if (viralChance < 0.28) {
          viewInc = Math.floor(Math.random() * 70001) + 15000;
          subInc = Math.floor(Math.random() * 81) + 20;
        } else {
          viewInc = Math.floor(Math.random() * 5001) + 1500;
          subInc = Math.floor(Math.random() * 12) + 1;
        }
      } else if (subs < 100000) {
        if (viralChance < 0.35) {
          viewInc = Math.floor(Math.random() * 450001) + 50000;
          subInc = Math.floor(Math.random() * 501) + 50;
        } else {
          viewInc = Math.floor(Math.random() * 30001) + 5000;
          subInc = Math.floor(Math.random() * 61) + 5;
        }
      } else {
        if (viralChance < 0.4) {
          viewInc = Math.floor(Math.random() * 2000000) + 200000;
          subInc = Math.floor(Math.random() * 3001) + 500;
        } else {
          viewInc = Math.floor(Math.random() * 150001) + 25000;
          subInc = Math.floor(Math.random() * 201) + 20;
        }
      }

      viewInc = Math.round(viewInc * speedMultiplier);
      subInc = Math.round(subInc * speedMultiplier);

      const newViews = Math.min(200_000_000, vid.views + viewInc);
      channelSubsGain += subInc;

      let vidEarnings = vid.earnings || 0;
      let lastMonetizedViews = vid.lastMonetizedViews || vid.views;

      if (channel.monetization && channel.monetization.connected) {
        const newMonetizedViews = Math.max(0, newViews - lastMonetizedViews);
        const rpm = 20; // 20 ₽ per 1,000 views
        if (newMonetizedViews > 0) {
          const earned = (newMonetizedViews / 1000) * rpm;
          vidEarnings += earned;
          channelBalanceGain += earned;
        }
        lastMonetizedViews = newViews;
      } else {
        lastMonetizedViews = newViews;
      }

      const newLikes = Math.floor(newViews / 12) + Math.floor(Math.random() * 20);

      // Comments generation & interaction
      let comments = [...(vid.comments || [])];
      const isKiselchik =
        vid.channelId === 'chan_kiselchik' ||
        vid.channelName.toLowerCase().includes('кисель') ||
        channel.name.toLowerCase().includes('кисель');
      const channelAuthor = vid.channelName || channel.name || 'Автор';

      // 1. Rare VIP Blogger comment (Cyber Detective, Kompot, MrBeast, A4, Edison, etc.)
      const hasRecentVip = comments.some(
        (c) => c.isVipBlogger && Date.now() - c.timestamp < 120000
      );
      if (comments.length < MAX_COMMENTS_PER_VIDEO && !hasRecentVip && Math.random() < 0.06) {
        const vipComment = generateVipBloggerComment(vid);
        // Insert VIP comment right below pinned or at the very top
        const firstNonPinned = comments.findIndex((c) => !c.isPinned);
        if (firstNonPinned === -1) {
          comments.unshift(vipComment);
        } else {
          comments.splice(firstNonPinned, 0, vipComment);
        }
      }

      // 2. Regular / Fan / Hater comment generation (STRICT LIMIT: 50 comments max per video across all channels)
      if (comments.length < MAX_COMMENTS_PER_VIDEO && Math.random() < 0.75) {
        let type: CommentItem['type'] = 'normal';
        let authorList = BOT_NAMES;
        let text = COMMENT_TEMPLATES[Math.floor(Math.random() * COMMENT_TEMPLATES.length)].replace(
          /{title}/g,
          vid.title
        );

        const randType = Math.random();
        let isReformed = false;

        // Check hashtags in video description or title!
        const vidMetaLower = ((vid.desc || '') + ' ' + (vid.title || '')).toLowerCase();
        const hasBeginnerMontageTag = vidMetaLower.includes('#советыначинающимвмонтаже');
        const hasMontagePackTag = vidMetaLower.includes('#пакмонтажа');

        if (hasBeginnerMontageTag || hasMontagePackTag) {
          type = 'subscriber';
          authorList = FAN_NAMES;
          if (hasBeginnerMontageTag && hasMontagePackTag) {
            text = Math.random() < 0.5
              ? MONTAGE_BEGINNER_COMMENTS[Math.floor(Math.random() * MONTAGE_BEGINNER_COMMENTS.length)]
              : MONTAGE_PACK_COMMENTS[Math.floor(Math.random() * MONTAGE_PACK_COMMENTS.length)];
          } else if (hasBeginnerMontageTag) {
            text = MONTAGE_BEGINNER_COMMENTS[Math.floor(Math.random() * MONTAGE_BEGINNER_COMMENTS.length)];
          } else {
            text = MONTAGE_PACK_COMMENTS[Math.floor(Math.random() * MONTAGE_PACK_COMMENTS.length)];
          }
        } else if (isKiselchik) {
          if (randType < 0.75) {
            type = 'subscriber';
            authorList = FAN_NAMES;
            const kiselchikFanQuotes = [
              `Кисельчик лучший! Обожаю твои уроки по монтажу и видосы! 🔥`,
              `Пак эффектов просто бомба, спасибо огромное за годноту! ❤️`,
              `Монтаж у Кисельчика просто шедевр! Спасибо за топовый выпуск! 🚀`,
              `Только вперед! Мы твои преданные зрители и всегда поддержим! ✨`,
              `Качественный контент, смотрю с огромным удовольствием! 👍`,
              `Лучший монтажер на YouTube! Ролик пушка! 🔥`,
            ];
            text = kiselchikFanQuotes[Math.floor(Math.random() * kiselchikFanQuotes.length)];
          } else {
            type = 'subscriber';
            authorList = FAN_NAMES;
            text = `Отличный ролик "${vid.title}", жду продолжения! 🔥`;
          }
        } else {
          // Standard video
          if (randType < 0.3) {
            type = 'hater';
            authorList = HATER_NAMES;
            text = HATER_SWEARS[Math.floor(Math.random() * HATER_SWEARS.length)];
          } else if (randType < 0.65) {
            type = 'subscriber';
            authorList = FAN_NAMES;
            text = `Просто шикарно! "${vid.title}" пересматриваю уже не первый раз! Автор лучший! 🔥`;
          }
        }

        const author =
          authorList[Math.floor(Math.random() * authorList.length)] +
          Math.floor(Math.random() * 99);

        // Every channel (including AIR) replies to comments
        const autoReplies = generateRepliesForComment(
          text,
          type,
          channelAuthor,
          isKiselchik
        );

        const newComment: CommentItem = {
          id: 'c_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
          author,
          text,
          type,
          reply: autoReplies[0]?.text || null,
          dialogue: [],
          repliesList: autoReplies,
          leftChannel: false,
          reformed: isReformed,
          userReaction: null,
          joyReply: null,
          likes: Math.floor(Math.random() * 15),
          timestamp: Date.now(),
        };

        // Insert comment after pinned comments
        const firstNonPinnedIndex = comments.findIndex((c) => !c.isPinned);
        if (firstNonPinnedIndex === -1) {
          comments.push(newComment);
        } else {
          comments.splice(firstNonPinnedIndex, 0, newComment);
        }
        // Comments are NEVER deleted! Existing comments stay permanently!
      }

      // Backfill replies for any existing comments so ALL channels (including Air) answer comments
      comments = comments.map((c) => {
        // Also strip any legacy "вернись" text if present in user comments
        let cleanedText = c.text;
        if (channel.id === 'chan_air' || vid.channelId === 'chan_air') {
          if (cleanedText.toLowerCase().includes('вернись')) {
            cleanedText = `Шикарный шортс! Монтаж и атмосфера просто на высоте! 🔥`;
          }
        }

        if (!c.repliesList || c.repliesList.length === 0 || !c.reply) {
          const reps = generateRepliesForComment(
            cleanedText,
            c.type,
            channelAuthor,
            isKiselchik
          );
          return {
            ...c,
            text: cleanedText,
            repliesList: reps,
            reply: reps[0]?.text || c.reply || null,
          };
        }
        return cleanedText !== c.text ? { ...c, text: cleanedText } : c;
      });

      return {
        ...vid,
        views: newViews,
        likes: newLikes,
        earnings: vidEarnings,
        lastMonetizedViews,
        comments,
      };
    })
  : [];

    let newSubscribers = channel.subscribers + channelSubsGain;

    // Special logic for AIR:
    // 1. "после его 1 видео к нему приходит целый лям подписчиков. А вначале у него 104.242."
    if (channel.id === 'chan_air') {
      const hasFirstVideo = (channel.videos?.length || 0) >= 1;
      if (hasFirstVideo && newSubscribers < 1000000) {
        newSubscribers = channel.subscribers + 1000000;
        events.push({
          type: 'milestone',
          title: '💥 +1,000,000 ПОДПИСЧИКОВ У ЭЙРА!',
          message: 'Первый шортс канала ЭЙР залетел в глобальные рекомендации и принес 1 000 000 новых подписчиков!',
        });
      }
    }

    if (prevSubs < 1000 && newSubscribers >= 1000) {
      events.push({
        type: 'milestone',
        title: '🎉 1,000 подписчиков!',
        message: `Канал «${channel.name}» открыл доступ к монетизации! Зайди в Творческую студию.`,
      });
    } else if (prevSubs < 100000 && newSubscribers >= 100000) {
      events.push({
        type: 'milestone',
        title: '🥈 100,000 подписчиков — Доступна галочка! ✓',
        message: `Канал «${channel.name}» набрал 100,000 подписчиков! Теперь вы можете получить официальную галочку верификации в Студии или на странице канала!`,
      });
    }

    // Special logic for AIR retirement after 5 shorts:
    // "и после всех шортов он уходит. и не дает никаких вестей о жизни...
    // И после ухода напишет сообщение в сообществе:
    // Всем спасибо, я учусь и видео больше никогда не выйдет. Мне очень жаль что так получилось. Но время пришло. Мне нужна учеба как и вам. Желаю всем удачи и возможно как нибудь то я вернусь. Аккаунт я продал после этого сообщения. Видео оставлю, но их не будет. Всем спасибо кто был со мной, до связи))"
    let isRetired = channel.isRetired;
    let retiredAt = channel.retiredAt;
    let desc = channel.desc;
    let communityPosts = channel.communityPosts ? [...channel.communityPosts] : [];

    if (channel.id === 'chan_air') {
      const allThreeReleased = (channel.videos?.length || 0) >= 3;
      if (allThreeReleased) {
        const studyPostExists = communityPosts.some((p) => p.id === 'air_comm_study');
        if (!studyPostExists) {
          communityPosts.unshift({
            id: 'air_comm_study',
            channelId: 'chan_air',
            authorName: 'ЭЙР',
            authorHandle: '@air',
            authorAvatar: channel.avatarUrl || 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=400&auto=format&fit=crop&q=80',
            authorColor: '#0284c7',
            isChannelOwner: true,
            isVerified: true,
            isPinned: true,
            text: 'Не буду снимать, идей нет. А также учеба. Всем спасибо, снимать больше не буду. Учеба. Я живой, будем общаться в сообществе))',
            timestamp: Date.now(),
            likes: 86000,
            comments: [
              {
                id: 'study_c1',
                author: 'Влад_2026',
                text: 'Понимаем бро, учеба важнее всего! Главное что живой, будем общаться тут в сообществе! 🔥',
                timestamp: Date.now() - 5000,
                likes: 8400,
              },
              {
                id: 'study_c2',
                author: 'Компот',
                text: 'Учеба святое дело! Удачи с парами и сессией, пиши сюда как дела 👍',
                timestamp: Date.now() - 4000,
                likes: 9500,
                isVipBlogger: true,
              },
              {
                id: 'study_c3',
                author: 'Кисельчик',
                text: 'Шортсы получились пушка! Успехов в учебе, не пропадай из сообщества!',
                timestamp: Date.now() - 3000,
                likes: 7200,
                isVipBlogger: true,
              },
              {
                id: 'study_c4',
                author: 'Матвей_Киноман',
                text: 'Респект за честность! Будем ждать постов и общаться тут))',
                timestamp: Date.now() - 1000,
                likes: 4200,
              },
            ],
          });

          events.push({
            type: 'milestone',
            title: 'Новый пост от ЭЙРа в Сообществе 💬',
            message: 'ЭЙР написал в Сообществе: «Не буду снимать, идей нет. А также учеба. Всем спасибо, снимать больше не буду. Учеба. Я живой, будем общаться в сообществе))»',
          });
        }
      }
    }

    // -------------------------------------------------------------
    // SPONTANEOUS COMMUNITY POSTS FROM OTHER CHANNELS:
    // "Увидел у всех по 1 посту. Пусть все пишут иногда, когда захотят"
    // Channels occasionally write new community posts, polls or questions!
    // -------------------------------------------------------------
    if (channel.id !== 'chan_air') {
      // Chance per tick for a channel to publish a spontaneous community post
      // Roughly every couple of minutes or when stimulated by speed multiplier
      const postChance = 0.045 * Math.min(speedMultiplier, 3);
      if (Math.random() < postChance && communityPosts.length < 15) {
        const pool = CHANNEL_SPONTANEOUS_POSTS[channel.id] || CHANNEL_SPONTANEOUS_POSTS.default;
        // Find a post from pool not recently posted
        const availableTemplates = pool.filter(
          (t) => !communityPosts.some((cp) => cp.text.includes(t.text.substring(0, 25)))
        );

        const template = availableTemplates.length > 0
          ? availableTemplates[Math.floor(Math.random() * availableTemplates.length)]
          : pool[Math.floor(Math.random() * pool.length)];

        if (template) {
          const newPostId = `spont_post_${channel.id}_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
          let pollData = undefined;
          if (template.poll) {
            pollData = {
              question: template.poll.question,
              options: template.poll.options.map((optText, idx) => ({
                id: `opt_${idx}_${Date.now()}`,
                text: optText,
                votes: Math.floor(Math.random() * (channel.subscribers > 50000 ? 120 : 15)) + 2,
              })),
              totalVotes: 0,
            };
            pollData.totalVotes = pollData.options.reduce((sum, o) => sum + o.votes, 0);
          }

          // Initial starter comments
          const starterComments: CommunityComment[] = [];
          if (template.text.includes('#Какдела?')) {
            starterComments.push({
              id: `sc1_${Date.now()}`,
              author: FAN_NAMES[Math.floor(Math.random() * FAN_NAMES.length)] + Math.floor(Math.random() * 99),
              text: 'Проголосовал в опросе! Настроение огонь, спасибо за пост ❤️',
              timestamp: Date.now() - 3000,
              likes: Math.floor(Math.random() * 45) + 5,
            });
          } else if (template.text.includes('#Чтоснять?')) {
            const firstOpt = pollData?.options[0]?.text || 'Вариант 1';
            starterComments.push({
              id: `sc1_${Date.now()}`,
              author: FAN_NAMES[Math.floor(Math.random() * FAN_NAMES.length)] + Math.floor(Math.random() * 99),
              text: `Давай сними "${firstOpt}"! Однозначно за этот вариант! 🔥`,
              timestamp: Date.now() - 3000,
              likes: Math.floor(Math.random() * 50) + 10,
            });
          } else {
            starterComments.push({
              id: `sc1_${Date.now()}`,
              author: FAN_NAMES[Math.floor(Math.random() * FAN_NAMES.length)] + Math.floor(Math.random() * 99),
              text: 'Привет! Рады новому посту в сообществе, всегда читаем! ✨',
              timestamp: Date.now() - 3000,
              likes: Math.floor(Math.random() * 40) + 8,
            });
          }

          communityPosts.unshift({
            id: newPostId,
            channelId: channel.id,
            authorName: channel.name,
            authorHandle: channel.handle,
            authorAvatar: channel.avatarUrl,
            authorColor: channel.avatarColor || '#3ea6ff',
            isChannelOwner: true,
            isVerified: channel.verified,
            text: template.text,
            imageUrl: template.imageUrl,
            poll: pollData,
            timestamp: Date.now(),
            likes: Math.floor(Math.random() * (channel.subscribers > 50000 ? 450 : 25)) + 5,
            comments: starterComments,
          });

          events.push({
            type: 'comment',
            title: `Новая запись в Сообществе от ${channel.name} 💬`,
            message: `${channel.name} опубликовал новую запись в сообществе: «${template.text.substring(0, 60)}...»`,
          });
        }
      }
    }

    // -------------------------------------------------------------
    // COMMUNITY POSTS ACTIVITY SIMULATION:
    // "Пускай подписчики тоже в сообществе моем и других каналах пишут, голосуют.
    // Если непопулярный канал будет мало актива на постах, большой канал от 50.000 - бесконечно, будет много актива"
    // -------------------------------------------------------------
    if (communityPosts.length > 0) {
      const subs = newSubscribers || 0;
      // Activity rate based on subscriber threshold requested by user:
      // Channels with < 1,000 subs: low/slow activity (10% chance per tick)
      // Channels 1,000 - 50,000 subs: moderate activity (35-65% chance per tick)
      // Channels 50,000+: "от 50.000 - бесконечно, будет много актива" (rapid, ongoing activity every tick)
      const isBigChannel = subs >= 50000;
      const isMediumChannel = subs >= 1000 && subs < 50000;
      const isSmallChannel = subs < 1000;

      communityPosts = communityPosts.map((post) => {
        let pLikes = post.likes;
        let pComments = [...(post.comments || [])];
        let pPoll = post.poll ? { ...post.poll, options: post.poll.options.map(o => ({ ...o })) } : undefined;

        // 1. POLL VOTING SIMULATION (only if poll is not closed/stopped)
        if (pPoll && pPoll.options.length > 0 && !pPoll.isClosed) {
          let voteGain = 0;
          if (isBigChannel) {
            // Big channel (50k+): lots of votes (from hundreds to thousands per tick)
            const baseFactor = Math.min(subs / 80000, 250);
            voteGain = Math.floor(Math.random() * 45 * baseFactor) + Math.floor(baseFactor * 12);
          } else if (isMediumChannel) {
            if (Math.random() < 0.65) {
              voteGain = Math.floor(Math.random() * 8) + 2;
            }
          } else if (isSmallChannel) {
            if (Math.random() < 0.15 && (pPoll.totalVotes || 0) < 15) {
              voteGain = 1;
            }
          }

          if (voteGain > 0) {
            // Distribute votes among options (semi-random, slightly favoring option 0 or 1)
            for (let v = 0; v < voteGain; v++) {
              const optIndex = Math.floor(Math.random() * pPoll.options.length);
              pPoll.options[optIndex].votes += 1;
            }
            pPoll.totalVotes = (pPoll.totalVotes || 0) + voteGain;
          }
        }

        // 2. LIKES ON COMMUNITY POST
        let likeGain = 0;
        if (isBigChannel) {
          const likeFactor = Math.min(subs / 100000, 180);
          likeGain = Math.floor(Math.random() * 30 * likeFactor) + Math.floor(likeFactor * 8);
        } else if (isMediumChannel) {
          if (Math.random() < 0.5) {
            likeGain = Math.floor(Math.random() * 5) + 1;
          }
        } else if (isSmallChannel) {
          if (Math.random() < 0.12 && pLikes < 25) {
            likeGain = 1;
          }
        }
        pLikes += likeGain;

        // 3. COMMENTS ON COMMUNITY POST
        // Subscriber pool and comment generation
        let shouldAddComment = false;
        if (isBigChannel) {
          // Big channels get comments consistently (e.g. up to 1-3 comments each tick)
          shouldAddComment = Math.random() < 0.85;
        } else if (isMediumChannel) {
          shouldAddComment = Math.random() < 0.35 && pComments.length < 80;
        } else if (isSmallChannel) {
          shouldAddComment = Math.random() < 0.08 && pComments.length < 8;
        }

        if (shouldAddComment) {
          const isPollPost = !!pPoll;
          const authorPool = Math.random() < 0.65 ? FAN_NAMES : BOT_NAMES;
          const commAuthor =
            authorPool[Math.floor(Math.random() * authorPool.length)] +
            Math.floor(Math.random() * 99);

          const postContent = ((post.text || '') + ' ' + (pPoll?.question || '')).toLowerCase();
          const hasHowAreYouPollTag = postContent.includes('#какдела?') || postContent.includes('#какдела');
          const hasWhatToFilmTag = postContent.includes('#чтоснять?') || postContent.includes('#чтоснять');
          const hasHowAreYouNoPollTag = postContent.includes('#какделанеопрос!') || postContent.includes('#какделанеопрос');
          const hasBeginnerMontageTag = postContent.includes('#советыначинающимвмонтаже');
          const hasMontagePackTag = postContent.includes('#пакмонтажа');

          let commText = '';
          if (isPollPost && pPoll?.isClosed) {
            // Commentary when poll has concluded and results are final
            const winningOpt = pPoll.options.reduce((prev, curr) => (curr.votes > prev.votes ? curr : prev), pPoll.options[0]);
            if (hasHowAreYouPollTag && !hasWhatToFilmTag) {
              const closedHowTemplates = [
                `Итоги голосования подведены! Рад, что у большинства всё "${winningOpt?.text}"! ✨`,
                `Голосование закончено! У большинства зрителей: "${winningOpt?.text}", круто! 👍`,
                `Итоги подведены! Всем хорошего настроения и отличного дня! ❤️`,
              ];
              commText = closedHowTemplates[Math.floor(Math.random() * closedHowTemplates.length)];
            } else {
              const closedPollTemplates = [
                `Голосование завершено! Победил вариант "${winningOpt?.text}"! Ждем этот ролик! 🔥`,
                `Результаты супер! Победил "${winningOpt?.text}", отличный выбор зрителей! 👍`,
                `Ура, победил вариант "${winningOpt?.text}"! Автор, когда ждать видео?`,
                `Голосование закрыто, большинство выбрало "${winningOpt?.text}"! Снимай быстрее!`,
                `Понятно, что хотят зрители — все ждут "${winningOpt?.text}"! 🚀`,
              ];
              commText = closedPollTemplates[Math.floor(Math.random() * closedPollTemplates.length)];
            }
          } else if (hasBeginnerMontageTag && hasMontagePackTag) {
            // Dedicated comments for both montage tags
            const mixed = [...MONTAGE_BEGINNER_COMMENTS, ...MONTAGE_PACK_COMMENTS];
            commText = mixed[Math.floor(Math.random() * mixed.length)];
          } else if (hasBeginnerMontageTag) {
            // Dedicated comments for #советыначинающимвмонтаже
            commText = MONTAGE_BEGINNER_COMMENTS[Math.floor(Math.random() * MONTAGE_BEGINNER_COMMENTS.length)];
          } else if (hasMontagePackTag) {
            // Dedicated comments for #пакмонтажа
            commText = MONTAGE_PACK_COMMENTS[Math.floor(Math.random() * MONTAGE_PACK_COMMENTS.length)];
          } else if (hasHowAreYouNoPollTag) {
            // Explicit chat post: #Какделанеопрос! -> subscribers write about their day and chat
            const templates = [...COMMUNITY_HOW_ARE_YOU_CHAT_TEMPLATES, ...COMMUNITY_GREETING_TEMPLATES];
            commText = templates[Math.floor(Math.random() * templates.length)];
          } else if (isPollPost && hasHowAreYouPollTag && !hasWhatToFilmTag) {
            // Poll explicitly about how subscribers are doing: #Какдела?
            const chosenOption = pPoll?.options[Math.floor(Math.random() * (pPoll.options.length || 1))]?.text || '';
            const howAreYouPollComments = [
              `Проголосовал за вариант "${chosenOption}"! У меня всё именно так 👍`,
              `Выбрал "${chosenOption}"! Настроение отличное, спасибо за опрос! 😊`,
              `Отдал голос за "${chosenOption}". Рад, что общаешься с аудиторией! ❤️`,
              `У меня "${chosenOption}", проголосовал! А у тебя как дела, автор?`,
              ...COMMUNITY_HOW_ARE_YOU_POLL_TEMPLATES,
            ];
            commText = howAreYouPollComments[Math.floor(Math.random() * howAreYouPollComments.length)];
          } else if (isPollPost && Math.random() < 0.65) {
            // Poll for what to film: #Чтоснять? or default video choice poll
            const options = pPoll?.options || [];
            const chosenIndex = Math.floor(Math.random() * (options.length || 1));
            const chosenOption = options[chosenIndex]?.text || '';
            const optionNum = chosenIndex + 1;

            const pollCommTemplates = [
              `Давай сними "${chosenOption}"! Очень жду! 🔥`,
              `Я за вариант ${optionNum}: "${chosenOption}"! Будет пушка!`,
              `Давай сними "${chosenOption}"! Давно хотел такое видео!`,
              `Проголосовал за вариант ${optionNum} ("${chosenOption}")! Снимай его!`,
              `Сними вариант ${optionNum}! "${chosenOption}" точно залетит в тренды!`,
              `Голосую за "${chosenOption}"! Без вариантов! 👍`,
              `Давай "${chosenOption}", самый лучший выбор из всех!`,
            ];
            commText = pollCommTemplates[Math.floor(Math.random() * pollCommTemplates.length)];
          } else {
            // Mix of greetings, general chitchat, questions and praise
            const roll = Math.random();
            let pool: string[];
            if (roll < 0.30) {
              pool = COMMUNITY_GREETING_TEMPLATES;
            } else if (roll < 0.55) {
              pool = COMMUNITY_CHITCHAT_TEMPLATES;
            } else if (roll < 0.75) {
              pool = COMMUNITY_QUESTION_TEMPLATES;
            } else {
              pool = COMMUNITY_COMMENT_TEMPLATES;
            }
            commText = pool[Math.floor(Math.random() * pool.length)];
          }

          // Very popular channels might occasionally get famous blogger drop by
          let isVip = false;
          let authorAvatar: string | undefined = undefined;
          let authorColor = '#3b82f6';

          if (isBigChannel && Math.random() < 0.05 && pComments.length > 0) {
            const blogger = FAMOUS_BLOGGERS[Math.floor(Math.random() * FAMOUS_BLOGGERS.length)];
            if (blogger.name !== channel.name) {
              isVip = true;
              commText = `Привет от канала ${blogger.name}! Всегда приятно заглянуть в сообщество, отличный движ! 🔥`;
              authorColor = blogger.avatarColor;
            }
          }

          const newComm: CommunityComment = {
            id: 'comm_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
            author: commAuthor,
            authorHandle: '@' + commAuthor.toLowerCase(),
            authorAvatar,
            authorColor,
            text: commText,
            timestamp: Date.now(),
            likes: isBigChannel ? Math.floor(Math.random() * 25) + 3 : Math.floor(Math.random() * 3),
            isVipBlogger: isVip,
          };

          pComments.push(newComm);
        }

        return {
          ...post,
          likes: pLikes,
          comments: pComments,
          poll: pPoll,
        };
      });
    }

    return {
      ...channel,
      subscribers: newSubscribers,
      balance: Math.round((channel.balance + channelBalanceGain) * 100) / 100,
      videos: updatedVideos || [],
      isRetired,
      retiredAt,
      desc,
      communityPosts,
    };
  });

  return { updatedChannels, newEvents: events };
}

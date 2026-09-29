import { CommentReplyItem } from '../types';

/**
 * Generates enthusiastic fan replies and an author reply for a prominent blogger's comment
 */
export function generateBloggerCommentReplies(
  videoAuthor: string,
  bloggerName: string
): CommentReplyItem[] {
  const now = Date.now();

  const fanQuotes = [
    'Аоаоа я твой фанат! 🔥❤️',
    `Офигеть, сам ${bloggerName} в комментах! 😱`,
    'Обожаю твои видосы, ты лучший блогер на ютубе!',
    'Мама я в телевизоре, под комментом кумира! 🚀',
    `Лайк если тоже любишь ${bloggerName}! 👍`,
    'Когда следующий ролик?! Ждем всей семьей! 🔥',
    'Шок, не ожидал увидеть тебя под этим видео! Топ!',
  ];

  const fanAuthors = [
    'SuperGamer2026',
    'Макс_Show',
    'Danil_Vibe',
    'Ksenia_Fan',
    'Никита_Play',
    'Соня_Fox',
    'Alex_Craft',
  ];

  const colors = [
    '#3b82f6',
    '#10b981',
    '#8b5cf6',
    '#f59e0b',
    '#ec4899',
    '#06b6d4',
    '#6366f1',
  ];

  const replies: CommentReplyItem[] = [];

  // 1. Author's appreciative reply first
  replies.push({
    id: 'rep_author_' + now,
    author: videoAuthor,
    text: `Спасибо огромное за поддержку и просмотр! Очень приятно видеть тебя у меня в комментариях! ❤️🔥`,
    likes: Math.floor(Math.random() * 450) + 240,
    timestamp: now,
    isAuthor: true,
    verified: true,
    avatarColor: '#3ea6ff',
  });

  // 2. Excited fan replies ("Аоаоа я твой фанат" and others)
  fanQuotes.forEach((quote, idx) => {
    replies.push({
      id: 'rep_fan_' + now + '_' + idx,
      author: fanAuthors[idx % fanAuthors.length],
      text: quote,
      likes: Math.floor(Math.random() * 95) + 25,
      timestamp: now + (idx + 1) * 200,
      avatarColor: colors[idx % colors.length],
    });
  });

  return replies;
}

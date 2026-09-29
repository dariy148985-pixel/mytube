import React, { useState, useEffect } from 'react';
import {
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  Share2,
  Pin,
  Send,
  BarChart2,
  CheckCircle2,
  Sparkles,
  Heart,
  Plus,
  Trash2,
  Image as ImageIcon,
  Lock,
  Trophy,
  Check,
  Hash
} from 'lucide-react';
import { Channel, CommunityPost, CommunityComment } from '../types';
import { formatCount, formatTimeAgo } from '../services/simulationEngine';

interface CommunityTabProps {
  channel: Channel;
  currentChannel: Channel | null;
  isOwner: boolean;
  onUpdateChannel: (channel: Channel) => void;
}

export const CommunityTab: React.FC<CommunityTabProps> = ({
  channel,
  currentChannel,
  isOwner,
  onUpdateChannel,
}) => {
  const [newPostText, setNewPostText] = useState('');
  const [newPostImage, setNewPostImage] = useState('');
  const [showImageInput, setShowImageInput] = useState(false);
  const [showPollInput, setShowPollInput] = useState(false);
  const [pollQuestion, setPollQuestion] = useState('');
  const [pollOptions, setPollOptions] = useState(['', '']);

  // Viewer message composer (for non-owner or public viewer chat)
  const [viewerMessageText, setViewerMessageText] = useState('');
  const [showViewerComposer, setShowViewerComposer] = useState(false);

  // Active open comment sections for posts
  const [openCommentsPostId, setOpenCommentsPostId] = useState<string | null>(null);
  const [commentInputs, setCommentInputs] = useState<{ [postId: string]: string }>({});

  // Live timer so relative timestamps update as real minutes pass
  const [, setTick] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setTick((t) => t + 1), 5000);
    return () => clearInterval(timer);
  }, []);

  const posts: CommunityPost[] = channel.communityPosts || [];

  // Sort: pinned posts first, then latest by timestamp
  const sortedPosts = [...posts].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return b.timestamp - a.timestamp;
  });

  const handleAddPollOption = () => {
    if (pollOptions.length < 5) {
      setPollOptions([...pollOptions, '']);
    }
  };

  const handleRemovePollOption = (idx: number) => {
    if (pollOptions.length > 2) {
      setPollOptions(pollOptions.filter((_, i) => i !== idx));
    }
  };

  const handleUpdatePollOption = (idx: number, value: string) => {
    const updated = [...pollOptions];
    updated[idx] = value;
    setPollOptions(updated);
  };

  // Publish Channel Owner Post
  const handlePublishOwnerPost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostText.trim()) return;

    let pollData = undefined;
    if (showPollInput) {
      const validOptions = pollOptions.filter((opt) => opt.trim().length > 0);
      if (validOptions.length >= 2) {
        pollData = {
          question: pollQuestion.trim() || undefined,
          options: validOptions.map((text, i) => ({
            id: 'opt_' + Date.now() + '_' + i,
            text: text.trim(),
            votes: 0,
          })),
          totalVotes: 0,
        };
      }
    }

    // Calculate initial response based on channel subscriber popularity
    // "Если непопулярный канал будет мало актива на постах, большой канал от 50.000 - бесконечно, будет много актива"
    const subs = channel.subscribers || 0;
    const isBig = subs >= 50000;
    const isMedium = subs >= 1000 && subs < 50000;

    let initialLikes = 1;
    let initialPollData = pollData;
    let initialComments: CommunityComment[] = [];

    if (isBig) {
      // Big channel (50k+): strong immediate engagement
      const baseMult = Math.min(subs / 60000, 300);
      initialLikes = Math.floor(Math.random() * 80 * baseMult) + Math.floor(baseMult * 25);

      if (initialPollData && initialPollData.options.length > 0) {
        let totalV = 0;
        const newOptions = initialPollData.options.map((opt) => {
          const v = Math.floor(Math.random() * 40 * baseMult) + Math.floor(baseMult * 15);
          totalV += v;
          return { ...opt, votes: v };
        });
        initialPollData = {
          ...initialPollData,
          options: newOptions,
          totalVotes: totalV,
        };
      }

      // Initial fast comments from active subscribers
      const pollOptionsList = initialPollData?.options || [];
      const hasPoll = pollOptionsList.length > 0;
      const combinedText = ((newPostText || '') + ' ' + (pollQuestion || '')).toLowerCase();

      const hasHowAreYouPoll = combinedText.includes('#какдела?') || combinedText.includes('#какдела');
      const hasWhatToFilm = combinedText.includes('#чтоснять?') || combinedText.includes('#чтоснять');
      const hasHowAreYouNoPoll = combinedText.includes('#какделанеопрос!') || combinedText.includes('#какделанеопрос');
      const hasBeginnerMontageTag = combinedText.includes('#советыначинающимвмонтаже');
      const hasMontagePackTag = combinedText.includes('#пакмонтажа');

      let initialCommentTexts = [
        'Ура, новый пост! Всегда жду весточки от канала! 🔥',
        'Первый! Лайк не глядя ❤️',
        'Привет! Как дела у всех? Ждем продолжения!',
      ];

      if (hasBeginnerMontageTag && hasMontagePackTag) {
        initialCommentTexts = [
          'Спасибо за советы начинающим в монтаже! А где можно скачать пак монтажа? В описании или в закрепе? 🔥',
          'Пак монтажа просто пушка! Звуки и переходы высшего качества! Огромное спасибо за обучалку ❤️',
          'Очень полезные советы начинающим в монтаже! С этим паком работа пошла в 3 раза быстрее!',
          'Топ контент! Давно искал нормальный пак монтажа и понятные советы для новичков 👍',
        ];
      } else if (hasBeginnerMontageTag) {
        initialCommentTexts = [
          'Спасибо за советы начинающим в монтаже! Подскажи, с чего лучше начать — CapCut или сразу Premiere Pro?',
          'Очень полезные советы начинающим в монтаже! Наконец-то понял, как правильно склеивать кадры по движению 🔥',
          'Как раз только начал учиться монтировать, твои советы начинающим в монтаже просто спасли ролик! Спасибо огромное!',
          'А как новичку работать с цветокоррекцией? Сделай отдельный пост с советами по кривым и LUT-ам!',
          'Совет по саунд-дизайну и плавному затуханию аудио просто топ! Звук стал в 10 раз лучше 👍',
        ];
      } else if (hasMontagePackTag) {
        initialCommentTexts = [
          'Где скачать этот пак монтажа? Ссылка в описании роликов? 🔥',
          'Пак монтажа просто пушка! Звуки (whoosh, pop, transitions) и анимированные плашки — топовые!',
          'Огромное спасибо за пак монтажа! Все переходы и звуки сразу залетели в проект ❤️',
          'С этим паком монтажа скорость работы выросла в разы! Респект за качественную подборку!',
          'Бесплатный пак монтажа такого уровня — огромная редкость! Всё работает без багов!',
        ];
      } else if (hasHowAreYouNoPoll) {
        // #Какделанеопрос! -> simple conversation about their day and mood
        initialCommentTexts = [
          'Привет! У меня все супер, отдыхаю после учебы! А у тебя как дела? 😊',
          'Привет привет! Настроение отличное, спасибо что спросил! ❤️',
          'Дела отлично, сижу пью чай и жду новостей! Как сам поживаешь?',
          'Привет автор! Всё класс, день прошел отлично ✨',
        ];
      } else if (hasPoll && hasHowAreYouPoll && !hasWhatToFilm) {
        // #Какдела? poll -> vote on how they feel (не просят снять видео)
        const optNames = pollOptionsList.map(o => o.text);
        const firstOpt = optNames[0] || 'Хорошо';
        initialCommentTexts = [
          `Проголосовал за «${firstOpt}»! У меня всё именно так 👍`,
          'Выбрал свой вариант в опросе! Настроение позитивное 😊',
          'Отдал голос! Приятно, что интересуешься делами подписчиков ❤️',
          'Проголосовал! Всё круто, автор, а у тебя как дела?',
        ];
      } else if (hasPoll) {
        // #Чтоснять? or video poll
        // "И пишут варианты ответов типо. Давай сними "Вариант ответа 1" или 2 или 3 и тд. так до 5. Интерактив!"
        const pollSuggestions = pollOptionsList.map((opt, i) => {
          const num = i + 1;
          const variants = [
            `Давай сними "${opt.text}"! Давно жду такой ролик! 🔥`,
            `Я голосую за вариант ${num}: "${opt.text}"! Будет супер!`,
            `Давай сними "${opt.text}"! Точно залетит! 👍`,
            `Однозначно вариант ${num} ("${opt.text}")! Снимай его!`,
          ];
          return variants[i % variants.length];
        });
        initialCommentTexts = [
          ...pollSuggestions.slice(0, 3),
          'Опрос топ, отдал голос! Ждем видео!',
          'Привет! Как дела, автор? Проголосовал!',
        ];
      }

      initialComments = initialCommentTexts.slice(0, Math.floor(Math.random() * 2) + 2).map((txt, idx) => ({
        id: 'comm_init_' + Date.now() + '_' + idx,
        author: ['Vanya_Play', 'Masha_Pro', 'Danil_Super', 'Alex_Real', 'Sonya_Fan'][idx % 5],
        authorHandle: '@fan_' + (idx + 1),
        authorColor: ['#f59e0b', '#3b82f6', '#10b981', '#8b5cf6', '#ec4899'][idx % 5],
        text: txt,
        timestamp: Date.now() - (idx + 1) * 3000,
        likes: Math.floor(Math.random() * 45) + 8,
      }));
    } else if (isMedium) {
      initialLikes = Math.floor(Math.random() * 12) + 3;
      if (initialPollData && initialPollData.options.length > 0) {
        let totalV = 0;
        const newOptions = initialPollData.options.map((opt) => {
          const v = Math.floor(Math.random() * 5) + 1;
          totalV += v;
          return { ...opt, votes: v };
        });
        initialPollData = {
          ...initialPollData,
          options: newOptions,
          totalVotes: totalV,
        };
      }
      if (Math.random() < 0.6) {
        const pollOpts = initialPollData?.options || [];
        const combinedText = ((newPostText || '') + ' ' + (pollQuestion || '')).toLowerCase();
        const hasHowAreYou = combinedText.includes('#какдела?') || combinedText.includes('#какдела') || combinedText.includes('#какделанеопрос');
        let commTxt = 'О, пост в сообществе! Ждем новых новостей 👍';
        if (hasHowAreYou) {
          commTxt = 'Привет! У меня все отлично, спасибо за пост! А у тебя как дела? 😊';
        } else if (pollOpts.length > 0) {
          const chosen = pollOpts[0];
          commTxt = `Давай сними "${chosen.text}"! Проголосовал за вариант 1!`;
        }
        initialComments.push({
          id: 'comm_init_' + Date.now(),
          author: 'Alex_Gamer',
          authorHandle: '@alex_gamer',
          authorColor: '#10b981',
          text: commTxt,
          timestamp: Date.now() - 2000,
          likes: 2,
        });
      }
    }

    const newPost: CommunityPost = {
      id: 'post_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      channelId: channel.id,
      authorName: channel.name,
      authorHandle: channel.handle,
      authorAvatar: channel.avatarUrl,
      authorColor: channel.avatarColor,
      isChannelOwner: true,
      isVerified: channel.verified,
      text: newPostText.trim(),
      timestamp: Date.now(),
      likes: initialLikes,
      isLikedByViewer: true,
      imageUrl: showImageInput && newPostImage.trim() ? newPostImage.trim() : undefined,
      poll: initialPollData,
      comments: initialComments,
    };

    const updatedPosts = [newPost, ...posts];
    onUpdateChannel({
      ...channel,
      communityPosts: updatedPosts,
    });

    setNewPostText('');
    setNewPostImage('');
    setShowImageInput(false);
    setShowPollInput(false);
    setPollQuestion('');
    setPollOptions(['', '']);
  };

  // Publish Viewer Message / Discussion
  const handlePublishViewerMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!viewerMessageText.trim()) return;

    const authorName = currentChannel?.name || 'Зритель';
    const authorHandle = currentChannel?.handle || '@viewer';
    const authorAvatar = currentChannel?.avatarUrl;
    const authorColor = currentChannel?.avatarColor || '#3b82f6';

    const newPost: CommunityPost = {
      id: 'viewer_post_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      channelId: channel.id,
      authorName,
      authorHandle,
      authorAvatar,
      authorColor,
      isChannelOwner: false,
      isVerified: currentChannel?.verified,
      text: viewerMessageText.trim(),
      timestamp: Date.now(),
      likes: 1,
      isLikedByViewer: true,
      comments: [],
    };

    const updatedPosts = [newPost, ...posts];
    onUpdateChannel({
      ...channel,
      communityPosts: updatedPosts,
    });

    setViewerMessageText('');
    setShowViewerComposer(false);
  };

  // Delete post from community
  const handleDeletePost = (postId: string) => {
    const updatedPosts = posts.filter((p) => p.id !== postId);
    onUpdateChannel({
      ...channel,
      communityPosts: updatedPosts,
    });
  };

  // Stop or restart voting in poll
  const handleToggleClosePoll = (postId: string) => {
    const updated = posts.map((post) => {
      if (post.id !== postId || !post.poll) return post;
      const willClose = !post.poll.isClosed;

      let winningId: string | undefined = undefined;
      if (willClose && post.poll.options.length > 0) {
        const topOpt = post.poll.options.reduce((prev, curr) => (curr.votes > prev.votes ? curr : prev), post.poll.options[0]);
        winningId = topOpt.id;
      }

      return {
        ...post,
        poll: {
          ...post.poll,
          isClosed: willClose,
          closedAt: willClose ? Date.now() : undefined,
          winningOptionId: winningId,
        },
      };
    });

    onUpdateChannel({
      ...channel,
      communityPosts: updated,
    });
  };

  // Vote in poll
  const handleVotePoll = (postId: string, optionId: string) => {
    const updated = posts.map((post) => {
      if (post.id !== postId || !post.poll) return post;
      if (post.poll.isClosed) return post; // poll concluded, cannot vote
      if (post.poll.userVotedOptionId) return post; // already voted

      const newOptions = post.poll.options.map((opt) => {
        if (opt.id === optionId) {
          return { ...opt, votes: opt.votes + 1 };
        }
        return opt;
      });

      return {
        ...post,
        poll: {
          ...post.poll,
          options: newOptions,
          totalVotes: (post.poll.totalVotes || 0) + 1,
          userVotedOptionId: optionId,
        },
      };
    });

    onUpdateChannel({
      ...channel,
      communityPosts: updated,
    });
  };

  // Like / Unlike post
  const handleToggleLikePost = (postId: string) => {
    const updated = posts.map((post) => {
      if (post.id !== postId) return post;
      const isLiked = post.isLikedByViewer;
      return {
        ...post,
        likes: isLiked ? Math.max(0, post.likes - 1) : post.likes + 1,
        isLikedByViewer: !isLiked,
      };
    });

    onUpdateChannel({
      ...channel,
      communityPosts: updated,
    });
  };

  // Add comment to post
  const handleAddComment = (postId: string) => {
    const text = commentInputs[postId]?.trim();
    if (!text) return;

    const authorName = currentChannel?.name || 'Зритель';
    const authorHandle = currentChannel?.handle || '@viewer';
    const authorAvatar = currentChannel?.avatarUrl;
    const authorColor = currentChannel?.avatarColor || '#3b82f6';

    const newComment: CommunityComment = {
      id: 'comm_c_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      author: authorName,
      authorHandle,
      authorAvatar,
      authorColor,
      text,
      timestamp: Date.now(),
      likes: 1,
      isLikedByViewer: true,
      isAuthor: isOwner,
    };

    // If user writes a comment on any post, generate realistic subscriber / author engagement
    const targetPost = posts.find((p) => p.id === postId);
    const postComments = [...(targetPost?.comments || []), newComment];

    // If channel has subscribers and is active, other subscribers or the author reply back quickly
    const subs = channel.subscribers || 0;
    const shouldAddReply = subs > 200;

    if (shouldAddReply) {
      setTimeout(() => {
        const isAir = channel.id === 'chan_air' || channel.name.toLowerCase().includes('эйр');
        let replyAuthor = channel.name;
        let replyHandle = channel.handle;
        let replyColor = channel.avatarColor;
        let isAuthorReply = !isOwner && Math.random() < 0.7; // Author replies to user
        let replyText = '';

        const lowerInput = text.toLowerCase();
        const isGreeting =
          lowerInput.includes('привет') ||
          lowerInput.includes('ку') ||
          lowerInput.includes('хай') ||
          lowerInput.includes('здравствуй');
        const isHowAreYou =
          lowerInput.includes('как дела') ||
          lowerInput.includes('как ты') ||
          lowerInput.includes('как жизнь') ||
          lowerInput.includes('как настроение') ||
          lowerInput.includes('че как');

        if (isAuthorReply) {
          if (isGreeting) {
            const authorGreetings = [
              'Привет! Как твои дела? Рад, что заглянул в сообщество!',
              'Привет привет! Как настроение? Спасибо, что ты с нами! 😊',
              'Привет! Всё отлично, как у тебя дела?',
              'Привет! Рад видеть тебя здесь! ✨',
            ];
            replyText = authorGreetings[Math.floor(Math.random() * authorGreetings.length)];
          } else if (isHowAreYou) {
            const authorStatus = [
              'Все отлично! Готовлю новые идеи и читаю ваши комменты, а у тебя как дела?',
              'Потихоньку, все супер! Спасибо, что интересуешься) Как твои дела?',
              'Настроение боевое! Скоро порадую новым контентом, как твой день?',
              'Все супер! Отдыхаю и общаюсь с вами в сообществе 😊',
            ];
            replyText = authorStatus[Math.floor(Math.random() * authorStatus.length)];
          } else if (isAir) {
            const airReplies = [
              'Спасибо за поддержку в сообществе! Читаю все сообщения, вы лучшие! ❤️',
              'Спасибо за актив! Рад, что остаетесь на связи в сообществе!',
              'Ценю каждого! Будем общаться здесь в постах ✨',
            ];
            replyText = airReplies[Math.floor(Math.random() * airReplies.length)];
          } else {
            const authorReplies = [
              'Спасибо огромное за отклик! Рад видеть тебя в сообществе! 🔥',
              'В точку подмечено! Спасибо за комментарий!',
              'Спасибо за поддержку, всегда читаю и ценю ваши мнения! 👍',
              'Рад стараться! Скоро будут новые крутые новости!',
            ];
            replyText = authorReplies[Math.floor(Math.random() * authorReplies.length)];
          }
        } else {
          // Other subscriber agrees/replies
          replyAuthor = ['Danil_2026', 'Kirill_Pro', 'Vika_Craft', 'Alex_Real', 'Sonya_Play'][Math.floor(Math.random() * 5)];
          replyHandle = '@' + replyAuthor.toLowerCase();
          replyColor = '#10b981';

          if (isGreeting) {
            const subGreetings = [
              'Привет привет! Как дела у тебя?',
              'Привет! Рад видеть в комментариях!',
              'Приветик! Как проходит день?)',
            ];
            replyText = subGreetings[Math.floor(Math.random() * subGreetings.length)];
          } else if (isHowAreYou) {
            const subHowAreYou = [
              'У меня всё супер! Сижу вот сообщество листаю, а у тебя как?)',
              'Всё отлично! Ждём новый ролик от автора!',
              'Нормально, отдыхаю после учебы) Как сам?',
            ];
            replyText = subHowAreYou[Math.floor(Math.random() * subHowAreYou.length)];
          } else {
            const fanReplies = [
              'Полностью согласен с тобой!',
              'Факт! Лучший канал на платформе 🔥',
              'Да, тоже так считаю!',
              'Плюсую к твоему комменту 👍',
            ];
            replyText = fanReplies[Math.floor(Math.random() * fanReplies.length)];
          }
        }

        const replyComment: CommunityComment = {
          id: 'comm_rep_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
          author: replyAuthor,
          authorHandle: replyHandle,
          authorAvatar: isAuthorReply ? channel.avatarUrl : undefined,
          authorColor: replyColor,
          text: replyText,
          timestamp: Date.now(),
          likes: isAuthorReply ? Math.floor(Math.random() * 25) + 5 : Math.floor(Math.random() * 5) + 1,
          isAuthor: isAuthorReply,
        };

        const refreshedPosts = (channel.communityPosts || []).map((p) => {
          if (p.id !== postId) return p;
          return {
            ...p,
            comments: [...(p.comments || []), replyComment],
          };
        });

        onUpdateChannel({
          ...channel,
          communityPosts: refreshedPosts,
        });
      }, 700);
    }

    const updated = posts.map((post) => {
      if (post.id !== postId) return post;
      return {
        ...post,
        comments: postComments,
      };
    });

    onUpdateChannel({
      ...channel,
      communityPosts: updated,
    });

    setCommentInputs({ ...commentInputs, [postId]: '' });
  };

  // Like comment
  const handleToggleLikeComment = (postId: string, commentId: string) => {
    const updated = posts.map((post) => {
      if (post.id !== postId) return post;
      const updatedComments = (post.comments || []).map((c) => {
        if (c.id !== commentId) return c;
        const isLiked = c.isLikedByViewer;
        return {
          ...c,
          likes: isLiked ? Math.max(0, c.likes - 1) : c.likes + 1,
          isLikedByViewer: !isLiked,
        };
      });
      return { ...post, comments: updatedComments };
    });

    onUpdateChannel({
      ...channel,
      communityPosts: updated,
    });
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Top Banner / Actions Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-2xl bg-[#1e1e1e] border border-[#2e2e2e]">
        <div>
          <h2 className="text-base md:text-lg font-bold text-white flex items-center gap-2">
            <span>Сообщество канала</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[#272727] text-[#aaaaaa]">
              {sortedPosts.length} записей
            </span>
          </h2>
          <p className="text-xs text-[#aaaaaa] mt-0.5">
            Здесь зрители и автор общаются друг с другом, делятся мыслями и новостями
          </p>
        </div>

        {/* Quick button to write as a viewer or owner */}
        {!isOwner && !showViewerComposer && (
          <button
            type="button"
            onClick={() => setShowViewerComposer(true)}
            className="flex items-center gap-2 rounded-full bg-[#272727] hover:bg-[#383838] px-4 py-2 text-xs md:text-sm font-semibold text-white border border-[#3e3e3e] transition-colors cursor-pointer"
          >
            <MessageSquare className="h-4 w-4 text-[#3ea6ff]" />
            <span>Написать в сообщество</span>
          </button>
        )}
      </div>

      {/* Viewer Message Composer (if opened) */}
      {showViewerComposer && !isOwner && (
        <form
          onSubmit={handlePublishViewerMessage}
          className="p-4 rounded-2xl bg-[#1e1e1e] border border-[#3ea6ff]/40 shadow-lg space-y-3"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div
                className="h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0 overflow-hidden"
                style={{ backgroundColor: currentChannel?.avatarColor || '#3b82f6' }}
              >
                {currentChannel?.avatarUrl ? (
                  <img src={currentChannel.avatarUrl} alt="" className="h-full w-full object-cover" />
                ) : (
                  currentChannel?.name?.[0] || 'U'
                )}
              </div>
              <span className="text-xs font-bold text-white">
                Сообщение от зрителя: {currentChannel?.name || 'Вы'}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setShowViewerComposer(false)}
              className="text-xs text-[#aaaaaa] hover:text-white cursor-pointer"
            >
              Отмена
            </button>
          </div>

          <textarea
            value={viewerMessageText}
            onChange={(e) => setViewerMessageText(e.target.value)}
            placeholder={`Напишите сообщение в сообщество ${channel.name} или задайте вопрос зрителям...`}
            rows={3}
            className="w-full bg-[#121212] border border-[#2e2e2e] focus:border-[#3ea6ff] rounded-xl p-3 text-xs md:text-sm text-white placeholder-[#717171] focus:outline-none resize-none"
          />

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowViewerComposer(false)}
              className="px-3 py-1.5 rounded-full text-xs font-semibold text-[#aaaaaa] hover:bg-[#272727] cursor-pointer"
            >
              Отмена
            </button>
            <button
              type="submit"
              disabled={!viewerMessageText.trim()}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#3ea6ff] hover:bg-[#3894e6] disabled:opacity-50 text-xs font-bold text-black transition-all cursor-pointer"
            >
              <Send className="h-3.5 w-3.5" />
              <span>Отправить</span>
            </button>
          </div>
        </form>
      )}

      {/* Owner Post Composer (when viewing own channel) */}
      {isOwner && (
        <form
          onSubmit={handlePublishOwnerPost}
          className="p-4 rounded-2xl bg-[#1e1e1e] border border-[#2e2e2e] space-y-3"
        >
          <div className="flex items-center gap-2.5">
            <div
              className="h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0 overflow-hidden"
              style={{ backgroundColor: channel.avatarColor }}
            >
              {channel.avatarUrl ? (
                <img src={channel.avatarUrl} alt="" className="h-full w-full object-cover" />
              ) : (
                channel.name[0]
              )}
            </div>
            <div className="text-xs font-bold text-white">
              Опубликовать запись от имени канала {channel.name}
            </div>
          </div>

          <textarea
            value={newPostText}
            onChange={(e) => setNewPostText(e.target.value)}
            placeholder="Поделитесь новостью, спросите что снимать дальше или начните общение..."
            rows={3}
            className="w-full bg-[#121212] border border-[#2e2e2e] focus:border-[#3ea6ff] rounded-xl p-3 text-xs md:text-sm text-white placeholder-[#717171] focus:outline-none resize-none"
          />

          {/* Hashtags selection toolbar */}
          <div className="p-2.5 rounded-xl bg-[#141414] border border-[#272727] space-y-2">
            <div className="flex items-center justify-between text-[11px] text-[#aaaaaa]">
              <span className="flex items-center gap-1 font-bold text-white">
                <Hash className="h-3.5 w-3.5 text-[#3ea6ff]" />
                <span>Выбор хэштегов (нажмите, чтобы вставить и настроить опрос):</span>
              </span>
              <span className="text-[10px] text-[#777777]">Нажмите на хэштег для выбора</span>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {/* #Какдела? */}
              <button
                type="button"
                onClick={() => {
                  let text = newPostText;
                  if (!text.includes('#Какдела?')) {
                    text = (text.trim() + (text.trim() ? ' ' : '') + '#Какдела?').trim();
                    setNewPostText(text);
                  }
                  setShowPollInput(true);
                  setPollQuestion('Как у вас дела?');
                  setPollOptions(['Отлично 🔥', 'Хорошо 👍', 'Норм 🙂', 'Устал 😴', 'Не очень 😔']);
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                  newPostText.includes('#Какдела?')
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 shadow-sm shadow-emerald-950/40'
                    : 'bg-[#222222] hover:bg-[#2c2c2c] text-[#cccccc] border-[#333333]'
                }`}
                title="Опрос о делах и настроении: подписчики голосуют за свое состояние"
              >
                <span className="font-extrabold text-[#3ea6ff]">#Какдела?</span>
                <span className="text-[10px] font-normal text-[#aaaaaa]">(опрос настроения)</span>
              </button>

              {/* #Чтоснять? */}
              <button
                type="button"
                onClick={() => {
                  let text = newPostText;
                  if (!text.includes('#Чтоснять?')) {
                    text = (text.trim() + (text.trim() ? ' ' : '') + '#Чтоснять?').trim();
                    setNewPostText(text);
                  }
                  setShowPollInput(true);
                  setPollQuestion('Что снять в следующем видео?');
                  setPollOptions(['Летсплей с модами', 'Челлендж 24 часа', 'Гайд и обучение', 'Стрим с подписчиками']);
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                  newPostText.includes('#Чтоснять?')
                    ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/50 shadow-sm shadow-indigo-950/40'
                    : 'bg-[#222222] hover:bg-[#2c2c2c] text-[#cccccc] border-[#333333]'
                }`}
                title="Опрос что снять: подписчики предлагают варианты роликов и голосуют"
              >
                <span className="font-extrabold text-[#3ea6ff]">#Чтоснять?</span>
                <span className="text-[10px] font-normal text-[#aaaaaa]">(опрос видео)</span>
              </button>

              {/* #Какделанеопрос! */}
              <button
                type="button"
                onClick={() => {
                  let text = newPostText;
                  if (!text.includes('#Какделанеопрос!')) {
                    text = (text.trim() + (text.trim() ? ' ' : '') + '#Какделанеопрос!').trim();
                    setNewPostText(text);
                  }
                  // Hide poll because this is a text-only discussion
                  setShowPollInput(false);
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                  newPostText.includes('#Какделанеопрос!')
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-sm shadow-amber-950/40'
                    : 'bg-[#222222] hover:bg-[#2c2c2c] text-[#cccccc] border-[#333333]'
                }`}
                title="Живой чат без опроса: зрители просто пишут в комментариях как дела"
              >
                <span className="font-extrabold text-amber-400">#Какделанеопрос!</span>
                <span className="text-[10px] font-normal text-[#aaaaaa]">(общение в комм.)</span>
              </button>

              {/* #советыначинающимвмонтаже */}
              <button
                type="button"
                onClick={() => {
                  let text = newPostText;
                  if (!text.includes('#советыначинающимвмонтаже')) {
                    text = (text.trim() + (text.trim() ? ' ' : '') + '#советыначинающимвмонтаже').trim();
                    setNewPostText(text);
                  }
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                  newPostText.includes('#советыначинающимвмонтаже')
                    ? 'bg-blue-500/20 text-blue-300 border-blue-500/50 shadow-sm shadow-blue-950/40'
                    : 'bg-[#222222] hover:bg-[#2c2c2c] text-[#cccccc] border-[#333333]'
                }`}
                title="Советы начинающим в монтаже: обсуждение фишек монтажа и туториалов"
              >
                <span className="font-extrabold text-blue-400">#советыначинающимвмонтаже</span>
                <span className="text-[10px] font-normal text-[#aaaaaa]">(советы по монтажу)</span>
              </button>

              {/* #пакмонтажа */}
              <button
                type="button"
                onClick={() => {
                  let text = newPostText;
                  if (!text.includes('#пакмонтажа')) {
                    text = (text.trim() + (text.trim() ? ' ' : '') + '#пакмонтажа').trim();
                    setNewPostText(text);
                  }
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                  newPostText.includes('#пакмонтажа')
                    ? 'bg-amber-600/20 text-amber-300 border-amber-600/50 shadow-sm shadow-amber-950/40'
                    : 'bg-[#222222] hover:bg-[#2c2c2c] text-[#cccccc] border-[#333333]'
                }`}
                title="Пак монтажа: звуковые эффекты, футажи и переходы"
              >
                <span className="font-extrabold text-amber-400">#пакмонтажа</span>
                <span className="text-[10px] font-normal text-[#aaaaaa]">(пак эффектов)</span>
              </button>
            </div>
          </div>

          {/* Optional Image URL Input */}
          {showImageInput && (
            <div className="flex items-center gap-2 bg-[#121212] border border-[#2e2e2e] rounded-xl p-2">
              <ImageIcon className="h-4 w-4 text-[#aaaaaa] shrink-0" />
              <input
                type="url"
                value={newPostImage}
                onChange={(e) => setNewPostImage(e.target.value)}
                placeholder="Вставьте прямую ссылку на изображение (URL)..."
                className="w-full bg-transparent text-xs text-white placeholder-[#717171] focus:outline-none"
              />
              <button
                type="button"
                onClick={() => {
                  setShowImageInput(false);
                  setNewPostImage('');
                }}
                className="text-[#aaaaaa] hover:text-white text-xs cursor-pointer px-1"
              >
                ✕
              </button>
            </div>
          )}

          {/* Optional Poll Creator */}
          {showPollInput && (
            <div className="p-3 rounded-xl bg-[#121212] border border-[#2e2e2e] space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-white">
                <span className="flex items-center gap-1.5">
                  <BarChart2 className="h-4 w-4 text-[#3ea6ff]" />
                  <span>Опрос для сообщества</span>
                </span>
                <button
                  type="button"
                  onClick={() => setShowPollInput(false)}
                  className="text-[#aaaaaa] hover:text-white cursor-pointer"
                >
                  ✕ Убрать опрос
                </button>
              </div>

              <input
                type="text"
                value={pollQuestion}
                onChange={(e) => setPollQuestion(e.target.value)}
                placeholder="Вопрос опроса (необязательно)..."
                className="w-full bg-[#1e1e1e] border border-[#2e2e2e] rounded-lg px-3 py-1.5 text-xs text-white placeholder-[#717171] focus:outline-none"
              />

              <div className="space-y-1.5">
                {pollOptions.map((opt, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={opt}
                      onChange={(e) => handleUpdatePollOption(i, e.target.value)}
                      placeholder={`Вариант ${i + 1}...`}
                      className="flex-1 bg-[#1e1e1e] border border-[#2e2e2e] rounded-lg px-3 py-1.5 text-xs text-white placeholder-[#717171] focus:outline-none"
                    />
                    {pollOptions.length > 2 && (
                      <button
                        type="button"
                        onClick={() => handleRemovePollOption(i)}
                        className="text-[#aaaaaa] hover:text-rose-400 p-1 cursor-pointer"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {pollOptions.length < 5 && (
                <button
                  type="button"
                  onClick={handleAddPollOption}
                  className="flex items-center gap-1 text-xs text-[#3ea6ff] hover:underline cursor-pointer pt-1"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Добавить вариант</span>
                </button>
              )}
            </div>
          )}

          {/* Action toolbar */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowImageInput(!showImageInput)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors cursor-pointer ${
                  showImageInput
                    ? 'bg-[#3ea6ff]/20 text-[#3ea6ff]'
                    : 'bg-[#272727] text-[#aaaaaa] hover:text-white'
                }`}
              >
                <ImageIcon className="h-3.5 w-3.5" />
                <span>Фото</span>
              </button>

              <button
                type="button"
                onClick={() => setShowPollInput(!showPollInput)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors cursor-pointer ${
                  showPollInput
                    ? 'bg-[#3ea6ff]/20 text-[#3ea6ff]'
                    : 'bg-[#272727] text-[#aaaaaa] hover:text-white'
                }`}
              >
                <BarChart2 className="h-3.5 w-3.5" />
                <span>Опрос</span>
              </button>
            </div>

            <button
              type="submit"
              disabled={!newPostText.trim()}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#3ea6ff] hover:bg-[#3894e6] disabled:opacity-50 text-xs font-bold text-black transition-all cursor-pointer"
            >
              <span>Опубликовать запись</span>
            </button>
          </div>
        </form>
      )}

      {/* Posts List */}
      {sortedPosts.length === 0 ? (
        <div className="py-16 text-center text-[#aaaaaa] bg-[#1e1e1e] rounded-2xl border border-[#272727] p-8">
          <MessageSquare className="h-12 w-12 mx-auto mb-3 text-[#555555]" />
          <h3 className="text-base font-bold text-white">В сообществе пока нет записей</h3>
          <p className="text-xs text-[#888888] mt-1 max-w-md mx-auto">
            {isOwner
              ? 'Напишите первую запись или создайте опрос, чтобы начать общение с аудиторией!'
              : 'Будьте первым, кто напишет сообщение в сообщество этого канала!'}
          </p>
          {!isOwner && (
            <button
              type="button"
              onClick={() => setShowViewerComposer(true)}
              className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#3ea6ff] hover:bg-[#3894e6] px-4 py-2 text-xs font-bold text-black transition-all cursor-pointer"
            >
              <Send className="h-3.5 w-3.5" />
              <span>Написать первое сообщение</span>
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {sortedPosts.map((post) => {
            const isCommentsOpen = openCommentsPostId === post.id;
            const commentsCount = (post.comments || []).length;

            return (
              <div
                key={post.id}
                className={`p-4 md:p-5 rounded-2xl bg-[#1e1e1e] border transition-all ${
                  post.isPinned
                    ? 'border-indigo-600/60 bg-gradient-to-b from-[#1e1b4b]/40 to-[#1e1e1e] shadow-lg shadow-indigo-950/30'
                    : 'border-[#272727] hover:border-[#383838]'
                }`}
              >
                {/* Pinned header badge */}
                {post.isPinned && (
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-indigo-400 mb-2.5 pb-2 border-b border-indigo-900/40">
                    <Pin className="h-3.5 w-3.5 fill-indigo-400" />
                    <span>Закрепленная запись</span>
                  </div>
                )}

                {/* Post Author Row */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="h-10 w-10 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0 overflow-hidden shadow"
                      style={{ backgroundColor: post.authorColor || '#0284c7' }}
                    >
                      {post.authorAvatar ? (
                        <img src={post.authorAvatar} alt="" className="h-full w-full object-cover" />
                      ) : (
                        post.authorName[0]
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-xs md:text-sm text-white">
                          {post.authorName}
                        </span>
                        {post.isVerified && (
                          <CheckCircle2 className="h-3.5 w-3.5 text-[#3ea6ff] shrink-0" />
                        )}
                        {post.isChannelOwner && (
                          <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-700/40 px-1.5 py-0.2 rounded">
                            Автор
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-[#aaaaaa] flex items-center gap-1.5 mt-0.5">
                        <span>{post.authorHandle || '@user'}</span>
                        <span>•</span>
                        <span>{formatTimeAgo(post.timestamp)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions: Delete post if owner or author */}
                  {(isOwner || post.authorHandle === currentChannel?.handle || post.authorName === currentChannel?.name) && (
                    <button
                      type="button"
                      onClick={() => handleDeletePost(post.id)}
                      className="flex items-center gap-1 text-xs text-[#888888] hover:text-rose-400 p-1.5 rounded-lg hover:bg-[#2a2a2a] transition-colors cursor-pointer"
                      title="Удалить запись"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="hidden sm:inline text-[11px]">Удалить</span>
                    </button>
                  )}
                </div>

                {/* Post Text with highlighted hashtags */}
                <div className="text-xs md:text-sm text-[#ededed] whitespace-pre-wrap leading-relaxed">
                  {post.text.split(/(#[^\s,]+)/g).map((chunk, idx) => {
                    if (chunk.startsWith('#')) {
                      const isHowAreYou = chunk.toLowerCase().includes('#какдела?') || chunk.toLowerCase().includes('#какдела');
                      const isWhatToFilm = chunk.toLowerCase().includes('#чтоснять?') || chunk.toLowerCase().includes('#чтоснять');
                      const isHowAreYouChat = chunk.toLowerCase().includes('#какделанеопрос!') || chunk.toLowerCase().includes('#какделанеопрос');

                      let colorClass = 'text-[#3ea6ff] bg-[#3ea6ff]/10 border-[#3ea6ff]/30';
                      if (isHowAreYouChat) {
                        colorClass = 'text-amber-400 bg-amber-500/10 border-amber-500/30';
                      } else if (isHowAreYou) {
                        colorClass = 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
                      } else if (isWhatToFilm) {
                        colorClass = 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30';
                      }

                      return (
                        <span
                          key={idx}
                          className={`inline-block px-1.5 py-0.5 rounded text-[11px] font-bold border mx-0.5 ${colorClass}`}
                        >
                          {chunk}
                        </span>
                      );
                    }
                    return chunk;
                  })}
                </div>

                {/* Optional Image */}
                {post.imageUrl && (
                  <div className="mt-3 rounded-xl overflow-hidden border border-[#2e2e2e] max-h-96">
                    <img
                      src={post.imageUrl}
                      alt="Вложение"
                      className="w-full h-auto object-cover"
                      loading="lazy"
                    />
                  </div>
                )}

                {/* Optional Poll */}
                {post.poll && (
                  <div className="mt-3.5 p-3.5 rounded-xl bg-[#171717] border border-[#272727] space-y-2">
                    {/* Poll header with question and status/stop control */}
                    <div className="flex items-center justify-between gap-2 flex-wrap mb-1">
                      <div className="flex items-center gap-2">
                        {post.poll.isClosed ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/40">
                            <Lock className="h-3 w-3" />
                            <span>Голосование завершено</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            <span>Активный опрос</span>
                          </span>
                        )}
                      </div>

                      {/* Author control to stop/finish or reopen voting */}
                      {(isOwner || post.authorHandle === currentChannel?.handle || post.authorName === currentChannel?.name) && (
                        <button
                          type="button"
                          onClick={() => handleToggleClosePoll(post.id)}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                            post.poll.isClosed
                              ? 'bg-[#272727] hover:bg-[#333333] text-[#3ea6ff]'
                              : 'bg-rose-500/15 hover:bg-rose-500/25 text-rose-400 border border-rose-500/30'
                          }`}
                          title={post.poll.isClosed ? 'Возобновить голосование' : 'Остановить голосование и подвести итоги'}
                        >
                          <Lock className="h-3 w-3" />
                          <span>{post.poll.isClosed ? 'Возобновить опрос' : 'Остановить голосование'}</span>
                        </button>
                      )}
                    </div>

                    {post.poll.question && (
                      <div className="text-xs font-bold text-white mb-1.5">
                        {post.poll.question}
                      </div>
                    )}

                    {/* Concluded Winner Announcement Banner */}
                    {post.poll.isClosed && (
                      (() => {
                        const topOpt = post.poll.options.reduce(
                          (prev, curr) => (curr.votes > prev.votes ? curr : prev),
                          post.poll.options[0]
                        );
                        return topOpt ? (
                          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-gradient-to-r from-amber-500/20 via-yellow-500/10 to-transparent border border-amber-500/40 text-xs">
                            <Trophy className="h-4 w-4 text-amber-400 shrink-0" />
                            <div>
                              <span className="text-[#888888]">Выбор зрителей: </span>
                              <span className="font-extrabold text-amber-300">«{topOpt.text}»</span>
                              <span className="text-[#aaaaaa] ml-1">({formatCount(topOpt.votes)} голосов)</span>
                            </div>
                          </div>
                        ) : null;
                      })()
                    )}

                    <div className="space-y-1.5">
                      {post.poll.options.map((opt) => {
                        const total = post.poll?.totalVotes || 0;
                        const pct = total > 0 ? Math.round((opt.votes / total) * 100) : 0;
                        const isSelected = post.poll?.userVotedOptionId === opt.id;
                        const isWinner = post.poll?.isClosed && (
                          opt.votes === Math.max(...(post.poll?.options.map(o => o.votes) || [0])) && opt.votes > 0
                        );

                        return (
                          <button
                            key={opt.id}
                            type="button"
                            disabled={post.poll?.isClosed}
                            onClick={() => handleVotePoll(post.id, opt.id)}
                            className={`w-full relative overflow-hidden text-left p-2.5 rounded-xl border text-xs font-semibold transition-all ${
                              post.poll?.isClosed
                                ? isWinner
                                  ? 'border-amber-500/60 bg-amber-500/15 text-white cursor-default shadow-sm shadow-amber-500/10'
                                  : 'border-[#272727] bg-[#1a1a1a] text-[#888888] cursor-default opacity-80'
                                : isSelected
                                ? 'border-[#3ea6ff] bg-[#3ea6ff]/10 text-white cursor-pointer'
                                : 'border-[#2e2e2e] bg-[#222222] hover:bg-[#2a2a2a] text-[#cccccc] cursor-pointer'
                            }`}
                          >
                            {/* Percentage bar fill */}
                            <div
                              className={`absolute inset-y-0 left-0 pointer-events-none transition-all duration-500 ${
                                post.poll?.isClosed
                                  ? isWinner
                                    ? 'bg-amber-500/25'
                                    : 'bg-white/5'
                                  : 'bg-[#3ea6ff]/20'
                              }`}
                              style={{ width: `${pct}%` }}
                            />
                            <div className="relative flex items-center justify-between">
                              <span className="truncate pr-2 flex items-center gap-1.5">
                                {isWinner && <Trophy className="h-3.5 w-3.5 text-amber-400 shrink-0" />}
                                <span>{opt.text}</span>
                              </span>
                              <span className={`font-bold shrink-0 ${isWinner ? 'text-amber-300' : 'text-[#aaaaaa]'}`}>
                                {pct}% ({formatCount(opt.votes)})
                              </span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-[#888888] pt-1">
                      <span>Всего голосов: {formatCount(post.poll.totalVotes || 0)}</span>
                      {post.poll.isClosed && (
                        <span className="text-amber-400/90 font-medium">Голосование закрыто</span>
                      )}
                    </div>
                  </div>
                )}

                {/* Action Buttons Row */}
                <div className="flex items-center gap-4 mt-4 pt-3 border-t border-[#272727] text-xs font-semibold text-[#aaaaaa]">
                  {/* Like button */}
                  <button
                    type="button"
                    onClick={() => handleToggleLikePost(post.id)}
                    className={`flex items-center gap-1.5 py-1 px-2.5 rounded-full hover:bg-[#272727] transition-colors cursor-pointer ${
                      post.isLikedByViewer ? 'text-[#3ea6ff]' : 'hover:text-white'
                    }`}
                  >
                    <ThumbsUp
                      className={`h-4 w-4 ${post.isLikedByViewer ? 'fill-[#3ea6ff]' : ''}`}
                    />
                    <span>{formatCount(post.likes)}</span>
                  </button>

                  {/* Dislike */}
                  <button
                    type="button"
                    className="p-1 rounded-full hover:bg-[#272727] hover:text-white transition-colors cursor-pointer"
                  >
                    <ThumbsDown className="h-4 w-4" />
                  </button>

                  {/* Comments toggle button */}
                  <button
                    type="button"
                    onClick={() =>
                      setOpenCommentsPostId(isCommentsOpen ? null : post.id)
                    }
                    className="flex items-center gap-1.5 py-1 px-2.5 rounded-full hover:bg-[#272727] hover:text-white transition-colors cursor-pointer"
                  >
                    <MessageSquare className="h-4 w-4" />
                    <span>{commentsCount} комментариев</span>
                  </button>

                  {/* Share button */}
                  <button
                    type="button"
                    onClick={() => {
                      if (navigator.clipboard) {
                        navigator.clipboard.writeText(window.location.href);
                      }
                    }}
                    className="flex items-center gap-1.5 py-1 px-2.5 rounded-full hover:bg-[#272727] hover:text-white transition-colors cursor-pointer ml-auto"
                    title="Скопировать ссылку"
                  >
                    <Share2 className="h-4 w-4" />
                    <span className="hidden sm:inline">Поделиться</span>
                  </button>
                </div>

                {/* Comments Section (Collapsible) */}
                {isCommentsOpen && (
                  <div className="mt-4 pt-4 border-t border-[#272727] space-y-3">
                    <div className="text-xs font-bold text-white flex items-center gap-2">
                      <span>Обсуждение ({commentsCount})</span>
                      <span className="text-[11px] font-normal text-[#aaaaaa]">
                        Зрители общаются здесь
                      </span>
                    </div>

                    {/* Comment input form */}
                    <div className="flex gap-2">
                      <div
                        className="h-7 w-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0 overflow-hidden"
                        style={{ backgroundColor: currentChannel?.avatarColor || '#3b82f6' }}
                      >
                        {currentChannel?.avatarUrl ? (
                          <img src={currentChannel.avatarUrl} alt="" className="h-full w-full object-cover" />
                        ) : (
                          currentChannel?.name?.[0] || 'U'
                        )}
                      </div>
                      <div className="flex-1 flex gap-2">
                        <input
                          type="text"
                          value={commentInputs[post.id] || ''}
                          onChange={(e) =>
                            setCommentInputs({ ...commentInputs, [post.id]: e.target.value })
                          }
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              handleAddComment(post.id);
                            }
                          }}
                          placeholder="Оставьте комментарий или ответьте зрителям..."
                          className="flex-1 bg-[#121212] border border-[#2e2e2e] focus:border-[#3ea6ff] rounded-full px-3 py-1.5 text-xs text-white placeholder-[#717171] focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => handleAddComment(post.id)}
                          disabled={!commentInputs[post.id]?.trim()}
                          className="rounded-full bg-[#3ea6ff] hover:bg-[#3894e6] disabled:opacity-40 p-2 text-black transition-all cursor-pointer shrink-0"
                        >
                          <Send className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Comments list */}
                    <div className="space-y-2.5 pt-2 max-h-80 overflow-y-auto pr-1 scrollbar-thin">
                      {(post.comments || []).length === 0 ? (
                        <div className="text-xs text-[#888888] py-2 text-center">
                          Пока нет комментариев. Напишите первым!
                        </div>
                      ) : (
                        post.comments.map((comm) => (
                          <div
                            key={comm.id}
                            className="p-2.5 rounded-xl bg-[#141414] border border-[#252525] flex items-start gap-2.5"
                          >
                            <div
                              className="h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0 overflow-hidden"
                              style={{ backgroundColor: comm.authorColor || (comm.isAuthor ? channel.avatarColor : '#64748b') }}
                            >
                              {comm.authorAvatar ? (
                                <img src={comm.authorAvatar} alt="" className="h-full w-full object-cover" />
                              ) : (
                                comm.author[0]
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="text-xs font-bold text-white truncate">
                                  {comm.author}
                                </span>
                                {comm.isAuthor && (
                                  <span className="text-[9px] font-bold text-emerald-400 bg-emerald-950/60 px-1 py-0.2 rounded border border-emerald-700/40">
                                    Автор
                                  </span>
                                )}
                                {comm.isVipBlogger && (
                                  <span className="text-[9px] font-bold text-rose-400 bg-rose-950/60 px-1 py-0.2 rounded border border-rose-700/40">
                                    Блогер ✓
                                  </span>
                                )}
                                <span className="text-[10px] text-[#777777]">
                                  {formatTimeAgo(comm.timestamp)}
                                </span>
                              </div>
                              <div className="text-xs text-[#d1d5db] mt-0.5 leading-snug">
                                {comm.text}
                              </div>
                              <div className="flex items-center gap-3 mt-1.5 text-[11px] text-[#888888]">
                                <button
                                  type="button"
                                  onClick={() => handleToggleLikeComment(post.id, comm.id)}
                                  className={`flex items-center gap-1 hover:text-white cursor-pointer ${
                                    comm.isLikedByViewer ? 'text-[#3ea6ff]' : ''
                                  }`}
                                >
                                  <ThumbsUp className={`h-3 w-3 ${comm.isLikedByViewer ? 'fill-[#3ea6ff]' : ''}`} />
                                  <span>{comm.likes || 0}</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

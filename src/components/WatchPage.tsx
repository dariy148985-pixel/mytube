import React, { useState, useRef, useEffect } from 'react';
import {
  ThumbsUp,
  ThumbsDown,
  Share2,
  Rocket,
  Trash2,
  CheckCircle2,
  Heart,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  AlertTriangle,
  Send,
  ExternalLink,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Star,
  Pin,
  Hash,
  Edit3,
  Check
} from 'lucide-react';
import { Channel, CommentItem, CommentReplyItem, NotificationItem, VideoItem } from '../types';
import {
  formatCount,
  formatMoney,
  formatTimeAgo,
  REFORMED_PHRASES,
  CONTINUOUS_HATER_REPLIES,
  SUBSCRIBER_JOY_REACTIONS,
  NORMAL_REACTIONS
} from '../services/simulationEngine';
import { isYouTubeSource, getYouTubeEmbedUrl, getYouTubeDirectUrl } from '../services/youtubeHelper';
import { generateBloggerCommentReplies } from '../services/bloggerCommentService';
import { generateAuthorInstantReply, FAMOUS_BLOGGERS } from '../services/channelInteractionService';
import { ConfirmModal } from './ConfirmModal';

interface WatchPageProps {
  video: VideoItem;
  currentChannel: Channel | null;
  channels: Channel[];
  onSelectVideo: (video: VideoItem) => void;
  onUpdateVideo: (updatedVideo: VideoItem) => void;
  onUpdateChannel: (updatedChannel: Channel) => void;
  onOpenBoost: (video: VideoItem) => void;
  onDeleteVideo: (videoId: string) => void;
  allVideos: VideoItem[];
  onNavigateToChannel?: (channelId: string) => void;
  onAddNotification?: (notif: NotificationItem) => void;
}

export const WatchPage: React.FC<WatchPageProps> = ({
  video,
  currentChannel,
  channels,
  onSelectVideo,
  onUpdateVideo,
  onUpdateChannel,
  onOpenBoost,
  onDeleteVideo,
  allVideos,
  onNavigateToChannel,
  onAddNotification,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [descExpanded, setDescExpanded] = useState(false);
  const [commentFilter, setCommentFilter] = useState<'all' | 'hater' | 'fan' | 'normal'>('all');
  const [commentSort, setCommentSort] = useState<'newest' | 'likes'>('newest');
  const [newCommentText, setNewCommentText] = useState('');
  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({});
  const [isSubscribedToChannel, setIsSubscribedToChannel] = useState(false);
  const [shareToast, setShareToast] = useState(false);
  const [showDeleteVideoConfirm, setShowDeleteVideoConfirm] = useState(false);
  const [isEditingDesc, setIsEditingDesc] = useState(false);
  const [editDescText, setEditDescText] = useState(video.desc || '');

  useEffect(() => {
    setEditDescText(video.desc || '');
    setIsEditingDesc(false);
  }, [video.id, video.desc]);

  // Channel switching for commenting
  const [selectedCommentingChannelId, setSelectedCommentingChannelId] = useState<string>(
    currentChannel?.id || channels[0]?.id || ''
  );
  const [expandedThreads, setExpandedThreads] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (currentChannel?.id && !selectedCommentingChannelId) {
      setSelectedCommentingChannelId(currentChannel.id);
    }
  }, [currentChannel?.id, selectedCommentingChannelId]);

  const commentingChannel =
    channels.find((c) => c.id === selectedCommentingChannelId) || currentChannel || channels[0];

  const videoCreatorChannel =
    channels.find((c) => c.id === video.channelId) || (currentChannel?.id === video.channelId ? currentChannel : null);
  const effectiveAvatar = videoCreatorChannel?.avatarUrl || video.channelAvatar;
  const effectiveSubs = videoCreatorChannel ? videoCreatorChannel.subscribers : (video.channelSubs || 0);
  const isVideoCreatorVerified = videoCreatorChannel
    ? !!videoCreatorChannel.verified
    : (video.channelVerified || effectiveSubs >= 100000);

  const videoRef = useRef<HTMLVideoElement>(null);
  const isOwner = currentChannel && currentChannel.id === video.channelId;

  // Sync video time & controls
  useEffect(() => {
    const vid = videoRef.current;
    if (!vid) return;

    const handleTimeUpdate = () => setCurrentTime(vid.currentTime);
    const handleLoadedMetadata = () => setDuration(vid.duration || 0);
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    vid.addEventListener('timeupdate', handleTimeUpdate);
    vid.addEventListener('loadedmetadata', handleLoadedMetadata);
    vid.addEventListener('play', handlePlay);
    vid.addEventListener('pause', handlePause);

    return () => {
      vid.removeEventListener('timeupdate', handleTimeUpdate);
      vid.removeEventListener('loadedmetadata', handleLoadedMetadata);
      vid.removeEventListener('play', handlePlay);
      vid.removeEventListener('pause', handlePause);
    };
  }, [video.id]);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play().catch(() => {});
    } else {
      videoRef.current.pause();
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !videoRef.current.muted;
    setIsMuted(videoRef.current.muted);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = val;
      setCurrentTime(val);
    }
  };

  const handleSpeedChange = (speed: number) => {
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
      setPlaybackSpeed(speed);
      setShowSpeedMenu(false);
    }
  };

  const toggleFullscreen = () => {
    if (!videoRef.current) return;
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    } else {
      videoRef.current.parentElement?.requestFullscreen().catch(() => {});
    }
  };

  // Like / Dislike video handler
  const handleToggleLike = () => {
    const isLiked = video.isLikedByViewer;
    const newLikes = isLiked ? Math.max(0, video.likes - 1) : video.likes + 1;
    const updated = {
      ...video,
      likes: newLikes,
      isLikedByViewer: !isLiked,
      isDislikedByViewer: false,
    };
    onUpdateVideo(updated);
  };

  const handleToggleDislike = () => {
    const isDisliked = video.isDislikedByViewer;
    const updated = {
      ...video,
      dislikes: (video.dislikes || 0) + (isDisliked ? -1 : 1),
      isDislikedByViewer: !isDisliked,
      isLikedByViewer: false,
    };
    onUpdateVideo(updated);
  };

  const handleSubscribeToggle = () => {
    setIsSubscribedToChannel(!isSubscribedToChannel);
    if (currentChannel && currentChannel.id !== video.channelId) {
      const targetChan = channels.find((c) => c.id === video.channelId);
      if (targetChan) {
        const updatedTarget = {
          ...targetChan,
          subscribers: targetChan.subscribers + (!isSubscribedToChannel ? 1 : -1),
        };
        onUpdateChannel(updatedTarget);
      }
    }
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
    }
    setShareToast(true);
    setTimeout(() => setShareToast(false), 3000);
  };

  // Comments logic: Author reply with Hater reform / joy reaction
  const handleReplyChange = (commentId: string, text: string) => {
    setReplyDrafts((prev) => ({ ...prev, [commentId]: text }));
  };

  const handleSendReply = (commentId: string) => {
    const text = (replyDrafts[commentId] || '').trim();
    if (!text) return;

    setReplyDrafts((prev) => {
      const next = { ...prev };
      delete next[commentId];
      return next;
    });

    const targetComment = video.comments.find((c) => c.id === commentId);
    if (!targetComment) return;

    let updatedComment: CommentItem = { ...targetComment };
    let subsDelta = 0;

    if (targetComment.type === 'hater') {
      const willReformed = Math.random() < 0.5;

      setTimeout(() => {
        const freshComment = video.comments.find((c) => c.id === commentId);
        if (!freshComment) return;

        let reformed = false;
        let leftChannel = false;
        let haterReplyText = '';
        let commentType = freshComment.type;

        if (willReformed) {
          reformed = true;
          commentType = 'reformed';
          haterReplyText =
            REFORMED_PHRASES[Math.floor(Math.random() * REFORMED_PHRASES.length)];
          if (currentChannel) {
            onUpdateChannel({
              ...currentChannel,
              subscribers: currentChannel.subscribers + 1,
            });
          }
        } else {
          if (freshComment.dialogue.length >= 2 && Math.random() < 0.6) {
            leftChannel = true;
            haterReplyText =
              'Всё, с меня хватит, отписываюсь от твоего кал-канала и ухожу!';
            if (currentChannel && currentChannel.subscribers > 0) {
              onUpdateChannel({
                ...currentChannel,
                subscribers: currentChannel.subscribers - 1,
              });
            }
          } else {
            haterReplyText =
              CONTINUOUS_HATER_REPLIES[
                Math.floor(Math.random() * CONTINUOUS_HATER_REPLIES.length)
              ];
          }
        }

        const newDialogue = [
          ...freshComment.dialogue,
          { authorReply: text, haterReply: haterReplyText },
        ];

        const finalComment: CommentItem = {
          ...freshComment,
          dialogue: newDialogue,
          reformed,
          leftChannel,
          type: commentType,
        };

        const finalComments = video.comments.map((c) =>
          c.id === commentId ? finalComment : c
        );
        onUpdateVideo({ ...video, comments: finalComments });
      }, 700);

      updatedComment.dialogue = [
        ...targetComment.dialogue,
        { authorReply: text, haterReply: '...' },
      ];
    } else if (targetComment.type === 'subscriber' || targetComment.type === 'fan') {
      const joyText =
        SUBSCRIBER_JOY_REACTIONS[
          Math.floor(Math.random() * SUBSCRIBER_JOY_REACTIONS.length)
        ];
      updatedComment.reply = text;
      updatedComment.joyReply = joyText;
      subsDelta = Math.floor(Math.random() * 2) + 1;
      if (currentChannel) {
        onUpdateChannel({
          ...currentChannel,
          subscribers: currentChannel.subscribers + subsDelta,
        });
      }
    } else {
      const normalText =
        NORMAL_REACTIONS[Math.floor(Math.random() * NORMAL_REACTIONS.length)];
      updatedComment.reply = text;
      updatedComment.userReaction = normalText;
    }

    const updatedComments = video.comments.map((c) =>
      c.id === commentId ? updatedComment : c
    );
    onUpdateVideo({ ...video, comments: updatedComments });
  };

  // Add new viewer comment with author reaction, high likes, and enthusiastic fan replies
  const handleAddNewComment = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedText = newCommentText.trim();
    if (!trimmedText) return;

    const authorChannel = commentingChannel;
    const authorName = authorChannel ? authorChannel.name : 'Зритель';
    const authorSubs = authorChannel ? authorChannel.subscribers : 0;
    const authorAvatarColor = authorChannel?.avatarColor || '#e11d48';

    const isKiselchikVideo =
      video.channelId === 'chan_kiselchik' ||
      video.channelName.toLowerCase().includes('кисель');

    const lower = trimmedText.toLowerCase();
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
      lower.includes('бездарь') ||
      lower.includes('уебок') ||
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

    const commentType: CommentItem['type'] = isHater ? 'hater' : isFan ? 'subscriber' : 'normal';

    // Generate author reply and excited fan replies ("Аоаоа я твой фанат!", etc.)
    const replies = generateAuthorInstantReply(trimmedText, video.channelName, isKiselchikVideo);
    const initialLikes = isHater
      ? Math.floor(Math.random() * 25) + 3
      : Math.floor(Math.random() * 1800) + 1200;

    const isVip = FAMOUS_BLOGGERS.some(
      (b) => b.name.toLowerCase() === authorName.toLowerCase() || b.id === authorChannel?.id
    );

    const commentId = 'user_c_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
    const newComment: CommentItem = {
      id: commentId,
      author: authorName,
      authorChannelId: authorChannel?.id,
      authorSubs,
      text: trimmedText,
      type: commentType,
      reply: replies[0]?.text || null,
      dialogue: [],
      repliesList: replies,
      leftChannel: false,
      reformed: false,
      userReaction: null,
      joyReply: null,
      likes: initialLikes,
      timestamp: Date.now(),
      avatarColor: authorAvatarColor,
      isHeartedByAuthor: !isHater,
      isPinned: !isHater,
      verified: isVip || authorSubs > 100000,
      isVipBlogger: isVip,
    };

    // Ensure comment is never hidden: reset filter to 'all' and sort to 'newest'
    setCommentFilter('all');
    setCommentSort('newest');

    // Immediately and atomically save comment to video, strictly respecting 50 comments limit
    const currentComments = video.comments || [];
    if (currentComments.length >= 50) {
      setNewCommentText('');
      return;
    }
    const updatedComments = [newComment, ...currentComments].slice(0, 50);
    onUpdateVideo({
      ...video,
      comments: updatedComments,
    });

    setNewCommentText('');
    setExpandedThreads((prev) => ({ ...prev, [commentId]: true }));

    onAddNotification?.({
      title: '❤️ Автор оценил ваш комментарий!',
      message: `Автор (${video.channelName}) поставил сердечко ❤️ на комментарий канала «${authorName}», а фанаты пишут ответы!`,
      type: 'comment',
    });
  };

  const handleToggleCommentLike = (commentId: string) => {
    const updatedComments = video.comments.map((c) => {
      if (c.id === commentId) {
        const isLiked = c.isLikedByViewer;
        return {
          ...c,
          likes: isLiked ? Math.max(0, c.likes - 1) : c.likes + 1,
          isLikedByViewer: !isLiked,
        };
      }
      return c;
    });
    onUpdateVideo({ ...video, comments: updatedComments });
  };

  const handleToggleHeart = (commentId: string) => {
    const updatedComments = video.comments.map((c) => {
      if (c.id === commentId) {
        return { ...c, isHeartedByAuthor: !c.isHeartedByAuthor };
      }
      return c;
    });
    onUpdateVideo({ ...video, comments: updatedComments });
  };

  const filteredComments = (video.comments || []).filter((c) => {
    if (c.isPinned) return true; // Always keep pinned comments visible
    if (commentFilter === 'hater') return c.type === 'hater';
    if (commentFilter === 'fan') return c.type === 'fan' || c.type === 'subscriber' || c.type === 'reformed';
    if (commentFilter === 'normal') return c.type === 'normal';
    return true;
  });

  const sortedComments = [...filteredComments].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    if (commentSort === 'likes') return b.likes - a.likes;
    return b.timestamp - a.timestamp;
  });

  const otherVideos = React.useMemo(() => {
    const seen = new Set<string>();
    return allVideos.filter((v) => {
      if (!v || !v.id || v.id === video.id || seen.has(v.id)) return false;
      seen.add(v.id);
      return true;
    });
  }, [allVideos, video.id]);

  return (
    <div className="mx-auto max-w-[1720px] px-3 md:px-6 py-4">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left Column: Player, Video Info, Actions, Comments */}
        <div className="flex-1 min-w-0">
          {/* Video Player Box */}
          <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-black shadow-2xl border border-[#272727] group">
            {isYouTubeSource(video) ? (
              <iframe
                src={getYouTubeEmbedUrl(video.youtubeId || video.url, true)}
                title={video.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
                className="h-full w-full border-0"
              />
            ) : video.url && !video.fileMissing ? (
              <video
                ref={videoRef}
                src={video.url}
                onClick={togglePlay}
                controls={false}
                playsInline
                className="h-full w-full object-contain cursor-pointer"
              />
            ) : (
              <div className="flex h-full w-full flex-col items-center justify-center p-6 text-center text-[#aaaaaa]">
                <AlertTriangle className="h-12 w-12 text-[#eab308] mb-3" />
                <h4 className="text-lg font-bold text-white">Видеофайл недоступен</h4>
                <p className="mt-1 text-sm max-w-md">
                  Файл был удален из памяти браузера или не был загружен. Вы можете удалить эту карточку или загрузить видео заново.
                </p>
              </div>
            )}

            {/* Big center play icon if paused (local video only) */}
            {!isYouTubeSource(video) && !isPlaying && video.url && !video.fileMissing && (
              <button
                onClick={togglePlay}
                aria-label="Воспроизвести"
                className="absolute inset-0 m-auto flex h-16 w-16 items-center justify-center rounded-full bg-black/60 backdrop-blur-sm text-white hover:scale-110 hover:bg-[#ff0000] transition-all shadow-xl cursor-pointer"
              >
                <Play className="h-8 w-8 fill-white translate-x-1" />
              </button>
            )}

            {/* Custom Bottom Control Bar (local video only) */}
            {!isYouTubeSource(video) && video.url && !video.fileMissing && (
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-3 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col gap-2">
                {/* Seekbar */}
                <input
                  type="range"
                  min={0}
                  max={duration || 100}
                  step={0.1}
                  value={currentTime}
                  onChange={handleSeek}
                  className="w-full h-1.5 accent-[#ff0000] bg-white/30 rounded-lg cursor-pointer transition-all"
                />

                <div className="flex items-center justify-between text-white text-xs">
                  <div className="flex items-center gap-3">
                    <button onClick={togglePlay} className="hover:text-[#ff0000] transition-colors cursor-pointer">
                      {isPlaying ? <Pause className="h-5 w-5 fill-white" /> : <Play className="h-5 w-5 fill-white" />}
                    </button>
                    <button onClick={toggleMute} className="hover:text-[#ff0000] transition-colors cursor-pointer">
                      {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                    </button>
                    <span className="font-mono text-xs text-[#cccccc]">
                      {Math.floor(currentTime / 60)}:{Math.floor(currentTime % 60).toString().padStart(2, '0')} / {Math.floor(duration / 60)}:{Math.floor(duration % 60).toString().padStart(2, '0')}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Speed dropdown */}
                    <div className="relative">
                      <button
                        onClick={() => setShowSpeedMenu(!showSpeedMenu)}
                        className="rounded px-1.5 py-0.5 font-bold hover:bg-white/20 transition-colors cursor-pointer"
                      >
                        {playbackSpeed}x
                      </button>
                      {showSpeedMenu && (
                        <div className="absolute bottom-8 right-0 w-24 rounded-lg bg-[#212121] py-1 shadow-xl border border-[#333333] z-50">
                          {[0.5, 0.75, 1, 1.25, 1.5, 2].map((s) => (
                            <button
                              key={s}
                              onClick={() => handleSpeedChange(s)}
                              className={`block w-full px-3 py-1 text-left text-xs hover:bg-[#333333] cursor-pointer ${
                                playbackSpeed === s ? 'text-[#ff0000] font-bold' : ''
                              }`}
                            >
                              {s}x
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    <button onClick={toggleFullscreen} className="hover:text-[#ff0000] transition-colors cursor-pointer">
                      <Maximize className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Title and Category */}
          <div className="mt-3">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="rounded bg-[#ff0000]/20 border border-[#ff0000]/40 px-2 py-0.5 text-[11px] font-extrabold text-[#ff4444] uppercase tracking-wider">
                {video.category || 'РАЗБОР'}
              </span>
              {isYouTubeSource(video) && (
                <a
                  href={getYouTubeDirectUrl(video.youtubeId || video.url)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded bg-[#ff0000] hover:bg-[#cc0000] px-2 py-0.5 text-[11px] font-black text-white shadow flex items-center gap-1 transition-colors"
                  title="Смотреть оригинал на YouTube"
                >
                  <span>▶ YouTube</span>
                  <ExternalLink className="h-3 w-3 ml-0.5" />
                </a>
              )}
              {video.earnings > 0 && (
                <span className="rounded bg-[#1e4620] border border-[#2a6d2f] px-2 py-0.5 text-[11px] font-bold text-[#4ade80]">
                  💰 Доход: {formatMoney(video.earnings)}
                </span>
              )}
            </div>

            <h1 className="text-xl md:text-2xl font-bold text-[#f1f1f1] leading-tight">
              {video.title}
            </h1>
          </div>

          {/* Channel Row & Actions */}
          <div className="mt-3 flex flex-wrap items-center justify-between gap-4 border-b border-[#272727] pb-4">
            {/* Channel Info */}
            <div
              className={`flex items-center gap-3 ${
                onNavigateToChannel ? 'cursor-pointer group' : ''
              }`}
              onClick={() => onNavigateToChannel && video.channelId && onNavigateToChannel(video.channelId)}
              title={`Перейти на канал ${video.channelName}`}
            >
              <div
                className="flex h-10 w-10 md:h-11 md:w-11 items-center justify-center rounded-full text-base font-bold text-white shadow group-hover:ring-2 group-hover:ring-[#ff0000] transition-all overflow-hidden"
                style={{ backgroundColor: videoCreatorChannel?.avatarColor || '#6200ee' }}
              >
                {effectiveAvatar && (effectiveAvatar.startsWith('http') || effectiveAvatar.startsWith('data:')) ? (
                  <img
                    src={effectiveAvatar}
                    alt={video.channelName}
                    className="h-full w-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  video.channelName ? video.channelName[0].toUpperCase() : 'U'
                )}
              </div>

              <div>
                <div className="flex items-center gap-1 font-bold text-[#f1f1f1] group-hover:text-white transition-colors">
                  <span className="group-hover:underline">{video.channelName}</span>
                  {isVideoCreatorVerified && (
                    <CheckCircle2 className="h-3.5 w-3.5 text-[#3ea6ff] shrink-0" title="Официальный верифицированный канал ✓" />
                  )}
                </div>
                <div className="text-xs text-[#aaaaaa]">
                  {formatCount(effectiveSubs)} подписчиков
                </div>
              </div>

              <button
                id="btn-subscribe"
                onClick={(e) => {
                  e.stopPropagation();
                  handleSubscribeToggle();
                }}
                className={`ml-3 rounded-full px-4 py-2 text-xs md:text-sm font-semibold transition-all shadow cursor-pointer ${
                  isSubscribedToChannel
                    ? 'bg-[#272727] text-[#aaaaaa] hover:bg-[#383838]'
                    : 'bg-[#f1f1f1] text-[#0f0f0f] hover:bg-white active:scale-95'
                }`}
              >
                {isSubscribedToChannel ? 'Вы подписаны ✓' : 'Подписаться'}
              </button>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 flex-wrap">
              {/* Like / Dislike Group */}
              <div className="flex items-center rounded-full bg-[#272727] p-0.5 border border-[#333333]">
                <button
                  id="btn-like-video"
                  onClick={handleToggleLike}
                  className={`flex items-center gap-1.5 rounded-l-full px-3 py-1.5 text-xs md:text-sm font-semibold hover:bg-[#383838] transition-colors cursor-pointer ${
                    video.isLikedByViewer ? 'text-[#3ea6ff]' : 'text-[#f1f1f1]'
                  }`}
                >
                  <ThumbsUp className={`h-4 w-4 ${video.isLikedByViewer ? 'fill-[#3ea6ff]' : ''}`} />
                  <span>{formatCount(video.likes)}</span>
                </button>
                <div className="h-4 w-[1px] bg-[#444444]" />
                <button
                  id="btn-dislike-video"
                  onClick={handleToggleDislike}
                  className={`rounded-r-full px-3 py-1.5 text-xs md:text-sm font-semibold hover:bg-[#383838] transition-colors cursor-pointer ${
                    video.isDislikedByViewer ? 'text-[#3ea6ff]' : 'text-[#f1f1f1]'
                  }`}
                >
                  <ThumbsDown className={`h-4 w-4 ${video.isDislikedByViewer ? 'fill-[#3ea6ff]' : ''}`} />
                </button>
              </div>

              {/* Share */}
              <button
                id="btn-share-video"
                onClick={handleShare}
                className="flex items-center gap-1.5 rounded-full bg-[#272727] px-3.5 py-1.5 text-xs md:text-sm font-semibold text-[#f1f1f1] hover:bg-[#383838] transition-colors cursor-pointer"
              >
                <Share2 className="h-4 w-4" />
                <span>Поделиться</span>
              </button>

              {/* Boost Button */}
              <button
                id="btn-boost-watch"
                onClick={() => onOpenBoost(video)}
                className="flex items-center gap-1.5 rounded-full bg-gradient-to-r from-[#d97706]/30 to-[#b45309]/30 border border-[#f59e0b]/50 px-3.5 py-1.5 text-xs md:text-sm font-bold text-[#fbbf24] hover:bg-[#f59e0b]/40 transition-all active:scale-95 cursor-pointer"
              >
                <Rocket className="h-4 w-4" />
                <span>Накрутка</span>
              </button>

              {/* Owner Delete Button */}
              {isOwner && (
                <button
                  type="button"
                  onClick={() => setShowDeleteVideoConfirm(true)}
                  className="rounded-full bg-[#3b1212] p-2 text-[#ef4444] hover:bg-[#521818] transition-colors cursor-pointer"
                  title="Удалить видео"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          {/* Share Toast */}
          {shareToast && (
            <div className="mt-2 rounded-xl bg-[#1e4620] border border-[#2a6d2f] p-2.5 text-xs text-[#4ade80] font-semibold text-center animate-fade-in">
              ✓ Ссылка скопирована в буфер обмена!
            </div>
          )}

          {/* Description Box */}
          <div className="mt-4 rounded-2xl bg-[#212121] p-3 md:p-4 text-sm text-[#f1f1f1] border border-[#2f2f2f]">
            <div className="flex items-center justify-between gap-3 font-semibold text-xs text-[#cccccc]">
              <div className="flex items-center gap-3">
                <span>{video.views.toLocaleString('ru-RU')} просмотров</span>
                <span>•</span>
                <span>{formatTimeAgo(video.uploadedAt)}</span>
                {video.category && (
                  <span className="text-[#3ea6ff]">#{video.category.replace(/\s+/g, '_')}</span>
                )}
              </div>

              {isOwner && !isEditingDesc && (
                <button
                  type="button"
                  onClick={() => setIsEditingDesc(true)}
                  className="flex items-center gap-1 text-[11px] text-[#3ea6ff] hover:underline font-bold cursor-pointer"
                >
                  <Edit3 className="h-3 w-3" />
                  <span>Редактировать описание</span>
                </button>
              )}
            </div>

            {isEditingDesc ? (
              <div className="mt-3 space-y-2.5">
                <textarea
                  value={editDescText}
                  onChange={(e) => setEditDescText(e.target.value)}
                  rows={3}
                  className="w-full rounded-xl border border-[#3f3f3f] bg-[#171717] p-3 text-xs md:text-sm text-white outline-none focus:border-[#3ea6ff]"
                  placeholder="Описание видео... Добавьте #советыначинающимвмонтаже #пакмонтажа"
                />

                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[11px] text-[#888888]">Вставить хэштег:</span>
                    <button
                      type="button"
                      onClick={() => {
                        if (!editDescText.includes('#советыначинающимвмонтаже')) {
                          setEditDescText((prev) => (prev.trim() ? prev.trim() + ' ' : '') + '#советыначинающимвмонтаже');
                        }
                      }}
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                        editDescText.includes('#советыначинающимвмонтаже')
                          ? 'bg-blue-500/20 text-blue-300 border-blue-500/50'
                          : 'bg-[#282828] hover:bg-[#333333] text-[#cccccc] border-[#3a3a3a]'
                      }`}
                    >
                      <Hash className="h-3 w-3 text-[#3ea6ff]" />
                      <span>#советыначинающимвмонтаже</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        if (!editDescText.includes('#пакмонтажа')) {
                          setEditDescText((prev) => (prev.trim() ? prev.trim() + ' ' : '') + '#пакмонтажа');
                        }
                      }}
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                        editDescText.includes('#пакмонтажа')
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                          : 'bg-[#282828] hover:bg-[#333333] text-[#cccccc] border-[#3a3a3a]'
                      }`}
                    >
                      <Hash className="h-3 w-3 text-[#f59e0b]" />
                      <span>#пакмонтажа</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setEditDescText(video.desc || '');
                        setIsEditingDesc(false);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-[#282828] hover:bg-[#333333] text-xs font-semibold text-[#aaaaaa] cursor-pointer"
                    >
                      Отмена
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const updatedVid = { ...video, desc: editDescText.trim() };
                        onUpdateVideo(updatedVid);
                        if (currentChannel) {
                          const updatedVideos = (currentChannel.videos || []).map((v) =>
                            v.id === video.id ? updatedVid : v
                          );
                          onUpdateChannel({ ...currentChannel, videos: updatedVideos });
                        }
                        setIsEditingDesc(false);
                      }}
                      className="inline-flex items-center gap-1 px-4 py-1.5 rounded-xl bg-[#3ea6ff] hover:bg-[#3894e6] text-black text-xs font-bold transition-all cursor-pointer"
                    >
                      <Check className="h-3.5 w-3.5" />
                      <span>Сохранить</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <div className={`mt-2 text-xs md:text-sm text-[#e0e0e0] leading-relaxed whitespace-pre-wrap ${descExpanded ? '' : 'line-clamp-3'}`}>
                  {video.desc ? (
                    video.desc.split(/(#[a-zA-Zа-яА-Я0-9_?!]+)/g).map((part, i) =>
                      part.startsWith('#') ? (
                        <span key={i} className="font-bold text-[#3ea6ff] hover:underline cursor-pointer mr-1">
                          {part}
                        </span>
                      ) : (
                        part
                      )
                    )
                  ) : (
                    'Описание видео отсутствует. Нажмите кнопку «Ещё», чтобы увидеть детали.'
                  )}

                  <div className="mt-3 pt-3 border-t border-[#333333] text-xs text-[#aaaaaa] space-y-1">
                    <div>📁 Имя файла: {video.fileName || 'Встроенное демонстрационное видео'}</div>
                    <div>📊 Статистика: {video.likes.toLocaleString()} лайков • {video.comments?.length || 0} комментариев</div>
                    {video.earnings > 0 && (
                      <div className="text-[#4ade80] font-bold">
                        💵 Монетизация: принесло каналу {formatMoney(video.earnings)}
                      </div>
                    )}
                  </div>
                </div>

                {/* Quick Add Hashtag buttons for Owner if not present */}
                {isOwner && (!video.desc?.includes('#советыначинающимвмонтаже') || !video.desc?.includes('#пакмонтажа')) && (
                  <div className="mt-3 pt-2.5 border-t border-[#2d2d2d] flex items-center gap-2 flex-wrap">
                    <span className="text-[11px] text-[#888888]">Быстро добавить в описание:</span>
                    {!video.desc?.includes('#советыначинающимвмонтаже') && (
                      <button
                        type="button"
                        onClick={() => {
                          const newDesc = (video.desc ? video.desc.trim() + ' ' : '') + '#советыначинающимвмонтаже';
                          const updatedVid = { ...video, desc: newDesc };
                          onUpdateVideo(updatedVid);
                          if (currentChannel) {
                            const updatedVideos = (currentChannel.videos || []).map((v) =>
                              v.id === video.id ? updatedVid : v
                            );
                            onUpdateChannel({ ...currentChannel, videos: updatedVideos });
                          }
                        }}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border border-blue-500/40 transition-all cursor-pointer"
                      >
                        <Hash className="h-3 w-3" />
                        <span>+ #советыначинающимвмонтаже</span>
                      </button>
                    )}

                    {!video.desc?.includes('#пакмонтажа') && (
                      <button
                        type="button"
                        onClick={() => {
                          const newDesc = (video.desc ? video.desc.trim() + ' ' : '') + '#пакмонтажа';
                          const updatedVid = { ...video, desc: newDesc };
                          onUpdateVideo(updatedVid);
                          if (currentChannel) {
                            const updatedVideos = (currentChannel.videos || []).map((v) =>
                              v.id === video.id ? updatedVid : v
                            );
                            onUpdateChannel({ ...currentChannel, videos: updatedVideos });
                          }
                        }}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 transition-all cursor-pointer"
                      >
                        <Hash className="h-3 w-3" />
                        <span>+ #пакмонтажа</span>
                      </button>
                    )}
                  </div>
                )}

                <button
                  onClick={() => setDescExpanded(!descExpanded)}
                  className="mt-2 font-bold text-xs text-[#aaaaaa] hover:text-white cursor-pointer"
                >
                  {descExpanded ? 'Свернуть' : 'Ещё...'}
                </button>
              </>
            )}
          </div>

          {/* Comments Section */}
          <div className="mt-6">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-3">
                <h3 className="text-lg md:text-xl font-bold text-white flex items-center gap-2">
                  <span>{video.comments?.length || 0} / 50 комментариев</span>
                  {(video.comments?.length || 0) >= 50 && (
                    <span className="rounded-full bg-[#fbbf24]/10 border border-[#fbbf24]/40 px-2 py-0.5 text-xs text-[#fbbf24] font-semibold">
                      🔒 Лимит 50 достигнут
                    </span>
                  )}
                </h3>

                {/* Sort selector */}
                <select
                  value={commentSort}
                  onChange={(e) => setCommentSort(e.target.value as any)}
                  className="rounded-lg bg-[#212121] border border-[#333333] px-2.5 py-1 text-xs text-[#cccccc] outline-none cursor-pointer"
                >
                  <option value="newest">Сначала новые</option>
                  <option value="likes">Сначала популярные</option>
                </select>
              </div>

              {/* Filter pills: All, Haters, Fans, Normal */}
              <div className="flex items-center gap-1 text-xs">
                {[
                  { id: 'all', label: 'Все' },
                  { id: 'hater', label: 'Хейтеры 🔴' },
                  { id: 'fan', label: 'Фанаты 🟢' },
                  { id: 'normal', label: 'Обычные' },
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setCommentFilter(f.id as any)}
                    className={`rounded-full px-2.5 py-1 font-semibold transition-colors cursor-pointer ${
                      commentFilter === f.id
                        ? 'bg-[#f1f1f1] text-[#0f0f0f]'
                        : 'bg-[#222222] text-[#aaaaaa] hover:text-white'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Channel Selector for commenting */}
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3 bg-[#1e1e1e] p-2.5 rounded-xl border border-[#2e2e2e]">
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#aaaaaa]">Писать от имени:</span>
                <select
                  value={selectedCommentingChannelId}
                  onChange={(e) => setSelectedCommentingChannelId(e.target.value)}
                  className="bg-[#2a2a2a] text-white border border-[#444] rounded-lg px-2.5 py-1 text-xs font-semibold outline-none cursor-pointer hover:border-[#666]"
                >
                  {channels.map((ch) => (
                    <option key={ch.id} value={ch.id}>
                      {ch.name} ({ch.subscribers.toLocaleString('ru-RU')} подп.) {ch.isUserCreated !== false ? '• Мой' : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div className="text-xs text-[#fbbf24] font-medium flex items-center gap-1">
                <Star className="h-3.5 w-3.5 fill-[#fbbf24]" />
                Автор оценит коммент сердечком ❤️, а фанаты напишут ответы
              </div>
            </div>

            {/* Add Comment Input or Limit Notice */}
            {(video.comments?.length || 0) >= 50 ? (
              <div className="mb-6 rounded-xl border border-[#383838] bg-[#1a1a1a] p-3 text-xs text-[#aaaaaa] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-base">🔒</span>
                  <span>
                    Достигнут лимит <strong className="text-white">50 комментариев</strong>. Новые комментарии больше не принимаются, существующие навсегда сохранены.
                  </span>
                </div>
                <span className="font-bold text-[#fbbf24] shrink-0 ml-2">50 / 50</span>
              </div>
            ) : (
              <form onSubmit={handleAddNewComment} className="flex gap-3 mb-6">
                <div
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white shadow overflow-hidden"
                  style={{ backgroundColor: commentingChannel?.avatarColor || '#e11d48' }}
                >
                  {commentingChannel?.avatarUrl ? (
                    <img src={commentingChannel.avatarUrl} alt={commentingChannel.name} className="h-full w-full object-cover" />
                  ) : (
                    commentingChannel?.name ? commentingChannel.name[0].toUpperCase() : 'Я'
                  )}
                </div>
                <div className="flex-1">
                  <input
                    type="text"
                    value={newCommentText}
                    onChange={(e) => setNewCommentText(e.target.value)}
                    placeholder={`Оставьте комментарий от лица канала «${commentingChannel?.name || 'Зритель'}» (осталось ${50 - (video.comments?.length || 0)})...`}
                    className="w-full border-b border-[#444444] bg-transparent pb-1 text-sm text-[#f1f1f1] placeholder-[#777777] outline-none focus:border-[#3ea6ff]"
                  />
                  {newCommentText && (
                    <div className="mt-2 flex items-center justify-between">
                      <div className="text-[11px] text-[#fbbf24] font-semibold flex items-center gap-1">
                        <Star className="h-3 w-3 fill-[#fbbf24]" />
                        Автор ролика поставит ❤️, коммент наберет тысячи лайков и ответы фанатов
                      </div>
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setNewCommentText('')}
                          className="rounded-full px-3 py-1.5 text-xs font-semibold text-[#aaaaaa] hover:bg-[#272727] cursor-pointer"
                        >
                          Отмена
                        </button>
                        <button
                          type="submit"
                          className="rounded-full bg-[#3ea6ff] px-4 py-1.5 text-xs font-bold text-[#0f0f0f] hover:bg-[#65b8ff] cursor-pointer"
                        >
                          Оставить комментарий
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </form>
            )}

            {/* Comments List */}
            <div className="space-y-4">
              {sortedComments.length === 0 ? (
                <div className="py-8 text-center text-xs text-[#888888]">
                  Комментариев по выбранному фильтру нет.
                </div>
              ) : (
                sortedComments.map((comment) => {
                  const isHater = comment.type === 'hater';
                  const isFan = comment.type === 'fan' || comment.type === 'subscriber' || comment.type === 'reformed';
                  const isReformed = comment.type === 'reformed' || comment.reformed;

                  return (
                    <div
                      key={comment.id}
                      className={`flex gap-3 rounded-xl p-3 transition-colors ${
                        isHater ? 'bg-[#261313]/60 border border-[#441a1a]' : 'hover:bg-[#1a1a1a]'
                      }`}
                    >
                      {/* Avatar */}
                      <div
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white shadow ${
                          isHater
                            ? 'bg-[#cc0000]'
                            : isReformed
                            ? 'bg-[#00796b]'
                            : isFan
                            ? 'bg-[#15803d]'
                            : 'bg-[#6200ee]'
                        }`}
                        style={comment.avatarColor ? { backgroundColor: comment.avatarColor } : undefined}
                      >
                        {comment.author ? comment.author[0].toUpperCase() : 'U'}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={`font-semibold text-xs flex items-center gap-1 ${
                              isHater ? 'text-[#ef4444]' : isReformed ? 'text-[#34d399]' : 'text-[#f1f1f1]'
                            }`}
                          >
                            {comment.author}
                            {comment.verified && (
                              <CheckCircle2 className="h-3 w-3 text-[#3ea6ff] shrink-0" title="Подтверждённый блогер" />
                            )}
                          </span>

                          {comment.isVipBlogger && (
                            <span className="rounded-full bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border border-amber-500/40 px-2 py-0.2 text-[10px] font-bold text-amber-300 flex items-center gap-1 shadow-sm">
                              <Star className="h-2.5 w-2.5 fill-amber-400 text-amber-400" />
                              Известный блогер
                            </span>
                          )}

                          {comment.authorSubs !== undefined && comment.authorSubs > 0 && (
                            <span className="text-[10px] text-[#888888]">
                              • {comment.authorSubs.toLocaleString('ru-RU')} подп.
                            </span>
                          )}

                          <span className="text-[10px] text-[#888888]">
                            {formatTimeAgo(comment.timestamp)}
                          </span>

                          {/* Type Badge */}
                          {isHater && (
                            <span className="rounded bg-[#ef4444]/20 px-1.5 py-0.2 text-[10px] font-bold text-[#ef4444]">
                              Хейтер 🔴
                            </span>
                          )}
                          {isReformed && (
                            <span className="rounded bg-[#34d399]/20 px-1.5 py-0.2 text-[10px] font-bold text-[#34d399]">
                              Бывший хейтер ✨
                            </span>
                          )}
                          {!isHater && !isReformed && isFan && (
                            <span className="rounded bg-[#22c55e]/20 px-1.5 py-0.2 text-[10px] font-bold text-[#22c55e]">
                              Фанат 🟢
                            </span>
                          )}

                          {/* Pinned Badge */}
                          {comment.isPinned && (
                            <span className="rounded bg-[#38bdf8]/20 border border-[#38bdf8]/40 px-2 py-0.5 text-[10px] font-bold text-[#38bdf8] flex items-center gap-1">
                              <Pin className="h-3 w-3" />
                              Топ-комментарий блогера
                            </span>
                          )}

                          {/* Author Heart Indicator */}
                          {comment.isHeartedByAuthor && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-[#ef4444]/15 border border-[#ef4444]/30 px-2 py-0.5 text-[10px] font-bold text-[#ef4444]">
                              <Heart className="h-3 w-3 fill-[#ef4444]" />
                              Автор оценил ❤️
                            </span>
                          )}
                        </div>

                        <div className="mt-1 text-xs md:text-sm text-[#f1f1f1] leading-relaxed">
                          {comment.text}
                        </div>

                        {/* Comment Action Icons */}
                        <div className="mt-2 flex items-center gap-3 text-xs text-[#aaaaaa]">
                          <button
                            onClick={() => handleToggleCommentLike(comment.id)}
                            className={`flex items-center gap-1 hover:text-white cursor-pointer ${
                              comment.isLikedByViewer ? 'text-[#3ea6ff]' : ''
                            }`}
                          >
                            <ThumbsUp className="h-3.5 w-3.5" />
                            <span>{comment.likes || 0}</span>
                          </button>

                          <button className="hover:text-white cursor-pointer">
                            <ThumbsDown className="h-3.5 w-3.5" />
                          </button>

                          {isOwner && (
                            <button
                              onClick={() => handleToggleHeart(comment.id)}
                              className={`flex items-center gap-1 hover:text-[#ef4444] cursor-pointer ${
                                comment.isHeartedByAuthor ? 'text-[#ef4444]' : ''
                              }`}
                              title="Сердечко автора"
                            >
                              <Heart className={`h-3.5 w-3.5 ${comment.isHeartedByAuthor ? 'fill-[#ef4444]' : ''}`} />
                            </button>
                          )}
                        </div>

                        {/* Rich Replies List (Author response, crowd viewer reactions, promoted channel reply) */}
                        {comment.repliesList && comment.repliesList.length > 0 && (
                          <div className="mt-3 space-y-2 border-l-2 border-[#3ea6ff]/60 pl-3">
                            <button
                              type="button"
                              onClick={() =>
                                setExpandedThreads((prev) => ({
                                  ...prev,
                                  [comment.id]: prev[comment.id] === false ? true : false,
                                }))
                              }
                              className="flex items-center gap-1 text-xs font-bold text-[#3ea6ff] hover:text-[#70baff] cursor-pointer"
                            >
                              {expandedThreads[comment.id] !== false ? (
                                <>
                                  <ChevronUp className="h-3.5 w-3.5" />
                                  <span>Скрыть ответы ({comment.repliesList.length})</span>
                                </>
                              ) : (
                                <>
                                  <ChevronDown className="h-3.5 w-3.5" />
                                  <span>Показать ответы ({comment.repliesList.length})</span>
                                </>
                              )}
                            </button>

                            {expandedThreads[comment.id] !== false && (
                              <div className="space-y-2 pt-1 animate-fade-in">
                                {comment.repliesList.map((rep) => (
                                  <div
                                    key={rep.id}
                                    className={`rounded-xl p-2.5 text-xs ${
                                      rep.isAuthor
                                        ? 'bg-[#1e293b]/90 border border-[#38bdf8]/40'
                                        : rep.isPromotedChannel
                                        ? 'bg-[#064e3b]/80 border border-[#10b981]/40'
                                        : 'bg-[#222222] border border-[#333]'
                                    }`}
                                  >
                                    <div className="flex items-center justify-between gap-2 mb-1">
                                      <div className="flex items-center gap-1.5 font-bold">
                                        <span
                                          className={`flex items-center gap-1 ${
                                            rep.isAuthor
                                              ? 'text-[#38bdf8]'
                                              : rep.isPromotedChannel
                                              ? 'text-[#34d399]'
                                              : 'text-[#f1f1f1]'
                                          }`}
                                        >
                                          {rep.author}
                                          {rep.verified && !rep.isAuthor && (
                                            <CheckCircle2 className="h-2.5 w-2.5 text-[#3ea6ff] shrink-0" />
                                          )}
                                        </span>

                                        {rep.isAuthor && (
                                          <span className="rounded bg-[#38bdf8]/20 px-1.5 py-0.2 text-[10px] font-bold text-[#38bdf8] flex items-center gap-0.5">
                                            <CheckCircle2 className="h-2.5 w-2.5" /> Автор
                                          </span>
                                        )}

                                        {rep.isPromotedChannel && (
                                          <span className="rounded bg-[#10b981]/20 px-1.5 py-0.2 text-[10px] font-bold text-[#34d399]">
                                            Рекомендованный автор 🌟
                                          </span>
                                        )}

                                        <span className="text-[10px] text-[#888] font-normal">
                                          {formatTimeAgo(rep.timestamp)}
                                        </span>
                                      </div>

                                      {rep.likes > 0 && (
                                        <div className="flex items-center gap-1 text-[11px] text-[#aaa]">
                                          <ThumbsUp className="h-3 w-3 text-[#3ea6ff]" />
                                          <span>{rep.likes}</span>
                                        </div>
                                      )}
                                    </div>

                                    <div className="text-[#f1f1f1] leading-relaxed">
                                      {rep.text}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}

                        {/* Dialogue Thread (Hater replies & author replies) */}
                        {comment.dialogue && comment.dialogue.length > 0 && (
                          <div className="mt-3 space-y-2 border-l-2 border-[#cc0000] pl-3">
                            {comment.dialogue.map((step, idx) => (
                              <div key={idx} className="space-y-1.5 text-xs">
                                <div className="rounded-lg bg-[#2a2a2a] p-2 text-[#f1f1f1]">
                                  <strong className="text-[#3ea6ff]">{video.channelName} (Автор):</strong>{' '}
                                  {step.authorReply}
                                </div>
                                <div className="rounded-lg bg-[#3a1a1a] p-2 text-[#fca5a5]">
                                  <strong className="text-[#ef4444]">{comment.author} (Хейтер):</strong>{' '}
                                  {step.haterReply}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Status outcomes for haters */}
                        {comment.leftChannel && (
                          <div className="mt-2 text-xs italic text-[#ef4444]">
                            👤 Хейтер обиделся и отписался / ушел с канала.
                          </div>
                        )}

                        {comment.reformed && (
                          <div className="mt-2 text-xs italic font-semibold text-[#34d399]">
                            ✨ Хейтер одумался и стал фанатом (+1 подписчик)!
                          </div>
                        )}

                        {/* Normal or Fan Replies */}
                        {comment.reply && (
                          <div className="mt-2 space-y-1.5 border-l-2 border-[#3ea6ff] pl-3 text-xs">
                            <div className="rounded-lg bg-[#2a2a2a] p-2 text-[#f1f1f1]">
                              <strong className="text-[#3ea6ff]">{video.channelName}:</strong> {comment.reply}
                            </div>
                            {comment.joyReply && (
                              <div className="rounded-lg bg-[#1a3a24] p-2 text-[#86efac]">
                                <strong className="text-[#22c55e]">{comment.author}:</strong> {comment.joyReply}
                              </div>
                            )}
                            {comment.userReaction && (
                              <div className="rounded-lg bg-[#1a2d3d] p-2 text-[#93c5fd]">
                                <strong className="text-[#3ea6ff]">{comment.author}:</strong> {comment.userReaction}
                              </div>
                            )}
                          </div>
                        )}

                        {/* Interactive Author Reply Box */}
                        {!comment.leftChannel && !comment.reformed && (!comment.reply || isHater) && (
                          <div className="mt-3 flex gap-2">
                            <input
                              type="text"
                              value={replyDrafts[comment.id] || ''}
                              onChange={(e) => handleReplyChange(comment.id, e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleSendReply(comment.id);
                              }}
                              placeholder={
                                isHater
                                  ? 'Ответить хейтеру (есть 50% шанс превратить его в фаната!)...'
                                  : isFan
                                  ? 'Поблагодарить фаната (+подписчики)...'
                                  : 'Написать ответ от лица автора...'
                              }
                              className="flex-1 rounded-lg border border-[#3f3f3f] bg-[#1a1a1a] px-3 py-1.5 text-xs text-[#f1f1f1] placeholder-[#777777] outline-none focus:border-[#3ea6ff]"
                            />
                            <button
                              onClick={() => handleSendReply(comment.id)}
                              className="flex items-center gap-1 rounded-lg bg-[#065fd4] px-3 py-1.5 text-xs font-bold text-white hover:bg-[#0056b3] transition-colors cursor-pointer"
                            >
                              <Send className="h-3 w-3" />
                              <span>Ответить</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Up Next / Related Videos */}
        <div className="w-full lg:w-[400px] shrink-0">
          <h3 className="text-base font-bold text-white mb-3">Следующие видео</h3>
          <div className="flex flex-col gap-3">
            {otherVideos.map((v) => (
              <div
                key={v.id}
                onClick={() => onSelectVideo(v)}
                className="group flex gap-3 cursor-pointer rounded-xl p-1.5 hover:bg-[#1f1f1f] transition-colors"
              >
                <div className="relative aspect-video w-40 shrink-0 overflow-hidden rounded-lg bg-[#181818] border border-[#272727]">
                  {isYouTubeSource(v) ? (
                    <img
                      src={v.thumbnailUrl}
                      alt={v.title}
                      className="h-full w-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : v.url && !v.fileMissing ? (
                    <video
                      src={v.url}
                      muted
                      preload="metadata"
                      className="h-full w-full object-cover"
                    />
                  ) : v.thumbnailUrl ? (
                    <img
                      src={v.thumbnailUrl}
                      alt={v.title}
                      className="h-full w-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-xs text-[#777]">
                      Видео
                    </div>
                  )}

                  <div className="absolute bottom-1 right-1 rounded bg-black/80 px-1 py-0.2 text-[10px] font-bold text-white">
                    {v.duration || '08:30'}
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <span className="rounded bg-black/80 px-1.5 py-0.5 text-[9px] font-extrabold text-white uppercase">
                    {v.category || 'РАЗБОР'}
                  </span>
                  <h4 className="line-clamp-2 mt-1 text-xs font-semibold text-[#f1f1f1] group-hover:text-[#3ea6ff] leading-snug">
                    {v.title}
                  </h4>
                  <div className="mt-1 text-[11px] text-[#aaaaaa] truncate">{v.channelName}</div>
                  <div className="text-[10px] text-[#888888]">
                    {formatCount(v.views)} просмотров • {formatTimeAgo(v.uploadedAt)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <ConfirmModal
        isOpen={showDeleteVideoConfirm}
        title="Удалить это видео?"
        message={`Вы уверены, что хотите безвозвратно удалить видео «${video.title}»?`}
        confirmText="Да, удалить"
        cancelText="Отмена"
        onConfirm={() => {
          onDeleteVideo(video.id);
          setShowDeleteVideoConfirm(false);
        }}
        onClose={() => setShowDeleteVideoConfirm(false)}
      />
    </div>
  );
};

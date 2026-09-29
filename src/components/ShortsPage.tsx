import React, { useState, useRef, useEffect } from 'react';
import {
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  Volume2,
  VolumeX,
  Play,
  ChevronUp,
  ChevronDown,
  X,
  Send
} from 'lucide-react';
import { Channel, CommentItem, VideoItem } from '../types';
import { formatCount, formatTimeAgo } from '../services/simulationEngine';
import { isYouTubeSource, getYouTubeEmbedUrl } from '../services/youtubeHelper';

interface ShortsPageProps {
  videos: VideoItem[];
  currentChannel: Channel | null;
  onUpdateVideo: (video: VideoItem) => void;
  onUpdateChannel: (channel: Channel) => void;
}

export const ShortsPage: React.FC<ShortsPageProps> = ({
  videos,
  currentChannel,
  onUpdateVideo,
}) => {
  const shortsList = videos.filter((v) => v.isShort || v.duration === '00:15' || v.duration === '00:30');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [newCommentText, setNewCommentText] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const currentShort = shortsList[currentIndex] || videos[0];

  useEffect(() => {
    if (videoRef.current && currentShort?.url && !isYouTubeSource(currentShort)) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {
        setIsPlaying(false);
      });
      setIsPlaying(true);
    }
  }, [currentIndex, currentShort?.url]);

  const handleNext = () => {
    if (currentIndex < shortsList.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setCurrentIndex(0);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    } else {
      setCurrentIndex(shortsList.length - 1);
    }
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play().catch(() => {});
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !videoRef.current.muted;
    setIsMuted(videoRef.current.muted);
  };

  const handleLike = () => {
    if (!currentShort) return;
    const isLiked = currentShort.isLikedByViewer;
    onUpdateVideo({
      ...currentShort,
      likes: isLiked ? Math.max(0, currentShort.likes - 1) : currentShort.likes + 1,
      isLikedByViewer: !isLiked,
      isDislikedByViewer: false,
    });
  };

  const handleDislike = () => {
    if (!currentShort) return;
    const isDisliked = currentShort.isDislikedByViewer;
    onUpdateVideo({
      ...currentShort,
      dislikes: (currentShort.dislikes || 0) + (isDisliked ? -1 : 1),
      isDislikedByViewer: !isDisliked,
      isLikedByViewer: false,
    });
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    const text = newCommentText.trim();
    if (!text || !currentShort) return;
    if ((currentShort.comments?.length || 0) >= 50) {
      setNewCommentText('');
      return;
    }

    const newComment: CommentItem = {
      id: 'short_c_' + Date.now(),
      author: currentChannel?.name || 'Зритель',
      text,
      type: 'subscriber',
      reply: null,
      dialogue: [],
      leftChannel: false,
      reformed: false,
      userReaction: null,
      joyReply: null,
      likes: 0,
      timestamp: Date.now(),
      avatarColor: currentChannel?.avatarColor || '#3b82f6',
    };

    const updatedComments = [newComment, ...(currentShort.comments || [])].slice(0, 50);
    onUpdateVideo({
      ...currentShort,
      comments: updatedComments,
    });
    setNewCommentText('');
  };

  if (!currentShort) {
    return (
      <div className="flex h-[70vh] flex-col items-center justify-center text-center text-[#aaaaaa]">
        <h3 className="text-xl font-bold text-white">В ленте Shorts пока нет видео</h3>
        <p className="mt-2 text-sm">Загрузите короткое вертикальное видео через кнопку «Создать»!</p>
      </div>
    );
  }

  return (
    <div className="relative flex h-[calc(100vh-56px)] w-full items-center justify-center overflow-hidden py-2 select-none">
      {/* Short Container */}
      <div className="relative flex h-full max-h-[840px] aspect-[9/16] items-center justify-center rounded-2xl bg-black shadow-2xl border border-[#272727] overflow-hidden">
        {isYouTubeSource(currentShort) ? (
          <iframe
            src={getYouTubeEmbedUrl(currentShort.youtubeId || currentShort.url, true, true)}
            title={currentShort.title}
            className="h-full w-full border-0 pointer-events-auto"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          />
        ) : currentShort.url && !currentShort.fileMissing ? (
          <video
            ref={videoRef}
            src={currentShort.url}
            onClick={togglePlay}
            loop
            muted={isMuted}
            playsInline
            className="h-full w-full object-cover cursor-pointer"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-white">
            ⚠️ Видеофайл не найден
          </div>
        )}

        {/* Play/Pause Overlay indicator (local video only) */}
        {!isYouTubeSource(currentShort) && !isPlaying && (
          <div
            onClick={togglePlay}
            className="absolute inset-0 m-auto flex h-16 w-16 items-center justify-center rounded-full bg-black/60 backdrop-blur-sm text-white cursor-pointer"
          >
            <Play className="h-8 w-8 fill-white translate-x-1" />
          </div>
        )}

        {/* Top Floating Controls */}
        <div className="absolute top-4 inset-x-4 flex items-center justify-between z-20">
          <div className="rounded-full bg-black/50 backdrop-blur-md px-3 py-1 text-xs font-bold text-white uppercase tracking-wider border border-white/20">
            ⚡ SHORTS
          </div>
          {!isYouTubeSource(currentShort) && (
            <button
              onClick={toggleMute}
              className="rounded-full bg-black/50 backdrop-blur-md p-2 text-white hover:bg-black/80 transition-colors cursor-pointer"
            >
              {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
            </button>
          )}
        </div>

        {/* Bottom Details Overlay */}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-4 text-white z-20 flex flex-col gap-2 pointer-events-none">
          {/* Channel row */}
          <div className="flex items-center gap-2.5 pointer-events-auto">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#6200ee] text-xs font-bold text-white shadow border border-white/20">
              {currentShort.channelName ? currentShort.channelName[0].toUpperCase() : 'U'}
            </div>
            <div className="font-bold text-sm text-white drop-shadow truncate">
              {currentShort.channelName}
            </div>
            <button
              onClick={() => setIsSubscribed(!isSubscribed)}
              className={`rounded-full px-3 py-1 text-xs font-bold transition-all shadow cursor-pointer ${
                isSubscribed
                  ? 'bg-black/60 text-white border border-white/30'
                  : 'bg-[#ff0000] text-white hover:bg-[#cc0000]'
              }`}
            >
              {isSubscribed ? 'Подписан' : 'Подписаться'}
            </button>
          </div>

          {/* Title */}
          <div className="text-xs md:text-sm font-medium leading-snug drop-shadow line-clamp-2">
            {currentShort.title}
          </div>

          <div className="text-[11px] text-[#cccccc] flex items-center gap-2">
            <span>{formatCount(currentShort.views)} просмотров</span>
            <span>•</span>
            <span className="text-[#3ea6ff]">#shorts #mytube</span>
          </div>
        </div>
      </div>

      {/* Floating Action Column on Right */}
      <div className="ml-4 flex flex-col gap-4 items-center">
        {/* Like */}
        <div className="flex flex-col items-center">
          <button
            onClick={handleLike}
            className={`flex h-12 w-12 items-center justify-center rounded-full bg-[#272727] text-white hover:bg-[#383838] transition-transform active:scale-90 shadow-lg cursor-pointer ${
              currentShort.isLikedByViewer ? 'text-[#3ea6ff] bg-[#1e293b]' : ''
            }`}
          >
            <ThumbsUp className={`h-5 w-5 ${currentShort.isLikedByViewer ? 'fill-[#3ea6ff]' : ''}`} />
          </button>
          <span className="mt-1 text-xs font-semibold text-white">
            {formatCount(currentShort.likes)}
          </span>
        </div>

        {/* Dislike */}
        <div className="flex flex-col items-center">
          <button
            onClick={handleDislike}
            className={`flex h-12 w-12 items-center justify-center rounded-full bg-[#272727] text-white hover:bg-[#383838] transition-transform active:scale-90 shadow-lg cursor-pointer ${
              currentShort.isDislikedByViewer ? 'text-[#3ea6ff] bg-[#1e293b]' : ''
            }`}
          >
            <ThumbsDown className={`h-5 w-5 ${currentShort.isDislikedByViewer ? 'fill-[#3ea6ff]' : ''}`} />
          </button>
          <span className="mt-1 text-xs text-[#aaaaaa]">Дизлайк</span>
        </div>

        {/* Comments */}
        <div className="flex flex-col items-center">
          <button
            onClick={() => setShowComments(!showComments)}
            className="flex h-12 w-12 items-center justify-center rounded-full bg-[#272727] text-white hover:bg-[#383838] transition-transform active:scale-90 shadow-lg cursor-pointer"
          >
            <MessageSquare className="h-5 w-5" />
          </button>
          <span className="mt-1 text-xs font-semibold text-white">
            {currentShort.comments?.length || 0}
          </span>
        </div>

        {/* Up / Down Navigator */}
        <div className="mt-2 flex flex-col gap-2">
          <button
            onClick={handlePrev}
            aria-label="Предыдущий шортс"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-[#181818] text-white hover:bg-[#282828] border border-[#333333] shadow cursor-pointer"
          >
            <ChevronUp className="h-5 w-5" />
          </button>
          <button
            onClick={handleNext}
            aria-label="Следующий шортс"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-[#181818] text-white hover:bg-[#282828] border border-[#333333] shadow cursor-pointer"
          >
            <ChevronDown className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Slide-in Comments Drawer */}
      {showComments && (
        <div className="absolute right-4 top-4 bottom-4 z-40 w-80 sm:w-96 rounded-2xl border border-[#333333] bg-[#1a1a1a] p-4 shadow-2xl flex flex-col animate-fade-in">
          <div className="flex items-center justify-between border-b border-[#333333] pb-3">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <span>Комментарии ({currentShort.comments?.length || 0} / 50)</span>
              {(currentShort.comments?.length || 0) >= 50 && (
                <span className="text-[11px] text-[#fbbf24] font-semibold">Лимит 50</span>
              )}
            </h3>
            <button
              onClick={() => setShowComments(false)}
              className="rounded-full p-1 text-[#aaaaaa] hover:bg-[#282828] hover:text-white cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Comments list */}
          <div className="flex-1 overflow-y-auto py-3 space-y-3">
            {(!currentShort.comments || currentShort.comments.length === 0) ? (
              <div className="py-8 text-center text-xs text-[#888888]">
                Будьте первым, кто прокомментирует этот Short!
              </div>
            ) : (
              currentShort.comments.map((c) => (
                <div key={c.id} className="flex gap-2.5 text-xs">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#555] font-bold text-white">
                    {c.author[0].toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-1.5 font-semibold text-white">
                      <span>{c.author}</span>
                      <span className="text-[10px] text-[#888888]">{formatTimeAgo(c.timestamp)}</span>
                    </div>
                    <div className="mt-0.5 text-[#e0e0e0] leading-relaxed">{c.text}</div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Add comment input */}
          {(currentShort.comments?.length || 0) >= 50 ? (
            <div className="border-t border-[#333333] pt-3 text-center text-xs text-[#fbbf24]">
              🔒 Достигнут лимит 50 комментариев. Комментарии зафиксированы.
            </div>
          ) : (
            <form onSubmit={handleAddComment} className="border-t border-[#333333] pt-3 flex gap-2">
              <input
                type="text"
                value={newCommentText}
                onChange={(e) => setNewCommentText(e.target.value)}
                placeholder={`Комментировать Short (${50 - (currentShort.comments?.length || 0)} осталось)...`}
                className="flex-1 rounded-lg border border-[#3f3f3f] bg-[#222222] px-3 py-1.5 text-xs text-white placeholder-[#777777] outline-none focus:border-[#3ea6ff]"
              />
              <button
                type="submit"
                className="flex items-center justify-center rounded-lg bg-[#3ea6ff] px-3 text-xs font-bold text-[#0f0f0f] hover:bg-[#65b8ff] cursor-pointer"
              >
                <Send className="h-3.5 w-3.5" />
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
};

import React, { useRef, useState } from 'react';
import { CheckCircle2, DollarSign, MoreVertical, Trash2, Rocket, Play } from 'lucide-react';
import { VideoItem } from '../types';
import { formatCount, formatMoney, formatTimeAgo } from '../services/simulationEngine';
import { isYouTubeSource, getYouTubeThumbnail } from '../services/youtubeHelper';

interface VideoCardProps {
  video: VideoItem;
  onSelect: (video: VideoItem) => void;
  onDelete?: (e: React.MouseEvent, videoId: string) => void;
  onBoost?: (e: React.MouseEvent, video: VideoItem) => void;
  isOwner?: boolean;
}

export const VideoCard: React.FC<VideoCardProps> = ({
  video,
  onSelect,
  onDelete,
  onBoost,
  isOwner,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleMouseEnter = () => {
    setIsHovered(true);
    if (videoRef.current && video.url && !video.fileMissing && !isYouTubeSource(video)) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {});
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    if (videoRef.current && video.url && !isYouTubeSource(video)) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  };

  const channelInitial = video.channelName ? video.channelName[0].toUpperCase() : 'U';

  return (
    <div
      id={`video-card-${video.id}`}
      onClick={() => onSelect(video)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="group flex flex-col cursor-pointer transition-all duration-200"
    >
      {/* Thumbnail / Video Preview */}
      <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-[#181818] border border-[#272727] shadow-sm">
        {isYouTubeSource(video) ? (
          <div className="relative h-full w-full">
            <img
              src={video.thumbnailUrl || getYouTubeThumbnail(video.youtubeId || video.url)}
              alt={video.title}
              className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
              referrerPolicy="no-referrer"
            />
            <div className="absolute top-2 right-2 z-10 flex items-center gap-1 rounded bg-[#ff0000] px-1.5 py-0.5 text-[10px] font-black text-white shadow">
              ▶ YouTube
            </div>
          </div>
        ) : video.url && !video.fileMissing ? (
          <video
            ref={videoRef}
            src={video.url}
            muted
            loop
            playsInline
            preload="metadata"
            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : video.thumbnailUrl ? (
          <img
            src={video.thumbnailUrl}
            alt={video.title}
            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center p-4 text-center text-[#888888]">
            <Play className="h-8 w-8 text-[#555555] mb-2" />
            <span className="text-xs">
              {video.fileMissing ? '⚠️ Файл видео не найден' : 'Видео'}
            </span>
          </div>
        )}

        {/* Category Pill on top left */}
        <div className="absolute top-2 left-2 z-10">
          <span className="rounded bg-black/80 backdrop-blur-sm px-2 py-0.5 text-[11px] font-extrabold uppercase tracking-wide text-white border border-white/20">
            {video.category || 'РАЗБОР'}
          </span>
        </div>

        {/* Duration badge bottom right */}
        <div className="absolute bottom-2 right-2 z-10">
          <span className="rounded bg-black/85 px-1.5 py-0.5 text-[11px] font-bold text-white tracking-wider">
            {video.isShort ? 'SHORTS' : video.duration || '10:24'}
          </span>
        </div>

        {/* Monetization revenue overlay if earned money */}
        {video.earnings > 0 && (
          <div className="absolute bottom-2 left-2 z-10 flex items-center gap-1 rounded bg-[#13301a]/90 border border-[#22572e] px-1.5 py-0.5 text-[10px] font-bold text-[#4ade80]">
            <DollarSign className="h-3 w-3" />
            <span>{formatMoney(video.earnings)}</span>
          </div>
        )}
      </div>

      {/* Info row */}
      <div className="mt-3 flex gap-3 px-0.5">
        {/* Channel Avatar */}
        <div className="shrink-0">
          {video.channelAvatar && (video.channelAvatar.startsWith('http') || video.channelAvatar.startsWith('data:')) ? (
            <img
              src={video.channelAvatar}
              alt={video.channelName}
              className="h-9 w-9 rounded-full object-cover border border-[#333333]"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#6200ee] text-xs font-bold text-white border border-[#333333]">
              {channelInitial}
            </div>
          )}
        </div>

        {/* Details */}
        <div className="flex-1 overflow-hidden">
          <h3 className="line-clamp-2 text-sm font-semibold leading-tight text-[#f1f1f1] group-hover:text-[#3ea6ff] transition-colors">
            {video.title}
          </h3>

          <div className="mt-1 flex items-center gap-1 text-xs text-[#aaaaaa]">
            <span className="truncate hover:text-white transition-colors">{video.channelName}</span>
            {(video.channelVerified || (video.channelSubs !== undefined && video.channelSubs >= 100000)) && (
              <CheckCircle2 className="h-3.5 w-3.5 text-[#3ea6ff] shrink-0" title="Официальный подтвержденный канал ✓" />
            )}
          </div>

          <div className="flex items-center gap-1.5 text-xs text-[#aaaaaa]">
            <span>{formatCount(video.views)} просмотров</span>
            <span>•</span>
            <span>{formatTimeAgo(video.uploadedAt)}</span>
          </div>
        </div>

        {/* Quick actions for owner */}
        {isOwner && (
          <div className="relative shrink-0" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="rounded-full p-1 text-[#aaaaaa] hover:bg-[#272727] hover:text-white transition-colors cursor-pointer"
            >
              <MoreVertical className="h-4 w-4" />
            </button>

            {menuOpen && (
              <div className="absolute right-0 top-8 z-30 w-44 rounded-xl border border-[#333333] bg-[#212121] py-1 shadow-2xl text-xs">
                {onBoost && (
                  <button
                    onClick={(e) => {
                      setMenuOpen(false);
                      onBoost(e, video);
                    }}
                    className="flex w-full items-center gap-2 px-3 py-2 text-left text-[#fbbf24] hover:bg-[#2d2d2d] cursor-pointer"
                  >
                    <Rocket className="h-3.5 w-3.5" />
                    <span>Накрутить видео</span>
                  </button>
                )}
                {onDelete && (
                  <button
                    onClick={(e) => {
                      setMenuOpen(false);
                      onDelete(e, video.id);
                    }}
                    className="flex w-full items-center gap-2 px-3 py-2 text-left text-[#ef4444] hover:bg-[#391818] cursor-pointer"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Удалить видео</span>
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

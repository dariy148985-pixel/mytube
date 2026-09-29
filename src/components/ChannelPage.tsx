import React, { useState } from 'react';
import {
  CheckCircle2,
  FileVideo,
  BarChart3,
  Rocket,
  Edit3,
  DollarSign,
  Eye,
  ThumbsUp,
  Users,
  Plus,
  Play,
  Bell,
  Share2,
  Clock,
  RotateCcw,
  Trash2,
  Check,
  Camera,
  Sparkles,
  Award,
  FastForward,
  MessageSquare,
} from 'lucide-react';
import { Channel, VideoItem } from '../types';
import { VideoCard } from './VideoCard';
import { formatCount, formatMoney } from '../services/simulationEngine';
import { isYouTubeSource, getYouTubeThumbnail } from '../services/youtubeHelper';
import { ConfirmModal } from './ConfirmModal';
import { ChannelCustomizationModal } from './ChannelCustomizationModal';
import { STARTER_VIDEOS } from '../services/sampleData';
import { CommunityTab } from './CommunityTab';

interface ChannelPageProps {
  channel: Channel;
  currentChannel?: Channel | null;
  onSelectVideo: (video: VideoItem) => void;
  onDeleteVideo: (videoId: string) => void;
  onOpenUpload: () => void;
  onOpenBoost: (video?: VideoItem) => void;
  onOpenStudio: () => void;
  onUpdateChannel: (channel: Channel) => void;
  onDeleteChannel?: () => void;
  isOwner?: boolean;
  upcomingVideoInfo?: { title: string; secondsLeft: number } | null;
  onRestartPremieres?: () => void;
}

export const ChannelPage: React.FC<ChannelPageProps> = ({
  channel,
  currentChannel,
  onSelectVideo,
  onDeleteVideo,
  onOpenUpload,
  onOpenBoost,
  onOpenStudio,
  onUpdateChannel,
  onDeleteChannel,
  isOwner = true,
  upcomingVideoInfo = null,
  onRestartPremieres,
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'videos' | 'shorts' | 'community' | 'stats' | 'about'>('all');
  const [isEditingDesc, setIsEditingDesc] = useState(false);
  const [descInput, setDescInput] = useState(channel.desc || '');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [copiedToast, setCopiedToast] = useState(false);
  const [showCustomizationModal, setShowCustomizationModal] = useState(false);
  const [customizationTab, setCustomizationTab] = useState<'banner' | 'avatar' | 'info'>('banner');

  const allVideos = channel.videos || [];
  const standardVideos = allVideos.filter((v) => !v.isShort);
  const shortsVideos = allVideos.filter((v) => v.isShort);

  const totalViews = allVideos.reduce((acc, v) => acc + (v.views || 0), 0);
  const totalLikes = allVideos.reduce((acc, v) => acc + (v.likes || 0), 0);
  const totalEarnings = allVideos.reduce((acc, v) => acc + (v.earnings || 0), 0);

  const handleToggleSubscribe = () => {
    const nextSub = !isSubscribed;
    setIsSubscribed(nextSub);
    onUpdateChannel({
      ...channel,
      subscribers: Math.max(0, channel.subscribers + (nextSub ? 1 : -1)),
    });
  };

  const handleSaveDesc = () => {
    onUpdateChannel({ ...channel, desc: descInput });
    setIsEditingDesc(false);
  };

  const handleClaimVerification = () => {
    onUpdateChannel({
      ...channel,
      verified: true,
    });
  };

  const channelInitial = channel.name ? channel.name[0].toUpperCase() : 'U';

  return (
    <div className="mx-auto max-w-[1400px] px-4 md:px-8 py-4">
      {/* Banner */}
      <div
        className="group relative h-36 md:h-52 w-full overflow-hidden rounded-2xl shadow-lg border border-[#272727]"
        style={{
          background: channel.bannerUrl
            ? `url(${channel.bannerUrl}) center/cover no-repeat`
            : `linear-gradient(135deg, ${channel.bannerColor || '#1e3a8a'}, #0f172a)`,
        }}
      >
        <div className="absolute inset-0 bg-black/20" />

        {isOwner && (
          <button
            type="button"
            onClick={() => {
              setCustomizationTab('banner');
              setShowCustomizationModal(true);
            }}
            className="absolute top-3 right-3 flex items-center gap-1.5 rounded-full bg-black/70 hover:bg-black/90 px-3 py-1.5 text-xs font-bold text-white backdrop-blur border border-white/20 transition-all cursor-pointer shadow-lg active:scale-95"
            title="Сменить баннер канала"
          >
            <Edit3 className="h-3.5 w-3.5 text-[#3ea6ff]" />
            <span>Изменить баннер</span>
          </button>
        )}
      </div>

      {/* Profile Header Row */}
      <div className="mt-4 flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#272727] pb-6">
        <div className="flex items-center gap-4 md:gap-6">
          {/* Big Avatar with change hover */}
          <div
            className="group relative flex h-20 w-20 md:h-28 md:w-28 shrink-0 items-center justify-center rounded-full text-3xl md:text-5xl font-extrabold text-white shadow-xl border-4 border-[#0f0f0f] overflow-hidden cursor-pointer"
            style={{ backgroundColor: channel.avatarColor || '#6200ee' }}
            onClick={() => {
              if (isOwner) {
                setCustomizationTab('avatar');
                setShowCustomizationModal(true);
              }
            }}
          >
            {channel.avatarUrl ? (
              <img
                src={channel.avatarUrl}
                alt={channel.name}
                className="h-full w-full object-cover"
              />
            ) : (
              channelInitial
            )}

            {isOwner && (
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white transition-opacity">
                <Camera className="h-6 w-6 text-white" />
                <span className="text-[10px] font-bold mt-1">Сменить</span>
              </div>
            )}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl md:text-3xl font-black text-[#f1f1f1] tracking-tight">
                {channel.name}
              </h1>
              {channel.verified && (
                <CheckCircle2 className="h-5 w-5 text-[#3ea6ff] shrink-0" title="Официальный верифицированный канал ✓" />
              )}
            </div>

            <div className="mt-1 flex flex-wrap items-center gap-2 text-xs md:text-sm text-[#aaaaaa]">
              <span className="font-semibold text-white">{channel.handle}</span>
              <span>•</span>
              <span>{channel.subscribers.toLocaleString('ru-RU')} подписчиков</span>
              <span>•</span>
              <span className="font-bold text-white">{allVideos.length} видео</span>
            </div>

            <div className="mt-2 text-xs text-[#cccccc] max-w-xl line-clamp-2">
              {channel.desc || 'Описание канала не заполнено.'}
            </div>
          </div>
        </div>

        {/* Quick Action buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          {isOwner ? (
            <>
              {/* Claim Verification Badge button if >= 100k and not verified yet */}
              {channel.subscribers >= 100000 && !channel.verified && (
                <button
                  type="button"
                  onClick={handleClaimVerification}
                  className="flex items-center gap-1.5 rounded-full bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 px-4 py-2 text-xs md:text-sm font-black text-black shadow-lg shadow-amber-500/20 animate-pulse transition-all active:scale-95 cursor-pointer"
                  title="У вас более 100 000 подписчиков! Нажмите чтобы получить официальную галочку верификации ✓"
                >
                  <Award className="h-4 w-4 text-black" />
                  <span>Получить галочку ✓</span>
                </button>
              )}

              {/* Channel Customization Button */}
              <button
                type="button"
                onClick={() => {
                  setCustomizationTab('banner');
                  setShowCustomizationModal(true);
                }}
                className="flex items-center gap-1.5 rounded-full bg-[#272727] hover:bg-[#383838] px-4 py-2 text-xs md:text-sm font-bold text-[#3ea6ff] transition-colors border border-[#3ea6ff]/30 cursor-pointer"
              >
                <Sparkles className="h-4 w-4 text-[#3ea6ff]" />
                <span>Оформление</span>
              </button>

              <button
                onClick={onOpenUpload}
                className="flex items-center gap-1.5 rounded-full bg-[#ff0000] hover:bg-[#cc0000] px-4 py-2 text-xs md:text-sm font-bold text-white shadow transition-all active:scale-95 cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                <span>Загрузить видео</span>
              </button>

              <button
                onClick={onOpenStudio}
                className="flex items-center gap-1.5 rounded-full bg-[#272727] hover:bg-[#383838] px-4 py-2 text-xs md:text-sm font-bold text-white transition-colors border border-[#333333] cursor-pointer"
              >
                <BarChart3 className="h-4 w-4 text-[#4ade80]" />
                <span>Студия</span>
              </button>

              <button
                onClick={() => onOpenBoost()}
                className="flex items-center gap-1.5 rounded-full bg-[#272727] hover:bg-[#383838] px-4 py-2 text-xs md:text-sm font-bold text-[#fbbf24] transition-colors border border-[#f59e0b]/30 cursor-pointer"
              >
                <Rocket className="h-4 w-4" />
                <span>Продвижение</span>
              </button>

              {isOwner && onDeleteChannel && (
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="flex items-center gap-1.5 rounded-full bg-[#3b1212] hover:bg-[#521818] px-3.5 py-2 text-xs md:text-sm font-bold text-[#ef4444] transition-colors border border-[#ef4444]/30 cursor-pointer"
                  title="Удалить этот канал"
                >
                  <Trash2 className="h-4 w-4" />
                  <span className="hidden sm:inline">Удалить канал</span>
                </button>
              )}
            </>
          ) : (
            <>
              <button
                onClick={handleToggleSubscribe}
                className={`flex items-center gap-2 rounded-full px-5 py-2 text-xs md:text-sm font-bold transition-all active:scale-95 cursor-pointer ${
                  isSubscribed
                    ? 'bg-[#272727] text-[#f1f1f1] hover:bg-[#333333] border border-[#3f3f3f]'
                    : 'bg-white text-black hover:bg-[#e6e6e6]'
                }`}
              >
                {isSubscribed ? (
                  <>
                    <Bell className="h-4 w-4 text-[#3ea6ff] fill-[#3ea6ff]" />
                    <span>Вы подписаны</span>
                  </>
                ) : (
                  <span>Подписаться</span>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  if (navigator.clipboard) {
                    navigator.clipboard.writeText(window.location.href);
                  }
                  setCopiedToast(true);
                  setTimeout(() => setCopiedToast(false), 2500);
                }}
                className="flex items-center gap-1.5 rounded-full bg-[#272727] hover:bg-[#383838] px-4 py-2 text-xs md:text-sm font-semibold text-white border border-[#333333] cursor-pointer relative"
              >
                {copiedToast ? (
                  <>
                    <Check className="h-4 w-4 text-[#4ade80]" />
                    <span className="text-[#4ade80]">Скопировано!</span>
                  </>
                ) : (
                  <>
                    <Share2 className="h-4 w-4 text-[#aaaaaa]" />
                    <span>Поделиться</span>
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Channel Customization Modal */}
      {showCustomizationModal && (
        <ChannelCustomizationModal
          channel={channel}
          isOpen={showCustomizationModal}
          onClose={() => setShowCustomizationModal(false)}
          initialTab={customizationTab}
          onSave={(updated) => {
            onUpdateChannel({
              ...channel,
              ...updated,
            });
          }}
        />
      )}

      {/* Upcoming Video Countdown Banner if scheduled */}
      {upcomingVideoInfo && (
        <div className="mt-4 rounded-2xl bg-gradient-to-r from-[#b45309]/30 via-[#78350f]/40 to-[#1e1e1e] p-4 border border-[#f59e0b]/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg animate-pulse">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f59e0b] text-black shrink-0">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-[#fbbf24]">
                🔔 Скоро премьера нового видео!
              </div>
              <div className="text-sm font-bold text-white line-clamp-1">
                «{upcomingVideoInfo.title}»
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
            <div className="text-left sm:text-right shrink-0">
              <div className="text-[11px] text-[#aaaaaa]">Премьера через:</div>
              <div className="text-lg font-black text-[#fbbf24]">
                {upcomingVideoInfo.secondsLeft > 60
                  ? `${Math.floor(upcomingVideoInfo.secondsLeft / 60)} мин. ${upcomingVideoInfo.secondsLeft % 60} сек.`
                  : `${upcomingVideoInfo.secondsLeft} сек.`}
              </div>
            </div>
            {onRestartPremieres && (
              <button
                onClick={onRestartPremieres}
                title="Перезапустить премьеры всех каналов заново с нуля"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#272727] hover:bg-[#383838] text-white text-xs font-semibold border border-[#383838] transition-colors cursor-pointer"
              >
                <RotateCcw className="h-3.5 w-3.5 text-[#fbbf24]" />
                <span>Заново</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-[#272727] mt-2 gap-4 md:gap-8 text-xs md:text-sm font-bold text-[#aaaaaa] overflow-x-auto scrollbar-none">
        {[
          { id: 'all', label: `Все видео (${allVideos.length})` },
          { id: 'videos', label: `Обычные (${standardVideos.length})` },
          { id: 'shorts', label: `Shorts (${shortsVideos.length})` },
          { id: 'community', label: `Сообщество (${(channel.communityPosts || []).length})` },
          ...(isOwner ? [{ id: 'stats', label: 'Статистика' }] : []),
          { id: 'about', label: 'О канале' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`py-3 border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === tab.id
                ? 'border-white text-white'
                : 'border-transparent hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Contents */}
      <div className="mt-6">
        {/* ALL Videos Tab */}
        {activeTab === 'all' && (
          <div>
            {allVideos.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-2xl bg-[#141414] p-12 text-center border border-[#222222]">
                <FileVideo className="h-12 w-12 text-[#555555] mb-3" />
                <h3 className="text-lg font-bold text-white">
                  {isOwner ? 'На вашем канале пока нет видео' : 'На канале пока нет опубликованных видео'}
                </h3>
                <p className="mt-1 text-sm text-[#888888] max-w-sm">
                  {isOwner
                    ? 'Нажмите кнопку «Загрузить видео» сверху, чтобы добавить видеофайл с диска (до 2 ГБ) или ролик с YouTube!'
                    : upcomingVideoInfo
                    ? `Скоро выйдет премьера: «${upcomingVideoInfo.title}»!`
                    : 'Новые видео скоро появятся на канале.'}
                </p>
                {isOwner && (
                  <button
                    onClick={onOpenUpload}
                    className="mt-4 rounded-full bg-[#ff0000] px-5 py-2 text-xs font-bold text-white hover:bg-[#cc0000] cursor-pointer"
                  >
                    Загрузить видео
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-6">
                {allVideos.map((v) => (
                  <VideoCard
                    key={v.id}
                    video={v}
                    onSelect={onSelectVideo}
                    onDelete={(_, vid) => onDeleteVideo(vid)}
                    onBoost={(_, vid) => onOpenBoost(vid)}
                    isOwner={isOwner}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Videos Tab */}
        {activeTab === 'videos' && (
          <div>
            {standardVideos.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-2xl bg-[#141414] p-12 text-center border border-[#222222]">
                <FileVideo className="h-12 w-12 text-[#555555] mb-3" />
                <h3 className="text-lg font-bold text-white">
                  {isOwner ? 'На канале пока нет обычных видео' : 'Обычные видео пока не вышли'}
                </h3>
                <p className="mt-1 text-sm text-[#888888] max-w-sm">
                  {isOwner ? 'Загрузите ваш первый ролик с рабочего стола размером до 2 ГБ!' : 'Следите за обновлениями канала.'}
                </p>
                {isOwner && (
                  <button
                    onClick={onOpenUpload}
                    className="mt-4 rounded-full bg-[#065fd4] px-5 py-2 text-xs font-bold text-white hover:bg-[#0056b3] cursor-pointer"
                  >
                    Загрузить видео
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-6">
                {standardVideos.map((v) => (
                  <VideoCard
                    key={v.id}
                    video={v}
                    onSelect={onSelectVideo}
                    onDelete={(_, vid) => onDeleteVideo(vid)}
                    onBoost={(_, vid) => onOpenBoost(vid)}
                    isOwner={isOwner}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Shorts Tab */}
        {activeTab === 'shorts' && (
          <div>
            {shortsVideos.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-2xl bg-[#141414] p-12 text-center border border-[#222222]">
                <Play className="h-12 w-12 text-[#555555] mb-3" />
                <h3 className="text-lg font-bold text-white">Нет опубликованных Shorts</h3>
                <p className="mt-1 text-sm text-[#888888]">
                  {isOwner
                    ? 'При загрузке видео выберите формат Shorts, чтобы ролик попал в эту вкладку!'
                    : 'Автор пока не публиковал короткие ролики.'}
                </p>
                {isOwner && (
                  <button
                    onClick={onOpenUpload}
                    className="mt-4 rounded-full bg-[#ff0000] px-5 py-2 text-xs font-bold text-white hover:bg-[#cc0000] cursor-pointer"
                  >
                    Создать Short
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {shortsVideos.map((v) => (
                  <div
                    key={v.id}
                    onClick={() => onSelectVideo(v)}
                    className="group flex flex-col cursor-pointer"
                  >
                    <div className="relative aspect-[9/16] w-full overflow-hidden rounded-xl bg-black border border-[#272727]">
                      {isYouTubeSource(v) ? (
                        <img
                          src={v.thumbnailUrl || getYouTubeThumbnail(v.youtubeId || v.url)}
                          alt={v.title}
                          className="h-full w-full object-cover group-hover:scale-105 transition-transform"
                          referrerPolicy="no-referrer"
                        />
                      ) : v.url ? (
                        <video src={v.url} className="h-full w-full object-cover group-hover:scale-105 transition-transform" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-xs text-[#777]">Shorts</div>
                      )}
                      <div className="absolute bottom-2 left-2 rounded bg-black/80 px-1.5 py-0.5 text-[10px] font-bold text-white">
                        {formatCount(v.views)} просп.
                      </div>
                    </div>
                    <div className="mt-2 line-clamp-2 text-xs font-semibold text-white group-hover:text-[#3ea6ff]">
                      {v.title}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Stats Tab (Owner Only) */}
        {isOwner && activeTab === 'stats' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="rounded-2xl bg-[#1a1a1a] p-5 border border-[#2a2a2a]">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-[#3ea6ff]/20 p-3 text-[#3ea6ff]">
                  <Eye className="h-6 w-6" />
                </div>
                <div>
                  <div className="text-xs text-[#aaaaaa]">Всего просмотров</div>
                  <div className="text-2xl font-black text-white">{totalViews.toLocaleString('ru-RU')}</div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl bg-[#1a1a1a] p-5 border border-[#2a2a2a]">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-[#22c55e]/20 p-3 text-[#22c55e]">
                  <Users className="h-6 w-6" />
                </div>
                <div>
                  <div className="text-xs text-[#aaaaaa]">Подписчиков</div>
                  <div className="text-2xl font-black text-white">{channel.subscribers.toLocaleString('ru-RU')}</div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl bg-[#1a1a1a] p-5 border border-[#2a2a2a]">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-[#ef4444]/20 p-3 text-[#ef4444]">
                  <ThumbsUp className="h-6 w-6" />
                </div>
                <div>
                  <div className="text-xs text-[#aaaaaa]">Всего лайков</div>
                  <div className="text-2xl font-black text-white">{totalLikes.toLocaleString('ru-RU')}</div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl bg-[#1a1a1a] p-5 border border-[#2a2a2a]">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-[#eab308]/20 p-3 text-[#eab308]">
                  <DollarSign className="h-6 w-6" />
                </div>
                <div>
                  <div className="text-xs text-[#aaaaaa]">Заработано (Монетизация)</div>
                  <div className="text-2xl font-black text-[#4ade80]">{formatMoney(totalEarnings)}</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Community Tab */}
        {activeTab === 'community' && (
          <CommunityTab
            channel={channel}
            currentChannel={currentChannel || null}
            isOwner={isOwner}
            onUpdateChannel={onUpdateChannel}
          />
        )}

        {/* About Tab */}
        {activeTab === 'about' && (
          <div className="rounded-2xl bg-[#181818] p-6 border border-[#272727] max-w-3xl space-y-6">
            <div>
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-white">Описание канала</h3>
                {isOwner && (!isEditingDesc ? (
                  <button
                    onClick={() => setIsEditingDesc(true)}
                    className="flex items-center gap-1 text-xs text-[#3ea6ff] hover:underline cursor-pointer"
                  >
                    <Edit3 className="h-3.5 w-3.5" />
                    <span>Редактировать</span>
                  </button>
                ) : (
                  <button
                    onClick={handleSaveDesc}
                    className="rounded-full bg-[#065fd4] px-3 py-1 text-xs font-bold text-white cursor-pointer"
                  >
                    Сохранить
                  </button>
                ))}
              </div>

              {isOwner && isEditingDesc ? (
                <textarea
                  value={descInput}
                  onChange={(e) => setDescInput(e.target.value)}
                  rows={4}
                  className="mt-2 w-full rounded-xl border border-[#3f3f3f] bg-[#222222] p-3 text-sm text-white outline-none focus:border-[#3ea6ff]"
                />
              ) : (
                <p className="mt-2 text-sm text-[#cccccc] leading-relaxed whitespace-pre-wrap">
                  {channel.desc || 'Нет описания.'}
                </p>
              )}
            </div>

            <div className="border-t border-[#2a2a2a] pt-4 space-y-2 text-xs text-[#aaaaaa]">
              <div>📅 Канал создан: {new Date(channel.createdAt).toLocaleDateString('ru-RU')}</div>
              <div>🔗 Персональная ссылка: https://mytube.app/{channel.handle}</div>
              {isOwner && (
                <div>💰 Статус монетизации: {channel.monetization.connected ? 'Подключена ✅' : 'Не подключена'}</div>
              )}
            </div>
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={showDeleteConfirm}
        title="Удалить этот канал?"
        message={`Вы уверены, что хотите удалить канал «${channel.name}»? Все загруженные видео и статистика канала будут безвозвратно удалены.`}
        confirmText="Да, удалить канал"
        cancelText="Отмена"
        onConfirm={() => {
          if (onDeleteChannel) {
            onDeleteChannel();
          }
          setShowDeleteConfirm(false);
        }}
        onClose={() => setShowDeleteConfirm(false)}
      />
    </div>
  );
};

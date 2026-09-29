import React, { useState } from 'react';
import {
  DollarSign,
  TrendingUp,
  Users,
  Eye,
  Rocket,
  Trash2,
  Play,
  CheckCircle2,
  Lock,
  Sparkles,
  Award,
  Video,
  Palette,
  Camera,
  Edit3,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Channel, VideoItem } from '../types';
import { BOOST_RATES, formatCount, formatMoney } from '../services/simulationEngine';
import { isYouTubeSource, getYouTubeThumbnail } from '../services/youtubeHelper';
import { ConfirmModal } from './ConfirmModal';
import { ChannelCustomizationModal } from './ChannelCustomizationModal';

interface StudioPageProps {
  channel: Channel;
  onUpdateChannel: (channel: Channel) => void;
  onSelectVideo: (video: VideoItem) => void;
  onDeleteVideo: (videoId: string) => void;
  simulationSpeed: number;
  setSimulationSpeed: (speed: number) => void;
}

export const StudioPage: React.FC<StudioPageProps> = ({
  channel,
  onUpdateChannel,
  onSelectVideo,
  onDeleteVideo,
  simulationSpeed,
  setSimulationSpeed,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'monetization' | 'boost' | 'content' | 'customization'>('overview');
  const [showCustomizationModal, setShowCustomizationModal] = useState(false);

  // Boost form state
  const [boostTargetVideoId, setBoostTargetVideoId] = useState<string>(
    channel.videos && channel.videos.length > 0 ? channel.videos[0].id : ''
  );
  const [boostType, setBoostType] = useState<'views' | 'likes' | 'comments' | 'subscribers'>('views');
  const [boostAmount, setBoostAmount] = useState<number>(1000);
  const [boostMessage, setBoostMessage] = useState<{ text: string; success: boolean } | null>(null);
  const [videoToDelete, setVideoToDelete] = useState<VideoItem | null>(null);

  const totalViews = (channel.videos || []).reduce((acc, v) => acc + (v.views || 0), 0);
  const totalLikes = (channel.videos || []).reduce((acc, v) => acc + (v.likes || 0), 0);
  const totalComments = (channel.videos || []).reduce((acc, v) => acc + (v.comments?.length || 0), 0);
  const totalRevenue = (channel.videos || []).reduce((acc, v) => acc + (v.earnings || 0), 0);

  // Monetization calculation
  const subsNeeded = 1000;
  const subsProgress = Math.min(100, Math.round((channel.subscribers / subsNeeded) * 100));
  const isMonetizationEligible = channel.subscribers >= subsNeeded;

  // Verification calculation (100,000 subscribers required)
  const verificationSubsNeeded = 100000;
  const isVerificationEligible = channel.subscribers >= verificationSubsNeeded;
  const verificationProgress = Math.min(100, Math.round((channel.subscribers / verificationSubsNeeded) * 100));

  const handleClaimVerification = () => {
    if (!isVerificationEligible) return;
    confetti({
      particleCount: 150,
      spread: 90,
      origin: { y: 0.5 },
    });
    onUpdateChannel({
      ...channel,
      verified: true,
    });
  };

  const handleConnectMonetization = () => {
    if (!isMonetizationEligible) return;

    confetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.6 },
    });

    const updatedVideos = (channel.videos || []).map((v) => ({
      ...v,
      lastMonetizedViews: v.views || 0,
    }));

    onUpdateChannel({
      ...channel,
      monetization: {
        connected: true,
        connectedAt: Date.now(),
      },
      videos: updatedVideos,
    });
  };

  const currentBoostPrice = Math.ceil((boostAmount || 0) * BOOST_RATES[boostType]);

  const handleApplyBoost = (e: React.FormEvent) => {
    e.preventDefault();
    if (boostAmount <= 0) return;

    if (channel.balance < currentBoostPrice) {
      setBoostMessage({
        text: `Недостаточно средств на балансе! Нужно ${formatMoney(currentBoostPrice)}, а у вас ${formatMoney(channel.balance)}. Дождитесь просмотров или монетизации.`,
        success: false,
      });
      return;
    }

    const newBalance = Math.round((channel.balance - currentBoostPrice) * 100) / 100;
    let newSubscribers = channel.subscribers;
    let updatedVideos = [...channel.videos];

    if (boostType === 'subscribers') {
      newSubscribers += boostAmount;
    } else {
      const targetVidIndex = updatedVideos.findIndex((v) => v.id === boostTargetVideoId);
      if (targetVidIndex !== -1) {
        const vid = { ...updatedVideos[targetVidIndex] };
        if (boostType === 'views') vid.views += boostAmount;
        if (boostType === 'likes') vid.likes += boostAmount;
        if (boostType === 'comments') {
          const sampleTexts = [
            'Классное видео! 🔥',
            'Почему это ещё не в трендах?',
            'Автор, продолжай снимать!',
            'Имба контент 😎',
            'Кто тоже смотрит в 2026? 👀',
            'Монтаж просто на высоте!',
          ];
          const newComments = [];
          for (let i = 0; i < Math.min(boostAmount, 50); i++) {
            newComments.push({
              id: 'boost_' + Date.now() + '_' + i,
              author: 'user_' + Math.floor(Math.random() * 8999 + 1000),
              text: sampleTexts[Math.floor(Math.random() * sampleTexts.length)],
              type: 'normal' as const,
              reply: null,
              dialogue: [],
              leftChannel: false,
              reformed: false,
              userReaction: null,
              joyReply: null,
              likes: Math.floor(Math.random() * 10),
              timestamp: Date.now(),
            });
          }
          vid.comments = [...newComments, ...(vid.comments || [])].slice(0, 50);
        }
        updatedVideos[targetVidIndex] = vid;
      }
    }

    onUpdateChannel({
      ...channel,
      balance: newBalance,
      subscribers: newSubscribers,
      videos: updatedVideos,
    });

    setBoostMessage({
      text: `🚀 Накрутка успешно запущена! Списано ${formatMoney(currentBoostPrice)}.`,
      success: true,
    });

    setTimeout(() => setBoostMessage(null), 5000);
  };

  return (
    <div className="mx-auto max-w-[1440px] px-4 md:px-8 py-6 text-white">
      {/* Studio Banner & Creator Info */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-3xl bg-[#1e1e1e] p-6 border border-[#2f2f2f] shadow-xl">
        <div className="flex items-center gap-4">
          <div
            className="flex h-16 w-16 items-center justify-center rounded-2xl text-2xl font-black text-white shadow-lg overflow-hidden shrink-0"
            style={{ backgroundColor: channel.avatarColor || '#6200ee' }}
          >
            {channel.avatarUrl ? (
              <img src={channel.avatarUrl} alt={channel.name} className="h-full w-full object-cover" />
            ) : (
              channel.name ? channel.name[0].toUpperCase() : 'U'
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl md:text-2xl font-black">{channel.name}</h1>
              {channel.verified && (
                <CheckCircle2 className="h-5 w-5 text-[#3ea6ff] shrink-0" title="Официальный верифицированный канал ✓" />
              )}
              <span className="rounded bg-[#ff0000]/20 px-2 py-0.5 text-[11px] font-bold text-[#ff4444] uppercase tracking-wider border border-[#ff0000]/30">
                Творческая студия
              </span>
            </div>
            <div className="text-xs text-[#aaaaaa] mt-1">
              Управление каналом, монетизация видео, оформление и аналитика
            </div>
          </div>
        </div>

        {/* Balance & Simulator Speed */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 rounded-2xl bg-[#14281b] border border-[#225835] px-4 py-2.5 shadow-inner">
            <DollarSign className="h-5 w-5 text-[#4ade80]" />
            <div>
              <div className="text-[10px] text-[#86efac] font-bold uppercase tracking-wider">
                Баланс канала
              </div>
              <div className="text-lg font-black text-white">{formatMoney(channel.balance)}</div>
            </div>
          </div>

          <div className="flex items-center gap-1 rounded-2xl bg-[#282828] p-1 border border-[#383838]">
            <span className="px-2 text-[11px] font-semibold text-[#aaaaaa]">Тикер:</span>
            {[
              { label: '⏸', val: 0 },
              { label: '1x', val: 1 },
              { label: '2x', val: 2 },
              { label: '5x', val: 5 },
              { label: '10x', val: 10 },
            ].map((s) => (
              <button
                key={s.val}
                onClick={() => setSimulationSpeed(s.val)}
                className={`rounded-xl px-2.5 py-1 text-xs font-bold transition-all cursor-pointer ${
                  simulationSpeed === s.val
                    ? 'bg-[#ff0000] text-white shadow'
                    : 'text-[#aaaaaa] hover:text-white hover:bg-[#333333]'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Navigation tabs */}
      <div className="mt-6 flex border-b border-[#2a2a2a] gap-6 text-sm font-bold text-[#aaaaaa] overflow-x-auto">
        {[
          { id: 'overview', label: 'Сводка и аналитика' },
          { id: 'monetization', label: 'Монетизация' },
          { id: 'customization', label: '🎨 Оформление (Баннер & Аватар)' },
          { id: 'boost', label: '🚀 Накрутка / Продвижение' },
          { id: 'content', label: `Контент (${channel.videos?.length || 0})` },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`py-3 border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === tab.id
                ? 'border-[#ff0000] text-white'
                : 'border-transparent hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab 1: Overview & Analytics */}
      {activeTab === 'overview' && (
        <div className="mt-6 space-y-6">
          {/* Verification (100k Subs) Card */}
          <div className="rounded-2xl bg-gradient-to-r from-[#1c1c1c] via-[#242424] to-[#1c1c1c] p-6 border border-[#333333] shadow-lg">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-2xl ${
                    channel.verified
                      ? 'bg-[#3ea6ff]/20 text-[#3ea6ff] border border-[#3ea6ff]/30'
                      : isVerificationEligible
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                      : 'bg-[#2a2a2a] text-[#888888]'
                  }`}
                >
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-white">Официальная галочка верификации ✓</h3>
                    {channel.verified && (
                      <span className="rounded bg-[#3ea6ff]/20 px-2 py-0.5 text-[10px] font-bold text-[#3ea6ff] border border-[#3ea6ff]/30">
                        Подтверждено
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[#aaaaaa] mt-0.5">
                    {channel.verified
                      ? 'Ваш канал официально подтвержден YouTube. Синяя галочка отображается в шапке, на карточках и в комментариях!'
                      : 'Требуется 100 000 подписчиков. Получите статус проверенного автора и синюю галочку.'}
                  </p>
                </div>
              </div>

              <div>
                {channel.verified ? (
                  <div className="flex items-center gap-1.5 rounded-full bg-[#162a38] px-4 py-2 text-xs font-bold text-[#3ea6ff] border border-[#3ea6ff]/30">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Верифицирован ✓</span>
                  </div>
                ) : isVerificationEligible ? (
                  <button
                    type="button"
                    onClick={handleClaimVerification}
                    className="flex items-center gap-2 rounded-full bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 px-5 py-2.5 text-xs font-black text-black shadow-lg shadow-amber-500/20 animate-pulse transition-all active:scale-95 cursor-pointer"
                  >
                    <Award className="h-4 w-4 text-black" />
                    <span>Получить галочку верификации ✓</span>
                  </button>
                ) : (
                  <div className="text-right">
                    <div className="text-xs font-bold text-white">
                      {channel.subscribers.toLocaleString('ru-RU')} / 100 000
                    </div>
                    <div className="w-36 bg-[#2d2d2d] h-2 rounded-full mt-1 overflow-hidden">
                      <div
                        className="bg-[#3ea6ff] h-full rounded-full transition-all duration-500"
                        style={{ width: `${verificationProgress}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="rounded-2xl bg-[#1c1c1c] p-5 border border-[#2a2a2a]">
              <div className="flex items-center justify-between text-[#3ea6ff]">
                <span className="text-xs font-bold uppercase tracking-wider text-[#888888]">
                  Просмотры
                </span>
                <Eye className="h-5 w-5" />
              </div>
              <div className="mt-2 text-2xl md:text-3xl font-black text-white">
                {totalViews.toLocaleString('ru-RU')}
              </div>
              <div className="mt-1 text-[11px] text-[#4ade80] flex items-center gap-1 font-semibold">
                <TrendingUp className="h-3 w-3" />
                <span>Растут с каждым тиком симулятора</span>
              </div>
            </div>

            <div className="rounded-2xl bg-[#1c1c1c] p-5 border border-[#2a2a2a]">
              <div className="flex items-center justify-between text-[#22c55e]">
                <span className="text-xs font-bold uppercase tracking-wider text-[#888888]">
                  Подписчики
                </span>
                <Users className="h-5 w-5" />
              </div>
              <div className="mt-2 text-2xl md:text-3xl font-black text-white">
                {channel.subscribers.toLocaleString('ru-RU')}
              </div>
              <div className="mt-1 text-[11px] text-[#aaaaaa]">
                Цель для монетизации: 1 000
              </div>
            </div>

            <div className="rounded-2xl bg-[#1c1c1c] p-5 border border-[#2a2a2a]">
              <div className="flex items-center justify-between text-[#ef4444]">
                <span className="text-xs font-bold uppercase tracking-wider text-[#888888]">
                  Лайки и активность
                </span>
                <Sparkles className="h-5 w-5" />
              </div>
              <div className="mt-2 text-2xl md:text-3xl font-black text-white">
                {totalLikes.toLocaleString('ru-RU')}
              </div>
              <div className="mt-1 text-[11px] text-[#aaaaaa]">
                {totalComments.toLocaleString('ru-RU')} комментариев зрителей
              </div>
            </div>

            <div className="rounded-2xl bg-[#1c1c1c] p-5 border border-[#2a2a2a]">
              <div className="flex items-center justify-between text-[#eab308]">
                <span className="text-xs font-bold uppercase tracking-wider text-[#888888]">
                  Доход от рекламы
                </span>
                <DollarSign className="h-5 w-5" />
              </div>
              <div className="mt-2 text-2xl md:text-3xl font-black text-[#4ade80]">
                {formatMoney(totalRevenue)}
              </div>
              <div className="mt-1 text-[11px] text-[#aaaaaa]">
                {channel.monetization.connected ? 'Монетизация активна (20 ₽ / 1k)' : 'Требуется подключение'}
              </div>
            </div>
          </div>

          {/* YouTube Play Buttons Awards */}
          <div className="rounded-2xl bg-[#1c1c1c] p-6 border border-[#2a2a2a]">
            <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
              <Award className="h-5 w-5 text-[#fbbf24]" />
              <span>Награды YouTube для авторов</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div
                className={`rounded-xl p-4 border transition-all ${
                  channel.subscribers >= 100000
                    ? 'bg-gradient-to-br from-[#2c2c2c] to-[#1f1f1f] border-[#e0e0e0] shadow-lg shadow-white/5'
                    : 'bg-[#181818] border-[#292929] opacity-70'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-2xl">🥈</span>
                  {channel.subscribers >= 100000 ? (
                    <span className="rounded bg-[#22c55e]/20 px-2 py-0.5 text-[10px] font-bold text-[#22c55e]">
                      Получена ✓
                    </span>
                  ) : (
                    <span className="rounded bg-black/40 px-2 py-0.5 text-[10px] text-[#888888] flex items-center gap-1">
                      <Lock className="h-3 w-3" /> 100 000
                    </span>
                  )}
                </div>
                <div className="mt-3 font-bold text-sm text-white">Серебряная кнопка YouTube</div>
                <p className="mt-1 text-xs text-[#aaaaaa]">
                  Вручается авторам за достижение 100,000 подписчиков.
                </p>
              </div>

              <div
                className={`rounded-xl p-4 border transition-all ${
                  channel.subscribers >= 1000000
                    ? 'bg-gradient-to-br from-[#382b08] to-[#1f1a09] border-[#f59e0b] shadow-lg shadow-yellow-500/10'
                    : 'bg-[#181818] border-[#292929] opacity-70'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-2xl">🥇</span>
                  {channel.subscribers >= 1000000 ? (
                    <span className="rounded bg-[#22c55e]/20 px-2 py-0.5 text-[10px] font-bold text-[#22c55e]">
                      Получена ✓
                    </span>
                  ) : (
                    <span className="rounded bg-black/40 px-2 py-0.5 text-[10px] text-[#888888] flex items-center gap-1">
                      <Lock className="h-3 w-3" /> 1 000 000
                    </span>
                  )}
                </div>
                <div className="mt-3 font-bold text-sm text-[#fef08a]">Золотая кнопка YouTube</div>
                <p className="mt-1 text-xs text-[#aaaaaa]">
                  Вручается авторам за преодоление отметки в 1,000,000 подписчиков!
                </p>
              </div>

              <div
                className={`rounded-xl p-4 border transition-all ${
                  channel.subscribers >= 10000000
                    ? 'bg-gradient-to-br from-[#0c2e3a] to-[#071922] border-[#38bdf8]'
                    : 'bg-[#181818] border-[#292929] opacity-70'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-2xl">💎</span>
                  {channel.subscribers >= 10000000 ? (
                    <span className="rounded bg-[#22c55e]/20 px-2 py-0.5 text-[10px] font-bold text-[#22c55e]">
                      Получена ✓
                    </span>
                  ) : (
                    <span className="rounded bg-black/40 px-2 py-0.5 text-[10px] text-[#888888] flex items-center gap-1">
                      <Lock className="h-3 w-3" /> 10 000 000
                    </span>
                  )}
                </div>
                <div className="mt-3 font-bold text-sm text-[#bae6fd]">Бриллиантовая кнопка</div>
                <p className="mt-1 text-xs text-[#aaaaaa]">
                  Легендарный статус суперзвезды интернета (10,000,000 подписчиков).
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Monetization */}
      {activeTab === 'monetization' && (
        <div className="mt-6 max-w-3xl space-y-6">
          <div className="rounded-3xl bg-[#1c1c1c] p-6 md:p-8 border border-[#2a2a2a] shadow-xl">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#166534]/30 text-[#4ade80] border border-[#22c55e]/30">
                <DollarSign className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Партнерская программа YouTube</h3>
                <p className="text-xs text-[#aaaaaa]">Зарабатывайте на показах рекламы в своих видео</p>
              </div>
            </div>

            {channel.monetization.connected ? (
              <div className="mt-6 rounded-2xl bg-[#14291a] border border-[#225835] p-5">
                <div className="flex items-center gap-2 font-bold text-[#4ade80] text-sm">
                  <CheckCircle2 className="h-5 w-5" />
                  <span>Монетизация успешно подключена!</span>
                </div>
                <p className="mt-2 text-xs text-[#cccccc] leading-relaxed">
                  Ваш канал официально участвует в монетизации. Доход начисляется за каждый просмотр новых видео (ставка: <strong>20 ₽ за 1 000 просмотров</strong>). Средства мгновенно зачисляются на баланс канала!
                </p>
                <div className="mt-4 flex items-center gap-4 text-xs">
                  <div>
                    <span className="text-[#888888]">Всего заработано: </span>
                    <strong className="text-[#4ade80]">{formatMoney(totalRevenue)}</strong>
                  </div>
                  <div>
                    <span className="text-[#888888]">Текущий баланс: </span>
                    <strong className="text-white">{formatMoney(channel.balance)}</strong>
                  </div>
                </div>
              </div>
            ) : (
              <div className="mt-6 space-y-5">
                <div className="rounded-2xl bg-[#161616] p-5 border border-[#282828]">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-white">Требование: 1 000 подписчиков</span>
                    <span className={isMonetizationEligible ? 'text-[#4ade80] font-bold' : 'text-[#eab308]'}>
                      {channel.subscribers.toLocaleString('ru-RU')} / 1 000 ({subsProgress}%)
                    </span>
                  </div>

                  <div className="mt-2.5 h-3 w-full overflow-hidden rounded-full bg-[#272727]">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isMonetizationEligible ? 'bg-[#22c55e]' : 'bg-[#eab308]'
                      }`}
                      style={{ width: `${subsProgress}%` }}
                    />
                  </div>

                  {!isMonetizationEligible && (
                    <div className="mt-2 text-[11px] text-[#888888]">
                      Осталось набрать: {(subsNeeded - channel.subscribers).toLocaleString('ru-RU')} подписчиков.
                    </div>
                  )}
                </div>

                <button
                  onClick={handleConnectMonetization}
                  disabled={!isMonetizationEligible}
                  className={`w-full rounded-2xl py-3.5 text-sm font-bold shadow-lg transition-all ${
                    isMonetizationEligible
                      ? 'bg-[#065fd4] hover:bg-[#0056b3] text-white cursor-pointer active:scale-95'
                      : 'bg-[#272727] text-[#777777] cursor-not-allowed opacity-60'
                  }`}
                >
                  {isMonetizationEligible ? '🎉 Подключить монетизацию' : 'Требуется 1 000 подписчиков'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 3: In-Game Boost Terminal */}
      {activeTab === 'boost' && (
        <div className="mt-6 max-w-2xl">
          <div className="rounded-3xl bg-[#1c1c1c] p-6 md:p-8 border border-[#2a2a2a] shadow-xl">
            <div className="flex items-center justify-between border-b border-[#2a2a2a] pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#eab308]/20 text-[#fbbf24]">
                  <Rocket className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Продвижение и Накрутка</h3>
                  <p className="text-xs text-[#aaaaaa]">Внутриигровая покупка показателей за баланс канала</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-[10px] text-[#888888] font-semibold">Ваш баланс:</div>
                <div className="text-base font-bold text-[#4ade80]">{formatMoney(channel.balance)}</div>
              </div>
            </div>

            {boostMessage && (
              <div
                className={`mt-4 rounded-xl p-3 text-xs font-semibold ${
                  boostMessage.success
                    ? 'bg-[#153e20] text-[#4ade80] border border-[#22c55e]/40'
                    : 'bg-[#3f1919] text-[#f87171] border border-[#ef4444]/40'
                }`}
              >
                {boostMessage.text}
              </div>
            )}

            <form onSubmit={handleApplyBoost} className="mt-6 space-y-4">
              {boostType !== 'subscribers' && (
                <div>
                  <label className="block text-xs font-bold text-[#aaaaaa] mb-1.5">
                    Выберите видео для накрутки:
                  </label>
                  {(!channel.videos || channel.videos.length === 0) ? (
                    <div className="text-xs text-[#ef4444]">Сначала загрузите видео на канал!</div>
                  ) : (
                    <select
                      value={boostTargetVideoId}
                      onChange={(e) => setBoostTargetVideoId(e.target.value)}
                      className="w-full rounded-xl border border-[#3f3f3f] bg-[#222222] p-3 text-xs text-white outline-none focus:border-[#3ea6ff] cursor-pointer"
                    >
                      {channel.videos.map((v) => (
                        <option key={v.id} value={v.id}>
                          {v.title} ({formatCount(v.views)} просп., {v.likes} лайков)
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-[#aaaaaa] mb-1.5">Что накручиваем?</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'views', label: '👁 Просмотры', rate: '80 ₽ / 1 000' },
                    { id: 'likes', label: '👍 Лайки', rate: '600 ₽ / 1 000' },
                    { id: 'comments', label: '💬 Комменты', rate: '5 ₽ / 1 шт.' },
                    { id: 'subscribers', label: '👥 Подписчики', rate: '5 ₽ / 1 шт.' },
                  ].map((item) => (
                    <button
                      type="button"
                      key={item.id}
                      onClick={() => setBoostType(item.id as any)}
                      className={`flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                        boostType === item.id
                          ? 'border-[#fbbf24] bg-[#2a220f] text-[#fbbf24]'
                          : 'border-[#333333] bg-[#222222] text-[#cccccc] hover:bg-[#2a2a2a]'
                      }`}
                    >
                      <span>{item.label}</span>
                      <span className="text-[10px] text-[#888888] font-normal mt-0.5">{item.rate}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs font-bold text-[#aaaaaa] mb-1.5">
                  <span>Количество:</span>
                  <span className="text-white">{boostAmount.toLocaleString('ru-RU')}</span>
                </div>
                <input
                  type="number"
                  min={1}
                  step={boostType === 'views' ? 100 : 1}
                  value={boostAmount}
                  onChange={(e) => setBoostAmount(Math.max(1, parseInt(e.target.value) || 0))}
                  className="w-full rounded-xl border border-[#3f3f3f] bg-[#222222] p-3 text-sm text-white outline-none focus:border-[#3ea6ff]"
                />

                <div className="mt-2 flex gap-2">
                  {[100, 500, 1000, 5000].map((preset) => (
                    <button
                      type="button"
                      key={preset}
                      onClick={() => setBoostAmount(preset)}
                      className="rounded-lg bg-[#272727] px-2.5 py-1 text-[11px] font-semibold text-[#aaaaaa] hover:text-white cursor-pointer"
                    >
                      +{preset.toLocaleString('ru-RU')}
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl bg-[#232323] p-4 flex items-center justify-between border border-[#333333]">
                <div>
                  <div className="text-xs text-[#888888]">Итоговая стоимость:</div>
                  <div className="text-xl font-black text-[#fbbf24]">{formatMoney(currentBoostPrice)}</div>
                </div>
                <div className="text-right text-xs text-[#aaaaaa]">
                  Остаток после списания:{' '}
                  <span className={channel.balance >= currentBoostPrice ? 'text-white' : 'text-[#ef4444]'}>
                    {formatMoney(Math.max(0, channel.balance - currentBoostPrice))}
                  </span>
                </div>
              </div>

              <button
                type="submit"
                className="w-full rounded-2xl bg-[#065fd4] hover:bg-[#0056b3] py-3.5 text-sm font-bold text-white shadow-lg transition-all active:scale-95 cursor-pointer"
              >
                🚀 Накрутить сейчас
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Tab 4: Content Management */}
      {activeTab === 'content' && (
        <div className="mt-6">
          {(!channel.videos || channel.videos.length === 0) ? (
            <div className="rounded-2xl bg-[#1c1c1c] p-10 text-center border border-[#2a2a2a]">
              <Video className="h-10 w-10 text-[#555555] mx-auto mb-2" />
              <h3 className="font-bold text-white text-base">Вы еще не загрузили видео</h3>
              <p className="mt-1 text-xs text-[#888888]">Загружайте ролики до 2 ГБ и следите за их просмотрами здесь.</p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-[#2a2a2a] bg-[#1c1c1c]">
              <table className="w-full text-left text-xs text-[#cccccc]">
                <thead className="border-b border-[#2a2a2a] bg-[#222222] font-bold text-[#aaaaaa] uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="p-3.5">Видео</th>
                    <th className="p-3.5">Рубрика</th>
                    <th className="p-3.5">Просмотры</th>
                    <th className="p-3.5">Лайки</th>
                    <th className="p-3.5">Комментарии</th>
                    <th className="p-3.5">Доход</th>
                    <th className="p-3.5 text-right">Действия</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#272727]">
                  {channel.videos.map((vid) => (
                    <tr key={vid.id} className="hover:bg-[#242424] transition-colors">
                      <td className="p-3.5">
                        <div
                          onClick={() => onSelectVideo(vid)}
                          className="flex items-center gap-3 cursor-pointer group"
                        >
                          <div className="h-12 w-20 shrink-0 overflow-hidden rounded bg-black">
                            {isYouTubeSource(vid) ? (
                              <img
                                src={vid.thumbnailUrl || getYouTubeThumbnail(vid.youtubeId || vid.url)}
                                alt={vid.title}
                                className="h-full w-full object-cover"
                              />
                            ) : vid.url ? (
                              <video src={vid.url} className="h-full w-full object-cover" />
                            ) : (
                              <div className="h-full w-full flex items-center justify-center text-[9px] text-[#777]">
                                Видео
                              </div>
                            )}
                          </div>
                          <div>
                            <div className="font-bold text-white group-hover:text-[#3ea6ff] line-clamp-1">
                              {vid.title}
                            </div>
                            <div className="text-[10px] text-[#888888]">
                              {vid.isShort ? '⚡ Shorts' : 'Обычное видео'}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="p-3.5 font-semibold text-white">
                        <span className="rounded bg-black/60 px-2 py-0.5 text-[10px]">
                          {vid.category || 'РАЗБОР'}
                        </span>
                      </td>

                      <td className="p-3.5 font-bold text-white">{vid.views.toLocaleString('ru-RU')}</td>
                      <td className="p-3.5">{vid.likes.toLocaleString('ru-RU')}</td>
                      <td className="p-3.5">{vid.comments?.length || 0}</td>
                      <td className="p-3.5 font-bold text-[#4ade80]">{formatMoney(vid.earnings || 0)}</td>
                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => onSelectVideo(vid)}
                            className="rounded-lg bg-[#2b2b2b] p-2 text-white hover:bg-[#383838] cursor-pointer"
                            title="Открыть"
                          >
                            <Play className="h-3.5 w-3.5 fill-white" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setVideoToDelete(vid)}
                            className="rounded-lg bg-[#3b1515] p-2 text-[#ef4444] hover:bg-[#521c1c] transition-colors cursor-pointer"
                            title="Удалить"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab 5: Channel Customization */}
      {activeTab === 'customization' && (
        <div className="mt-6 space-y-6">
          <div className="rounded-3xl bg-[#1c1c1c] p-6 md:p-8 border border-[#2a2a2a] shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#2d2d2d] pb-6">
              <div>
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <Palette className="h-5 w-5 text-[#3ea6ff]" />
                  <span>Оформление канала (Баннер & Аватарка)</span>
                </h3>
                <p className="text-xs text-[#aaaaaa] mt-1">
                  Настройте баннер, аватарку и информацию канала как у топовых ютуберов!
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowCustomizationModal(true)}
                className="flex items-center gap-2 rounded-xl bg-[#3ea6ff] hover:bg-[#60b5ff] px-5 py-2.5 text-xs font-bold text-[#0f0f0f] shadow-lg transition-all active:scale-95 cursor-pointer"
              >
                <Edit3 className="h-4 w-4" />
                <span>Редактировать оформление</span>
              </button>
            </div>

            {/* Banner preview block */}
            <div className="mt-6">
              <div className="text-xs font-bold text-[#aaaaaa] uppercase tracking-wider mb-2 flex items-center justify-between">
                <span>Баннер канала:</span>
                <span className="text-[11px] text-[#3ea6ff]">Отображается вверху страницы канала</span>
              </div>
              <div
                className="relative h-44 w-full rounded-2xl overflow-hidden border border-[#333333] shadow-inner"
                style={{
                  background: channel.bannerUrl
                    ? `url(${channel.bannerUrl}) center/cover no-repeat`
                    : `linear-gradient(135deg, ${channel.bannerColor || '#1e3a8a'}, #0f172a)`,
                }}
              >
                <div className="absolute inset-0 bg-black/25" />
                <div className="absolute bottom-3 right-3">
                  <button
                    type="button"
                    onClick={() => setShowCustomizationModal(true)}
                    className="flex items-center gap-1.5 rounded-full bg-black/70 hover:bg-black/90 px-3.5 py-1.5 text-xs font-bold text-white border border-white/20 transition-all cursor-pointer backdrop-blur"
                  >
                    <Edit3 className="h-3.5 w-3.5 text-[#3ea6ff]" />
                    <span>Сменить баннер</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Avatar & Channel Details */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="rounded-2xl bg-[#242424] p-5 border border-[#333333]">
                <div className="text-xs font-bold text-[#aaaaaa] uppercase tracking-wider mb-3">
                  Аватарка и иконка:
                </div>
                <div className="flex items-center gap-4">
                  <div
                    className="h-20 w-20 rounded-full flex items-center justify-center text-3xl font-extrabold text-white shadow-xl border-2 border-white/20 overflow-hidden shrink-0"
                    style={{ backgroundColor: channel.avatarColor || '#6200ee' }}
                  >
                    {channel.avatarUrl ? (
                      <img src={channel.avatarUrl} alt={channel.name} className="h-full w-full object-cover" />
                    ) : (
                      channel.name ? channel.name[0].toUpperCase() : 'U'
                    )}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white flex items-center gap-1.5">
                      <span>{channel.name}</span>
                      {channel.verified && (
                        <CheckCircle2 className="h-4 w-4 text-[#3ea6ff]" />
                      )}
                    </div>
                    <div className="text-xs text-[#888888] mt-0.5">{channel.handle}</div>
                    <button
                      type="button"
                      onClick={() => setShowCustomizationModal(true)}
                      className="mt-3 flex items-center gap-1.5 rounded-xl bg-[#333333] hover:bg-[#404040] px-3.5 py-1.5 text-xs font-bold text-white border border-[#444444] transition-colors cursor-pointer"
                    >
                      <Camera className="h-3.5 w-3.5 text-[#4ade80]" />
                      <span>Сменить аватарку</span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl bg-[#242424] p-5 border border-[#333333] flex flex-col justify-between">
                <div>
                  <div className="text-xs font-bold text-[#aaaaaa] uppercase tracking-wider mb-2">
                    Информация о канале:
                  </div>
                  <p className="text-xs text-[#cccccc] leading-relaxed line-clamp-3">
                    {channel.desc || 'Описание еще не добавлено. Нажмите «Редактировать», чтобы написать о своем канале!'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowCustomizationModal(true)}
                  className="mt-3 self-start flex items-center gap-1.5 rounded-xl bg-[#333333] hover:bg-[#404040] px-3.5 py-1.5 text-xs font-bold text-white border border-[#444444] transition-colors cursor-pointer"
                >
                  <Edit3 className="h-3.5 w-3.5 text-[#fbbf24]" />
                  <span>Редактировать описание</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showCustomizationModal && (
        <ChannelCustomizationModal
          channel={channel}
          isOpen={showCustomizationModal}
          onClose={() => setShowCustomizationModal(false)}
          onSave={(updated) => {
            onUpdateChannel({
              ...channel,
              ...updated,
            });
          }}
        />
      )}

      <ConfirmModal
        isOpen={!!videoToDelete}
        title="Удалить это видео?"
        message={`Вы уверены, что хотите удалить видео «${videoToDelete?.title}»?`}
        confirmText="Да, удалить"
        cancelText="Отмена"
        onConfirm={() => {
          if (videoToDelete) {
            onDeleteVideo(videoToDelete.id);
            setVideoToDelete(null);
          }
        }}
        onClose={() => setVideoToDelete(null)}
      />
    </div>
  );
};

import React, { useState } from 'react';
import { X, Rocket } from 'lucide-react';
import { Channel, VideoItem } from '../types';
import { BOOST_RATES, formatMoney } from '../services/simulationEngine';

interface BoostModalProps {
  isOpen: boolean;
  onClose: () => void;
  channel: Channel;
  currentVideo?: VideoItem | null;
  onUpdateChannel: (channel: Channel) => void;
}

export const BoostModal: React.FC<BoostModalProps> = ({
  isOpen,
  onClose,
  channel,
  currentVideo,
  onUpdateChannel,
}) => {
  const [boostType, setBoostType] = useState<'views' | 'likes' | 'comments' | 'subscribers'>('views');
  const [boostAmount, setBoostAmount] = useState<number>(1000);
  const [selectedVideoId, setSelectedVideoId] = useState<string>(
    currentVideo?.id || (channel.videos && channel.videos.length > 0 ? channel.videos[0].id : '')
  );
  const [statusMessage, setStatusMessage] = useState<{ text: string; success: boolean } | null>(null);

  if (!isOpen) return null;

  const currentPrice = Math.ceil((boostAmount || 0) * BOOST_RATES[boostType]);

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    if (boostAmount <= 0) return;

    if (channel.balance < currentPrice) {
      setStatusMessage({
        text: `Недостаточно рублей на балансе! Нужно ${formatMoney(currentPrice)}, а у вас ${formatMoney(channel.balance)}.`,
        success: false,
      });
      return;
    }

    const newBalance = Math.round((channel.balance - currentPrice) * 100) / 100;
    let newSubscribers = channel.subscribers;
    let updatedVideos = [...channel.videos];

    if (boostType === 'subscribers') {
      newSubscribers += boostAmount;
    } else {
      const idx = updatedVideos.findIndex((v) => v.id === selectedVideoId);
      if (idx !== -1) {
        const vid = { ...updatedVideos[idx] };
        if (boostType === 'views') vid.views += boostAmount;
        if (boostType === 'likes') vid.likes += boostAmount;
        if (boostType === 'comments') {
          const sampleTexts = [
            'Очень годный контент, респект!',
            'В тренды этот видос!',
            'Подписался, жду проду!',
            'Топ разбор 🔥',
            'Спасибо автору за старания!',
          ];
          const newComments = [];
          for (let i = 0; i < Math.min(boostAmount, 40); i++) {
            newComments.push({
              id: 'b_' + Date.now() + '_' + i,
              author: 'boost_user_' + Math.floor(Math.random() * 8999 + 1000),
              text: sampleTexts[Math.floor(Math.random() * sampleTexts.length)],
              type: 'normal' as const,
              reply: null,
              dialogue: [],
              leftChannel: false,
              reformed: false,
              userReaction: null,
              joyReply: null,
              likes: Math.floor(Math.random() * 8),
              timestamp: Date.now(),
            });
          }
          vid.comments = [...newComments, ...(vid.comments || [])].slice(0, 50);
        }
        updatedVideos[idx] = vid;
      }
    }

    onUpdateChannel({
      ...channel,
      balance: newBalance,
      subscribers: newSubscribers,
      videos: updatedVideos,
    });

    setStatusMessage({
      text: `🚀 Накрутка успешно применена! +${boostAmount.toLocaleString('ru-RU')} ${
        boostType === 'views'
          ? 'просмотров'
          : boostType === 'likes'
          ? 'лайков'
          : boostType === 'comments'
          ? 'комментариев'
          : 'подписчиков'
      }.`,
      success: true,
    });

    setTimeout(() => {
      setStatusMessage(null);
      onClose();
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-md rounded-3xl border border-[#333333] bg-[#1a1a1a] p-6 text-white shadow-2xl animate-fade-in">
        <div className="flex items-center justify-between border-b border-[#2d2d2d] pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#eab308]/20 text-[#fbbf24]">
              <Rocket className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold">Быстрая накрутка</h2>
              <div className="text-[11px] text-[#aaaaaa]">Баланс: {formatMoney(channel.balance)}</div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-[#aaaaaa] hover:bg-[#282828] hover:text-white cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {statusMessage && (
          <div
            className={`mt-4 rounded-xl p-3 text-xs font-semibold ${
              statusMessage.success
                ? 'bg-[#153e20] text-[#4ade80] border border-[#22c55e]/40'
                : 'bg-[#3f1919] text-[#f87171] border border-[#ef4444]/40'
            }`}
          >
            {statusMessage.text}
          </div>
        )}

        <form onSubmit={handleApply} className="mt-4 space-y-4">
          {boostType !== 'subscribers' && (
            <div>
              <label className="block text-xs font-bold text-[#aaaaaa] mb-1">Видео:</label>
              {(!channel.videos || channel.videos.length === 0) ? (
                <div className="text-xs text-[#ef4444]">На канале нет видео для накрутки</div>
              ) : (
                <select
                  value={selectedVideoId}
                  onChange={(e) => setSelectedVideoId(e.target.value)}
                  className="w-full rounded-xl border border-[#3f3f3f] bg-[#222222] p-2.5 text-xs text-white outline-none cursor-pointer"
                >
                  {channel.videos.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.title}
                    </option>
                  ))}
                </select>
              )}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-[#aaaaaa] mb-1">Тип накрутки:</label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'views', label: '👁 Просмотры', price: '80 ₽ / 1k' },
                { id: 'likes', label: '👍 Лайки', price: '600 ₽ / 1k' },
                { id: 'comments', label: '💬 Комменты', price: '5 ₽ / 1 шт.' },
                { id: 'subscribers', label: '👥 Подписчики', price: '5 ₽ / 1 шт.' },
              ].map((m) => (
                <button
                  type="button"
                  key={m.id}
                  onClick={() => setBoostType(m.id as any)}
                  className={`flex items-center justify-between rounded-xl border p-2.5 text-xs font-bold transition-all cursor-pointer ${
                    boostType === m.id
                      ? 'border-[#fbbf24] bg-[#2a220f] text-[#fbbf24]'
                      : 'border-[#333333] bg-[#222222] text-[#cccccc]'
                  }`}
                >
                  <span>{m.label}</span>
                  <span className="text-[10px] text-[#888888] font-normal">{m.price}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between text-xs font-bold text-[#aaaaaa] mb-1">
              <span>Количество:</span>
              <span className="text-white">{boostAmount.toLocaleString('ru-RU')}</span>
            </div>
            <input
              type="number"
              min={1}
              value={boostAmount}
              onChange={(e) => setBoostAmount(Math.max(1, parseInt(e.target.value) || 0))}
              className="w-full rounded-xl border border-[#3f3f3f] bg-[#222222] p-2.5 text-sm text-white outline-none"
            />
          </div>

          <div className="flex items-center justify-between rounded-xl bg-[#222222] p-3 border border-[#333333]">
            <span className="text-xs text-[#888888]">Стоимость:</span>
            <span className="text-base font-black text-[#fbbf24]">{formatMoney(currentPrice)}</span>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl bg-[#2a2a2a] py-2.5 text-xs font-bold text-[#cccccc] hover:bg-[#333333] cursor-pointer"
            >
              Закрыть
            </button>
            <button
              type="submit"
              className="flex-1 rounded-xl bg-[#065fd4] hover:bg-[#0056b3] py-2.5 text-xs font-bold text-white shadow-lg transition-all active:scale-95 cursor-pointer"
            >
              Накрутить
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

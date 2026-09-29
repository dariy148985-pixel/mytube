import React, { useState, useRef } from 'react';
import {
  X,
  Upload,
  Image as ImageIcon,
  Palette,
  Check,
  User,
  Sparkles,
  Camera,
  Trash2,
  ExternalLink,
} from 'lucide-react';
import { Channel } from '../types';

interface ChannelCustomizationModalProps {
  channel: Channel;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updated: Partial<Channel>) => void;
  initialTab?: 'banner' | 'avatar' | 'info';
}

const BANNER_PRESETS = [
  {
    name: 'Кисельчик Золото',
    url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80',
    color: '#b45309',
  },
  {
    name: 'Майнкрафт & Закат',
    url: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1200&auto=format&fit=crop&q=80',
    color: '#047857',
  },
  {
    name: 'Киберпанк & Неон',
    url: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1200&auto=format&fit=crop&q=80',
    color: '#7c3aed',
  },
  {
    name: 'Гейминг Red Dragon',
    url: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1200&auto=format&fit=crop&q=80',
    color: '#dc2626',
  },
  {
    name: 'Космос & Галактика',
    url: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?w=1200&auto=format&fit=crop&q=80',
    color: '#1e3a8a',
  },
  {
    name: 'ЭЙР Эстетика',
    url: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=1200&auto=format&fit=crop&q=80',
    color: '#0369a1',
  },
  {
    name: 'Dark Studio Pro',
    url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&auto=format&fit=crop&q=80',
    color: '#1e293b',
  },
];

const AVATAR_PRESETS = [
  {
    name: 'Крутой Геймер',
    url: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=400&auto=format&fit=crop&q=80',
    color: '#2563eb',
  },
  {
    name: 'Неоновый Кот',
    url: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400&auto=format&fit=crop&q=80',
    color: '#9333ea',
  },
  {
    name: 'Майнкрафт Герой',
    url: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=400&auto=format&fit=crop&q=80',
    color: '#16a34a',
  },
  {
    name: 'Огненный Лев',
    url: 'https://images.unsplash.com/photo-1546182990-dffeafbe841d?w=400&auto=format&fit=crop&q=80',
    color: '#ea580c',
  },
  {
    name: 'Кибер Агент',
    url: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=400&auto=format&fit=crop&q=80',
    color: '#0284c7',
  },
  {
    name: 'Золотая Звезда',
    url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400&auto=format&fit=crop&q=80',
    color: '#eab308',
  },
];

const COLOR_PALETTE = [
  '#ef4444', // Red
  '#f97316', // Orange
  '#f59e0b', // Amber (Kiselchik)
  '#10b981', // Emerald
  '#06b6d4', // Cyan
  '#3b82f6', // Blue
  '#6366f1', // Indigo
  '#8b5cf6', // Violet
  '#ec4899', // Pink
  '#1e293b', // Dark Slate
  '#172554', // Dark Blue
  '#052e16', // Dark Green
];

export const ChannelCustomizationModal: React.FC<ChannelCustomizationModalProps> = ({
  channel,
  isOpen,
  onClose,
  onSave,
  initialTab = 'banner',
}) => {
  const [activeTab, setActiveTab] = useState<'banner' | 'avatar' | 'info'>(initialTab);

  const [bannerUrl, setBannerUrl] = useState(channel.bannerUrl || '');
  const [bannerColor, setBannerColor] = useState(channel.bannerColor || '#1e293b');

  const [avatarUrl, setAvatarUrl] = useState(channel.avatarUrl || '');
  const [avatarColor, setAvatarColor] = useState(channel.avatarColor || '#6200ee');

  const [name, setName] = useState(channel.name);
  const [handle, setHandle] = useState(channel.handle);
  const [desc, setDesc] = useState(channel.desc);

  const bannerFileInputRef = useRef<HTMLInputElement>(null);
  const avatarFileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleBannerFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setBannerUrl(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAvatarFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setAvatarUrl(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      bannerUrl: bannerUrl.trim() || undefined,
      bannerColor,
      avatarUrl: avatarUrl.trim() || undefined,
      avatarColor,
      name: name.trim() || channel.name,
      handle: handle.trim().startsWith('@') ? handle.trim() : `@${handle.trim()}`,
      desc: desc.trim(),
    });
    onClose();
  };

  const channelInitial = (name || 'U')[0].toUpperCase();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-2xl rounded-3xl border border-[#333333] bg-[#1a1a1a] shadow-2xl flex flex-col my-8 max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#2d2d2d] px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#ff0000]/20 text-[#ff4444]">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white">Оформление и апгрейд канала</h2>
              <p className="text-xs text-[#888888]">
                Настройте баннер, аватарку и информацию как у топовых блогеров!
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-[#888888] hover:bg-[#2d2d2d] hover:text-white transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Live Channel Preview Box */}
        <div className="px-6 pt-5">
          <div className="text-[11px] font-bold text-[#aaaaaa] uppercase tracking-wider mb-2 flex items-center justify-between">
            <span>Предпросмотр канала</span>
            <span className="text-[10px] text-[#3ea6ff]">Живое отображение</span>
          </div>
          <div className="relative overflow-hidden rounded-2xl border border-[#333333] bg-[#121212]">
            {/* Banner Preview */}
            <div
              className="relative h-28 w-full overflow-hidden"
              style={{
                background: bannerUrl
                  ? `url(${bannerUrl}) center/cover no-repeat`
                  : `linear-gradient(135deg, ${bannerColor}, #0f172a)`,
              }}
            >
              <div className="absolute inset-0 bg-black/25" />
              {bannerUrl && (
                <button
                  type="button"
                  onClick={() => setBannerUrl('')}
                  className="absolute top-2 right-2 flex items-center gap-1 rounded-full bg-black/60 px-2 py-1 text-[10px] font-bold text-white hover:bg-red-600 transition-colors cursor-pointer"
                  title="Удалить баннер"
                >
                  <Trash2 className="h-3 w-3" />
                  <span>Удалить баннер</span>
                </button>
              )}
            </div>

            {/* Profile Row Preview */}
            <div className="px-4 pb-4 pt-2 flex items-end justify-between gap-3">
              <div className="flex items-center gap-3 -mt-8">
                {/* Avatar Preview */}
                <div
                  className="relative flex h-16 w-16 shrink-0 items-center justify-center rounded-full text-2xl font-black text-white shadow-xl border-2 border-[#121212] overflow-hidden"
                  style={{ backgroundColor: avatarColor }}
                >
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt={name}
                      className="h-full w-full object-cover"
                      onError={() => setAvatarUrl('')}
                    />
                  ) : (
                    channelInitial
                  )}
                </div>

                <div className="mt-6">
                  <div className="text-sm font-black text-white flex items-center gap-1.5">
                    <span>{name || 'Мой Канал'}</span>
                    {channel.verified && (
                      <span className="text-[#3ea6ff] font-bold text-xs" title="Верифицирован">✓</span>
                    )}
                  </div>
                  <div className="text-[11px] text-[#888888]">
                    {handle || '@channel'} • {channel.subscribers.toLocaleString('ru-RU')} подписчиков
                  </div>
                </div>
              </div>

              <div className="text-right">
                <span className="rounded-full bg-[#272727] px-3 py-1 text-[11px] font-bold text-[#aaaaaa]">
                  Кнопка «Подписаться»
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-4 flex border-b border-[#2d2d2d] px-6 gap-4 text-xs font-bold text-[#aaaaaa]">
          <button
            type="button"
            onClick={() => setActiveTab('banner')}
            className={`flex items-center gap-1.5 pb-2.5 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'banner'
                ? 'border-[#ff0000] text-white'
                : 'border-transparent hover:text-white'
            }`}
          >
            <ImageIcon className="h-4 w-4" />
            <span>Баннер (Шапка)</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('avatar')}
            className={`flex items-center gap-1.5 pb-2.5 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'avatar'
                ? 'border-[#ff0000] text-white'
                : 'border-transparent hover:text-white'
            }`}
          >
            <Camera className="h-4 w-4" />
            <span>Аватарка (Иконка)</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('info')}
            className={`flex items-center gap-1.5 pb-2.5 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'info'
                ? 'border-[#ff0000] text-white'
                : 'border-transparent hover:text-white'
            }`}
          >
            <User className="h-4 w-4" />
            <span>Инфо о канале</span>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* TAB 1: BANNER */}
          {activeTab === 'banner' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-white mb-1.5">
                  1. Загрузить свою картинку для баннера
                </label>
                <div className="flex gap-2">
                  <input
                    type="file"
                    ref={bannerFileInputRef}
                    onChange={handleBannerFileSelect}
                    accept="image/*"
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => bannerFileInputRef.current?.click()}
                    className="flex items-center gap-2 rounded-xl bg-[#2a2a2a] hover:bg-[#383838] px-4 py-2.5 text-xs font-bold text-white transition-colors border border-[#3f3f3f] cursor-pointer"
                  >
                    <Upload className="h-4 w-4 text-[#3ea6ff]" />
                    <span>Выбрать файл с устройства</span>
                  </button>

                  {bannerUrl && (
                    <button
                      type="button"
                      onClick={() => setBannerUrl('')}
                      className="rounded-xl bg-[#3b1212] px-3 py-2.5 text-xs font-bold text-[#ef4444] hover:bg-[#521818] transition-colors border border-[#ef4444]/30 cursor-pointer"
                    >
                      Сбросить баннер
                    </button>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-white mb-1.5">
                  Или вставьте ссылку на изображение баннера (URL):
                </label>
                <input
                  type="url"
                  value={bannerUrl}
                  onChange={(e) => setBannerUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/... или любая прямая ссылка"
                  className="w-full rounded-xl border border-[#3a3a3a] bg-[#121212] px-3.5 py-2 text-xs text-white placeholder-[#666666] outline-none focus:border-[#3ea6ff]"
                />
              </div>

              {/* Ready Presets for Banner */}
              <div>
                <label className="block text-xs font-bold text-white mb-1.5 flex items-center justify-between">
                  <span>Готовые стильные пресеты баннеров:</span>
                  <span className="text-[11px] text-[#fbbf24]">Нажмите, чтобы применить</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {BANNER_PRESETS.map((p) => (
                    <button
                      key={p.name}
                      type="button"
                      onClick={() => {
                        setBannerUrl(p.url);
                        setBannerColor(p.color);
                      }}
                      className={`group relative h-16 rounded-xl overflow-hidden border text-left p-2 transition-all cursor-pointer ${
                        bannerUrl === p.url
                          ? 'border-[#3ea6ff] ring-2 ring-[#3ea6ff]/50'
                          : 'border-[#333333] hover:border-white'
                      }`}
                      style={{
                        background: `url(${p.url}) center/cover no-repeat`,
                      }}
                    >
                      <div className="absolute inset-0 bg-black/50 group-hover:bg-black/30 transition-colors" />
                      <div className="relative z-10 flex h-full items-end">
                        <span className="text-[10px] font-black text-white drop-shadow">
                          {p.name}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Banner Color Picker */}
              <div>
                <label className="block text-xs font-bold text-white mb-1.5 flex items-center gap-1.5">
                  <Palette className="h-3.5 w-3.5 text-[#fbbf24]" />
                  <span>Цвет подложки и градиента баннера</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {COLOR_PALETTE.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setBannerColor(c)}
                      className={`h-7 w-7 rounded-full transition-all cursor-pointer ${
                        bannerColor === c ? 'ring-2 ring-white scale-110' : 'opacity-80 hover:opacity-100'
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: AVATAR */}
          {activeTab === 'avatar' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-white mb-1.5">
                  1. Загрузить свою аватарку (фото / логотип)
                </label>
                <div className="flex gap-2">
                  <input
                    type="file"
                    ref={avatarFileInputRef}
                    onChange={handleAvatarFileSelect}
                    accept="image/*"
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => avatarFileInputRef.current?.click()}
                    className="flex items-center gap-2 rounded-xl bg-[#2a2a2a] hover:bg-[#383838] px-4 py-2.5 text-xs font-bold text-white transition-colors border border-[#3f3f3f] cursor-pointer"
                  >
                    <Upload className="h-4 w-4 text-[#4ade80]" />
                    <span>Выбрать картинку с устройства</span>
                  </button>

                  {avatarUrl && (
                    <button
                      type="button"
                      onClick={() => setAvatarUrl('')}
                      className="rounded-xl bg-[#3b1212] px-3 py-2.5 text-xs font-bold text-[#ef4444] hover:bg-[#521818] transition-colors border border-[#ef4444]/30 cursor-pointer"
                    >
                      Использовать букву
                    </button>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-white mb-1.5">
                  Или вставьте ссылку на аватарку (URL):
                </label>
                <input
                  type="url"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/... прямая ссылка на фото"
                  className="w-full rounded-xl border border-[#3a3a3a] bg-[#121212] px-3.5 py-2 text-xs text-white placeholder-[#666666] outline-none focus:border-[#3ea6ff]"
                />
              </div>

              {/* Ready Presets for Avatar */}
              <div>
                <label className="block text-xs font-bold text-white mb-1.5 flex items-center justify-between">
                  <span>Готовые крутые иконки аватарок:</span>
                  <span className="text-[11px] text-[#fbbf24]">Кликните для выбора</span>
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5">
                  {AVATAR_PRESETS.map((p) => (
                    <button
                      key={p.name}
                      type="button"
                      onClick={() => {
                        setAvatarUrl(p.url);
                        setAvatarColor(p.color);
                      }}
                      className={`group flex flex-col items-center gap-1 rounded-2xl p-2 border transition-all cursor-pointer ${
                        avatarUrl === p.url
                          ? 'border-[#3ea6ff] bg-[#3ea6ff]/10 ring-2 ring-[#3ea6ff]'
                          : 'border-[#333333] bg-[#222222] hover:border-white'
                      }`}
                    >
                      <div className="h-12 w-12 rounded-full overflow-hidden border border-white/20">
                        <img src={p.url} alt={p.name} className="h-full w-full object-cover" />
                      </div>
                      <span className="text-[10px] font-bold text-white text-center leading-tight truncate w-full">
                        {p.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Avatar Background Color Picker */}
              <div>
                <label className="block text-xs font-bold text-white mb-1.5 flex items-center gap-1.5">
                  <Palette className="h-3.5 w-3.5 text-[#3ea6ff]" />
                  <span>Цвет фона аватарки (если используется буква или прозрачность)</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {COLOR_PALETTE.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setAvatarColor(c)}
                      className={`h-7 w-7 rounded-full transition-all cursor-pointer ${
                        avatarColor === c ? 'ring-2 ring-white scale-110' : 'opacity-80 hover:opacity-100'
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: INFO */}
          {activeTab === 'info' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-white mb-1.5">
                  Название канала:
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Название канала"
                  className="w-full rounded-xl border border-[#3a3a3a] bg-[#121212] px-3.5 py-2 text-xs text-white placeholder-[#666666] outline-none focus:border-[#3ea6ff]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-white mb-1.5">
                  Юзернейм (@handle):
                </label>
                <input
                  type="text"
                  value={handle}
                  onChange={(e) => setHandle(e.target.value)}
                  placeholder="@my_channel"
                  className="w-full rounded-xl border border-[#3a3a3a] bg-[#121212] px-3.5 py-2 text-xs text-white placeholder-[#666666] outline-none focus:border-[#3ea6ff]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-white mb-1.5">
                  Описание канала:
                </label>
                <textarea
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  rows={3}
                  placeholder="Расскажите зрителям о чём ваш канал..."
                  className="w-full rounded-xl border border-[#3a3a3a] bg-[#121212] px-3.5 py-2 text-xs text-white placeholder-[#666666] outline-none focus:border-[#3ea6ff] resize-none"
                />
              </div>
            </div>
          )}

          {/* Footer Save Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#2d2d2d]">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl px-4 py-2 text-xs font-bold text-[#aaaaaa] hover:bg-[#2a2a2a] hover:text-white transition-colors cursor-pointer"
            >
              Отмена
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 rounded-xl bg-[#3ea6ff] hover:bg-[#65b8ff] px-5 py-2 text-xs font-bold text-[#0f0f0f] shadow-lg transition-all active:scale-95 cursor-pointer"
            >
              <Check className="h-4 w-4" />
              <span>Сохранить оформление</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

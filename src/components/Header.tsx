import React, { useState, useRef, useEffect } from 'react';
import {
  Menu,
  Search,
  Mic,
  Bell,
  X,
  Play,
  DollarSign,
  Rocket,
  Plus,
  Trash2,
  Check,
  CheckCircle2,
  Calendar,
  Clock
} from 'lucide-react';
import { Channel, NotificationItem, PageView } from '../types';
import { formatMoney } from '../services/simulationEngine';
import { ConfirmModal } from './ConfirmModal';

interface HeaderProps {
  currentChannel: Channel | null;
  channels: Channel[];
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  onSearchSubmit: (q: string) => void;
  currentPage: PageView;
  setCurrentPage: (page: PageView) => void;
  onOpenUpload: () => void;
  onOpenBoost: () => void;
  onOpenChannelModal: () => void;
  onSelectChannel: (channelId: string) => void;
  onDeleteCurrentChannel: () => void;
  toggleSidebar: () => void;
  simulationSpeed: number;
  setSimulationSpeed: (speed: number) => void;
  notifications: NotificationItem[];
  markNotificationsAsRead: () => void;
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
  onRestartPremieres: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentChannel,
  channels,
  searchQuery,
  setSearchQuery,
  onSearchSubmit,
  currentPage,
  setCurrentPage,
  onOpenUpload,
  onOpenBoost,
  onOpenChannelModal,
  onSelectChannel,
  onDeleteCurrentChannel,
  toggleSidebar,
  simulationSpeed,
  setSimulationSpeed,
  notifications,
  markNotificationsAsRead,
  onRestartPremieres,
}) => {
  const [showChannelMenu, setShowChannelMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [showVoiceTooltip, setShowVoiceTooltip] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const channelMenuRef = useRef<HTMLDivElement>(null);
  const notifMenuRef = useRef<HTMLDivElement>(null);
  const speedMenuRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (channelMenuRef.current && !channelMenuRef.current.contains(e.target as Node)) {
        setShowChannelMenu(false);
      }
      if (notifMenuRef.current && !notifMenuRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
      if (speedMenuRef.current && !speedMenuRef.current.contains(e.target as Node)) {
        setShowSpeedMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      onSearchSubmit(searchQuery);
    }
  };

  const channelInitial = currentChannel?.name ? currentChannel.name[0].toUpperCase() : 'U';

  return (
    <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-[#272727] bg-[#0f0f0f] px-3 md:px-4 text-white">
      {/* Left section: Hamburger & Logo */}
      <div className="flex items-center gap-3 md:gap-4">
        <button
          id="btn-sidebar-toggle"
          onClick={toggleSidebar}
          aria-label="Главное меню"
          className="rounded-full p-2 hover:bg-[#272727] active:bg-[#3f3f3f] transition-colors cursor-pointer"
        >
          <Menu className="h-5 w-5 text-[#f1f1f1]" />
        </button>

        <div
          id="logo-brand"
          onClick={() => setCurrentPage('home')}
          className="flex cursor-pointer items-center gap-1 font-bold text-lg md:text-xl tracking-tight select-none group"
        >
          <div className="flex h-7 w-9 items-center justify-center rounded-lg bg-[#ff0000] text-white shadow-sm group-hover:bg-[#cc0000] transition-colors">
            <Play className="h-4 w-4 fill-white translate-x-0.5" />
          </div>
          <span className="font-black tracking-tighter text-xl">MY</span>
          <span className="text-[#f1f1f1] font-semibold text-lg">Tube</span>
          <span className="hidden sm:inline-block ml-1 rounded bg-[#272727] px-1.5 py-0.5 text-[10px] font-medium text-[#aaaaaa]">
            RU
          </span>
        </div>
      </div>

      {/* Center section: Search Bar */}
      <div className="flex flex-1 max-w-[620px] items-center justify-center px-2 md:px-6">
        <div className="flex w-full items-center">
          <div className="relative flex w-full items-center rounded-l-full border border-[#303030] bg-[#121212] focus-within:border-[#1c62b9] focus-within:ring-1 focus-within:ring-[#1c62b9]">
            <input
              id="search-input-header"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearchKey}
              placeholder="Введите запрос для поиска видео или каналов..."
              className="w-full bg-transparent px-4 py-2 text-sm text-[#f1f1f1] placeholder-[#888888] outline-none"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="p-1.5 text-[#aaaaaa] hover:text-white cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <button
            id="btn-search-execute"
            onClick={() => onSearchSubmit(searchQuery)}
            aria-label="Искать"
            className="flex h-[38px] w-14 items-center justify-center rounded-r-full border border-l-0 border-[#303030] bg-[#222222] hover:bg-[#272727] transition-colors cursor-pointer"
          >
            <Search className="h-4 w-4 text-[#aaaaaa]" />
          </button>

          <div className="relative ml-2 hidden sm:block">
            <button
              id="btn-voice-search"
              onClick={() => setShowVoiceTooltip(!showVoiceTooltip)}
              aria-label="Голосовой поиск"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-[#222222] hover:bg-[#272727] transition-colors cursor-pointer"
            >
              <Mic className="h-4 w-4 text-[#f1f1f1]" />
            </button>
            {showVoiceTooltip && (
              <div className="absolute top-12 left-1/2 -translate-x-1/2 z-50 w-48 rounded-lg bg-[#282828] p-2 text-center text-xs text-[#f1f1f1] shadow-xl border border-[#3f3f3f]">
                Голосовой поиск активен в MYTube
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right section: Actions, Balance, Notifications, Profile */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* Restart Premieres Button */}
        <button
          onClick={onRestartPremieres}
          title="Перезапустить таймеры премьер заново"
          className="hidden xl:flex items-center gap-1.5 rounded-full bg-[#222222] px-2.5 py-1 text-xs font-semibold text-[#fbbf24] border border-[#333333] hover:bg-[#2a2a2a] transition-all cursor-pointer"
        >
          <Clock className="h-3.5 w-3.5 text-[#fbbf24]" />
          <span>Перезапуск премьер</span>
        </button>

        {/* Simulator Speed controller */}
        <div className="relative hidden md:block" ref={speedMenuRef}>
          <button
            id="btn-speed-toggle"
            onClick={() => setShowSpeedMenu(!showSpeedMenu)}
            title="Скорость симуляции роста канала"
            className="flex items-center gap-1 rounded-full bg-[#1f1f1f] px-2.5 py-1 text-xs font-semibold text-[#aaaaaa] hover:bg-[#2a2a2a] hover:text-white transition-colors border border-[#333333] cursor-pointer"
          >
            <span>{simulationSpeed === 0 ? '⏸ Пауза' : `⚡ ${simulationSpeed}x`}</span>
          </button>
          {showSpeedMenu && (
            <div className="absolute right-0 top-10 w-36 rounded-xl border border-[#333333] bg-[#212121] py-1 shadow-2xl z-50 text-xs">
              <div className="px-3 py-1.5 font-bold text-[#888888] uppercase tracking-wider text-[10px]">
                Скорость симулятора
              </div>
              {[
                { label: 'Пауза (0x)', val: 0 },
                { label: 'Нормальная (1x)', val: 1 },
                { label: 'Ускоренная (2x)', val: 2 },
                { label: 'Турбо (5x)', val: 5 },
                { label: 'Максимум (10x)', val: 10 },
              ].map((item) => (
                <button
                  key={item.val}
                  onClick={() => {
                    setSimulationSpeed(item.val);
                    setShowSpeedMenu(false);
                  }}
                  className={`flex w-full items-center justify-between px-3 py-2 text-left hover:bg-[#2d2d2d] transition-colors cursor-pointer ${
                    simulationSpeed === item.val ? 'text-[#ff0000] font-bold' : 'text-[#f1f1f1]'
                  }`}
                >
                  <span>{item.label}</span>
                  {simulationSpeed === item.val && <Check className="h-3 w-3" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Channel Balance Pill */}
        {currentChannel && (
          <div
            id="header-balance-pill"
            onClick={() => setCurrentPage('studio')}
            title="Баланс канала (нажмите для перехода в Творческую студию)"
            className="flex cursor-pointer items-center gap-1.5 rounded-full bg-[#183424] px-2.5 py-1 text-xs font-bold text-[#4ade80] border border-[#235836] hover:bg-[#1f4730] transition-colors shadow-sm"
          >
            <DollarSign className="h-3.5 w-3.5 text-[#4ade80]" />
            <span className="whitespace-nowrap">{formatMoney(currentChannel.balance)}</span>
          </div>
        )}

        {/* Quick Boost */}
        <button
          id="btn-header-boost"
          onClick={onOpenBoost}
          title="Накрутить просмотры, лайки, подписчиков"
          className="hidden sm:flex items-center gap-1.5 rounded-full bg-gradient-to-r from-[#eab308]/20 to-[#f59e0b]/20 px-3 py-1.5 text-xs font-bold text-[#fbbf24] border border-[#d97706]/40 hover:bg-[#f59e0b]/30 transition-all active:scale-95 cursor-pointer"
        >
          <Rocket className="h-3.5 w-3.5" />
          <span>Накрутка</span>
        </button>

        {/* Create / Upload Video */}
        <button
          id="btn-header-upload"
          onClick={onOpenUpload}
          title="Загрузить видео на канал (до 2 ГБ)"
          className="flex items-center gap-1 rounded-full bg-[#272727] px-2.5 sm:px-3 py-1.5 text-xs sm:text-sm font-semibold text-[#f1f1f1] hover:bg-[#383838] transition-colors cursor-pointer"
        >
          <Plus className="h-4 w-4 text-[#ff0000]" />
          <span className="hidden sm:inline">Создать</span>
        </button>

        {/* Notifications */}
        <div className="relative" ref={notifMenuRef}>
          <button
            id="btn-notifications-toggle"
            onClick={() => {
              setShowNotifications(!showNotifications);
              if (!showNotifications) markNotificationsAsRead();
            }}
            aria-label="Уведомления"
            className="relative rounded-full p-2 hover:bg-[#272727] transition-colors cursor-pointer"
          >
            <Bell className="h-5 w-5 text-[#f1f1f1]" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#cc0000] text-[10px] font-bold text-white">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 top-12 w-80 sm:w-96 rounded-2xl border border-[#333333] bg-[#212121] py-2 shadow-2xl z-50">
              <div className="flex items-center justify-between border-b border-[#333333] px-4 pb-2">
                <h3 className="text-sm font-bold text-white">Уведомления & Премьеры</h3>
                <span className="text-xs text-[#aaaaaa]">Всего: {notifications.length}</span>
              </div>
              <div className="max-h-80 overflow-y-auto divide-y divide-[#2a2a2a]">
                {notifications.length === 0 ? (
                  <div className="py-8 text-center text-xs text-[#888888]">
                    Уведомлений пока нет. Премьеры блогеров скоро появятся!
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <div key={notif.id} className="p-3 hover:bg-[#2b2b2b] transition-colors">
                      <div className="text-xs font-bold text-white">{notif.title}</div>
                      <div className="mt-0.5 text-xs text-[#cccccc] leading-relaxed">
                        {notif.message}
                      </div>
                      <div className="mt-1 text-[10px] text-[#888888]">{notif.time}</div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Channel Avatar & Menu */}
        <div className="relative" ref={channelMenuRef}>
          <button
            id="btn-user-channel-avatar"
            onClick={() => setShowChannelMenu(!showChannelMenu)}
            aria-label="Профиль канала"
            className="flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold text-white shadow transition-transform active:scale-95 border-2 border-transparent hover:border-[#ff0000] cursor-pointer overflow-hidden"
            style={{ backgroundColor: currentChannel?.avatarColor || '#6200ee' }}
          >
            {currentChannel?.avatarUrl ? (
              <img src={currentChannel.avatarUrl} alt={currentChannel.name} className="h-full w-full object-cover" />
            ) : (
              channelInitial
            )}
          </button>

          {showChannelMenu && (
            <div className="absolute right-0 top-11 w-72 rounded-2xl border border-[#333333] bg-[#212121] p-3 shadow-2xl z-50 text-sm">
              {currentChannel ? (
                <div className="flex items-center gap-3 border-b border-[#333333] pb-3">
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-full text-base font-bold text-white overflow-hidden shrink-0"
                    style={{ backgroundColor: currentChannel.avatarColor || '#6200ee' }}
                  >
                    {currentChannel.avatarUrl ? (
                      <img src={currentChannel.avatarUrl} alt={currentChannel.name} className="h-full w-full object-cover" />
                    ) : (
                      channelInitial
                    )}
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <div className="flex items-center gap-1 font-bold text-[#f1f1f1] truncate">
                      <span>{currentChannel.name}</span>
                      {currentChannel.verified && (
                        <CheckCircle2 className="h-3.5 w-3.5 text-[#3ea6ff] inline shrink-0" />
                      )}
                    </div>
                    <div className="text-xs text-[#aaaaaa] truncate">{currentChannel.handle}</div>
                    <div className="text-[11px] text-[#4ade80] font-medium mt-0.5">
                      {currentChannel.subscribers.toLocaleString('ru-RU')} подписчиков
                    </div>
                  </div>
                </div>
              ) : (
                <div className="border-b border-[#333333] pb-3 text-xs text-[#aaaaaa]">
                  Канал не выбран
                </div>
              )}

              <div className="py-2 space-y-1">
                <button
                  onClick={() => {
                    setCurrentPage('channel');
                    setShowChannelMenu(false);
                  }}
                  className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left hover:bg-[#2d2d2d] transition-colors cursor-pointer"
                >
                  <span>👤</span>
                  <span>Мой канал</span>
                </button>

                <button
                  onClick={() => {
                    setCurrentPage('studio');
                    setShowChannelMenu(false);
                  }}
                  className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left hover:bg-[#2d2d2d] transition-colors cursor-pointer"
                >
                  <span>🎬</span>
                  <div className="flex flex-1 items-center justify-between">
                    <span>Творческая студия</span>
                    {currentChannel?.monetization.connected && (
                      <span className="rounded bg-[#1e4620] px-1.5 py-0.5 text-[10px] text-[#4ade80] font-bold">
                        Монетизация ✓
                      </span>
                    )}
                  </div>
                </button>

                <button
                  onClick={() => {
                    onOpenBoost();
                    setShowChannelMenu(false);
                  }}
                  className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left hover:bg-[#2d2d2d] transition-colors text-[#fbbf24] cursor-pointer"
                >
                  <Rocket className="h-4 w-4" />
                  <span>Накрутка / Продвижение</span>
                </button>

                <button
                  onClick={() => {
                    onOpenChannelModal();
                    setShowChannelMenu(false);
                  }}
                  className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left hover:bg-[#2d2d2d] transition-colors cursor-pointer"
                >
                  <span>🔄</span>
                  <span>Сменить / Создать канал</span>
                </button>

                <div className="pt-2 border-t border-[#333333] mt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowChannelMenu(false);
                      setShowDeleteConfirm(true);
                    }}
                    className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-[#ef4444] hover:bg-[#391717] transition-colors cursor-pointer"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span>Удалить этот канал</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <ConfirmModal
        isOpen={showDeleteConfirm}
        title="Удалить этот канал?"
        message={`Вы уверены, что хотите удалить канал «${currentChannel?.name}»? Все загруженные видео и данные этого канала будут удалены.`}
        confirmText="Да, удалить канал"
        cancelText="Отмена"
        onConfirm={() => {
          onDeleteCurrentChannel();
          setShowDeleteConfirm(false);
        }}
        onClose={() => setShowDeleteConfirm(false)}
      />
    </header>
  );
};

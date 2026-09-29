import React from 'react';
import {
  Home,
  Flame,
  Tv,
  Film,
  User,
  BarChart3,
  PlusCircle,
  FileVideo
} from 'lucide-react';
import { Channel, PageView } from '../types';

interface SidebarProps {
  currentPage: PageView;
  setCurrentPage: (page: PageView) => void;
  isExpanded: boolean;
  currentChannel: Channel | null;
  channels: Channel[];
  onSelectChannel: (id: string) => void;
  onOpenChannelModal: () => void;
  onOpenUpload: () => void;
  onOpenMyChannel?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentPage,
  setCurrentPage,
  isExpanded,
  currentChannel,
  channels,
  onSelectChannel,
  onOpenChannelModal,
  onOpenUpload,
  onOpenMyChannel,
}) => {
  const mainNavItems = [
    { id: 'home', label: 'Главная', icon: Home },
    { id: 'shorts', label: 'Shorts', icon: Film },
    { id: 'subscriptions', label: 'Подписки', icon: Tv },
    { id: 'trending', label: 'В тренде', icon: Flame },
  ];

  const channelNavItems = [
    { id: 'channel', label: 'Мой канал', icon: User },
    { id: 'studio', label: 'Студия & Монетизация', icon: BarChart3 },
  ];

  if (!isExpanded) {
    return (
      <aside className="fixed left-0 top-14 bottom-0 z-30 hidden w-[72px] flex-col items-center bg-[#0f0f0f] py-3 text-white sm:flex border-r border-[#222222]">
        <div className="flex flex-col gap-5 w-full items-center">
          {mainNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                id={`sidebar-compact-${item.id}`}
                onClick={() => setCurrentPage(item.id as PageView)}
                className={`flex flex-col items-center justify-center gap-1.5 w-[64px] py-3 rounded-xl transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#272727] text-white font-bold'
                    : 'text-[#aaaaaa] hover:bg-[#202020] hover:text-white'
                }`}
              >
                <Icon className={`h-5 w-5 ${isActive ? 'text-[#ff0000]' : ''}`} />
                <span className="text-[10px] tracking-tight">{item.label}</span>
              </button>
            );
          })}

          <div className="h-[1px] w-8 bg-[#272727] my-1" />

          <button
            id="sidebar-compact-studio"
            onClick={() => setCurrentPage('studio')}
            title="Творческая студия"
            className={`flex flex-col items-center justify-center gap-1.5 w-[64px] py-3 rounded-xl transition-all cursor-pointer ${
              currentPage === 'studio'
                ? 'bg-[#272727] text-[#4ade80] font-bold'
                : 'text-[#aaaaaa] hover:bg-[#202020] hover:text-white'
            }`}
          >
            <BarChart3 className="h-5 w-5" />
            <span className="text-[10px]">Студия</span>
          </button>
        </div>
      </aside>
    );
  }

  return (
    <aside className="fixed left-0 top-14 bottom-0 z-30 flex w-60 flex-col overflow-y-auto bg-[#0f0f0f] px-3 py-3 text-white border-r border-[#222222] scrollbar-thin scrollbar-thumb-[#333333]">
      {/* Main navigation */}
      <div className="space-y-1">
        {mainNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          return (
            <button
              key={item.id}
              id={`sidebar-nav-${item.id}`}
              onClick={() => setCurrentPage(item.id as PageView)}
              className={`flex w-full items-center gap-5 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors cursor-pointer ${
                isActive
                  ? 'bg-[#272727] text-white font-bold'
                  : 'text-[#f1f1f1] hover:bg-[#222222]'
              }`}
            >
              <Icon className={`h-5 w-5 ${isActive ? 'text-[#ff0000]' : 'text-[#f1f1f1]'}`} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      <div className="my-3 h-[1px] bg-[#272727]" />

      {/* Creator Channel Section */}
      <div className="space-y-1">
        <div className="px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#aaaaaa]">
          Ваш контент
        </div>

        {channelNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          return (
            <button
              key={item.id}
              id={`sidebar-channel-${item.id}`}
              onClick={() => {
                if (item.id === 'channel' && onOpenMyChannel) {
                  onOpenMyChannel();
                } else {
                  setCurrentPage(item.id as PageView);
                }
              }}
              className={`flex w-full items-center gap-5 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors cursor-pointer ${
                isActive
                  ? 'bg-[#272727] text-white font-bold'
                  : 'text-[#f1f1f1] hover:bg-[#222222]'
              }`}
            >
              <Icon className={`h-5 w-5 ${isActive ? 'text-[#4ade80]' : 'text-[#f1f1f1]'}`} />
              <span>{item.label}</span>
            </button>
          );
        })}

        <button
          onClick={onOpenUpload}
          className="flex w-full items-center gap-5 rounded-xl px-3 py-2.5 text-sm font-medium text-[#f1f1f1] hover:bg-[#222222] transition-colors cursor-pointer"
        >
          <FileVideo className="h-5 w-5 text-[#ff0000]" />
          <span>Загрузить видео (до 2 ГБ)</span>
        </button>
      </div>

      <div className="my-3 h-[1px] bg-[#272727]" />

      {/* Channels List */}
      <div className="space-y-1">
        <div className="flex items-center justify-between px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#aaaaaa]">
          <span>Каналы</span>
          <button
            onClick={onOpenChannelModal}
            title="Добавить или сменить канал"
            className="hover:text-white cursor-pointer"
          >
            <PlusCircle className="h-4 w-4" />
          </button>
        </div>

        {channels.map((chan) => {
          const isCurrent = currentChannel?.id === chan.id;
          return (
            <button
              key={chan.id}
              onClick={() => onSelectChannel(chan.id)}
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm transition-colors cursor-pointer ${
                isCurrent ? 'bg-[#222222] font-semibold text-white' : 'text-[#cccccc] hover:bg-[#1a1a1a]'
              }`}
            >
              <div
                className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                style={{ backgroundColor: chan.avatarColor || '#6200ee' }}
              >
                {chan.name ? chan.name[0].toUpperCase() : 'C'}
              </div>
              <div className="flex-1 truncate">
                <div className="truncate text-xs">{chan.name}</div>
                <div className="text-[10px] text-[#888888]">
                  {chan.subscribers.toLocaleString('ru-RU')} подп.
                </div>
              </div>
              {isCurrent && <div className="h-2 w-2 rounded-full bg-[#ff0000]" />}
            </button>
          );
        })}
      </div>

      <div className="my-3 h-[1px] bg-[#272727]" />

      {/* Simulator Quick Status */}
      <div className="rounded-xl bg-[#181818] p-3 text-xs text-[#aaaaaa] border border-[#272727] space-y-2 mt-auto">
        <div className="flex items-center justify-between font-bold text-white">
          <span>🎮 MYTube Премьеры</span>
          <span className="text-[10px] bg-[#2a2a2a] px-1.5 py-0.5 rounded text-[#4ade80]">
            РАБОТАЕТ
          </span>
        </div>
        <p className="text-[11px] leading-relaxed text-[#999999]">
          Все каналы выпускают свои видео в разное время (А4, Кисельчик, Компот и др.). При перезагрузке премьеры стартуют заново!
        </p>
      </div>
    </aside>
  );
};

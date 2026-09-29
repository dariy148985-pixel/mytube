import React, { useState } from 'react';
import { X, Plus, Trash2, Check, Tv } from 'lucide-react';
import { Channel } from '../types';
import { ConfirmModal } from './ConfirmModal';

interface ChannelModalProps {
  isOpen: boolean;
  onClose: () => void;
  channels: Channel[];
  currentChannelId: string;
  onSelectChannel: (channelId: string) => void;
  onCreateChannel: (name: string, desc: string) => void;
  onDeleteChannel: (channelId: string) => void;
}

export const ChannelModal: React.FC<ChannelModalProps> = ({
  isOpen,
  onClose,
  channels,
  currentChannelId,
  onSelectChannel,
  onCreateChannel,
  onDeleteChannel,
}) => {
  const [nameInput, setNameInput] = useState('');
  const [descInput, setDescInput] = useState('');
  const [error, setError] = useState('');
  const [channelToDelete, setChannelToDelete] = useState<Channel | null>(null);

  if (!isOpen) return null;

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameInput.trim()) {
      setError('Введите название канала!');
      return;
    }

    onCreateChannel(nameInput.trim(), descInput.trim());
    setNameInput('');
    setDescInput('');
    setError('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-md rounded-3xl border border-[#333333] bg-[#1a1a1a] p-6 text-white shadow-2xl animate-fade-in max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-[#2d2d2d] pb-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#ff0000] text-white">
              <Tv className="h-4 w-4" />
            </div>
            <h2 className="text-base font-bold">Выбор или создание канала</h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-[#aaaaaa] hover:bg-[#282828] hover:text-white cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-4">
          <h3 className="text-xs font-bold text-[#aaaaaa] uppercase tracking-wider mb-2">
            Все каналы платформы
          </h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {channels.map((chan) => {
              const isSelected = chan.id === currentChannelId;
              const isPlatform = chan.isUserCreated === false;
              return (
                <div
                  key={chan.id}
                  onClick={() => {
                    if (isPlatform) {
                      onSelectChannel(chan.id);
                      onClose();
                      return;
                    }
                    onSelectChannel(chan.id);
                    onClose();
                  }}
                  className={`flex items-center justify-between rounded-xl p-2.5 cursor-pointer border transition-colors ${
                    isSelected
                      ? 'border-[#ff0000] bg-[#291717]'
                      : isPlatform
                      ? 'border-[#2d2d2d] bg-[#1a1a1a] hover:bg-[#252525]'
                      : 'border-[#2d2d2d] bg-[#222222] hover:bg-[#282828]'
                  }`}
                >
                  <div className="flex items-center gap-2.5 overflow-hidden">
                    <div
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white shadow"
                      style={{ backgroundColor: chan.avatarColor || '#6200ee' }}
                    >
                      {chan.name ? chan.name[0].toUpperCase() : 'C'}
                    </div>
                    <div className="truncate">
                      <div className="flex items-center gap-1.5 font-bold text-xs text-white truncate">
                        <span>{chan.name}</span>
                        {isPlatform ? (
                          <span className="rounded bg-[#ff0000]/20 px-1.5 py-0.2 text-[9px] text-[#ff6666] font-semibold">
                            блогер
                          </span>
                        ) : (
                          <span className="rounded bg-[#22c55e]/20 px-1.5 py-0.2 text-[9px] text-[#4ade80] font-semibold">
                            мой
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-[#aaaaaa]">
                        {chan.subscribers.toLocaleString('ru-RU')} подп. • {chan.videos?.length || 0} видео
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {isSelected ? (
                      <span className="flex items-center gap-1 rounded bg-[#ff0000] px-2 py-0.5 text-[10px] font-bold text-white">
                        <Check className="h-3 w-3" /> Активен
                      </span>
                    ) : (
                      <span className="text-[11px] text-[#3ea6ff] hover:underline">
                        Перейти ➔
                      </span>
                    )}

                    {!isPlatform && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setChannelToDelete(chan);
                        }}
                        className="rounded p-1 text-[#aaaaaa] hover:bg-[#391717] hover:text-[#ef4444] transition-colors cursor-pointer"
                        title={`Удалить канал «${chan.name}»`}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="my-5 h-[1px] bg-[#2d2d2d]" />

        {/* Create new channel form */}
        <form onSubmit={handleCreate} className="space-y-3">
          <h3 className="text-xs font-bold text-[#aaaaaa] uppercase tracking-wider">
            Создать новый YouTube-канал
          </h3>

          {error && <div className="text-xs text-[#ef4444] font-semibold">{error}</div>}

          <div>
            <input
              type="text"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              placeholder="Название нового канала..."
              className="w-full rounded-xl border border-[#3f3f3f] bg-[#222222] p-2.5 text-xs text-white outline-none focus:border-[#3ea6ff]"
            />
          </div>

          <div>
            <textarea
              value={descInput}
              onChange={(e) => setDescInput(e.target.value)}
              rows={2}
              placeholder="Краткое описание канала..."
              className="w-full rounded-xl border border-[#3f3f3f] bg-[#222222] p-2.5 text-xs text-white outline-none focus:border-[#3ea6ff]"
            />
          </div>

          <button
            type="submit"
            className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-[#cc0000] hover:bg-[#990000] py-2.5 text-xs font-bold text-white shadow transition-all active:scale-95 cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Создать канал</span>
          </button>
        </form>

        <ConfirmModal
          isOpen={!!channelToDelete}
          title="Удалить канал?"
          message={`Вы уверены, что хотите удалить канал «${channelToDelete?.name}»? Все загруженные видео и данные этого канала будут удалены.`}
          confirmText="Да, удалить"
          cancelText="Отмена"
          onConfirm={() => {
            if (channelToDelete) {
              onDeleteChannel(channelToDelete.id);
              setChannelToDelete(null);
            }
          }}
          onClose={() => setChannelToDelete(null)}
        />
      </div>
    </div>
  );
};

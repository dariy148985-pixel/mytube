import React, { useState, useRef } from 'react';
import {
  X,
  Upload,
  AlertCircle,
  CheckCircle2,
  Video,
  Link2,
  Hash
} from 'lucide-react';
import { VideoCategory, VideoItem, CommentItem } from '../types';
import { saveVideoBlob } from '../services/videoStorage';
import { extractYouTubeId, getYouTubeEmbedUrl, getYouTubeThumbnail } from '../services/youtubeHelper';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  channelId: string;
  channelName: string;
  channelAvatar?: string;
  channelSubs?: number;
  onVideoUploaded: (video: VideoItem) => void;
}

type UploadTab = 'file' | 'youtube';

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' Б';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' КБ';
  if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' МБ';
  return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' ГБ';
}

function getInitialCommentsForVideo(desc: string, channelName: string): CommentItem[] {
  const lower = desc.toLowerCase();
  const hasBeginner = lower.includes('#советыначинающимвмонтаже');
  const hasPack = lower.includes('#пакмонтажа');

  if (!hasBeginner && !hasPack) return [];

  const comments: CommentItem[] = [];
  const now = Date.now();

  if (hasBeginner) {
    comments.push({
      id: 'init_c1_' + now,
      author: 'Editor_Junior',
      text: 'Спасибо за советы начинающим в монтаже! С чего лучше начать — CapCut или Premiere Pro?',
      type: 'subscriber',
      reply: 'Рад помочь начинающим! Для быстрого старта рекомендую CapCut, а затем Premiere Pro!',
      dialogue: [],
      repliesList: [
        {
          id: 'init_rep1_' + now,
          author: channelName,
          text: 'Рад помочь начинающим! Для быстрого старта рекомендую CapCut, а затем Premiere Pro!',
          likes: 42,
          timestamp: now + 500,
          isAuthor: true,
          verified: true,
          avatarColor: '#3ea6ff',
        },
      ],
      leftChannel: false,
      reformed: false,
      userReaction: null,
      joyReply: null,
      likes: 18,
      timestamp: now - 5000,
    });
  }

  if (hasPack) {
    comments.push({
      id: 'init_c2_' + now,
      author: 'MemeCutter',
      text: 'Пак монтажа просто пушка! Звуки и переходы высшего качества! Где скачать? 🔥',
      type: 'subscriber',
      reply: 'Ссылка на пак монтажа в описании! Пользуйтесь на здоровье ❤️',
      dialogue: [],
      repliesList: [
        {
          id: 'init_rep2_' + now,
          author: channelName,
          text: 'Ссылка на пак монтажа в описании! Пользуйтесь на здоровье ❤️',
          likes: 56,
          timestamp: now + 800,
          isAuthor: true,
          verified: true,
          avatarColor: '#3ea6ff',
        },
      ],
      leftChannel: false,
      reformed: false,
      userReaction: null,
      joyReply: null,
      likes: 31,
      timestamp: now - 3000,
    });
  }

  return comments;
}

export const UploadModal: React.FC<UploadModalProps> = ({
  isOpen,
  onClose,
  channelId,
  channelName,
  channelAvatar,
  channelSubs,
  onVideoUploaded,
}) => {
  const [activeTab, setActiveTab] = useState<UploadTab>('file');

  // File Upload State
  const [file, setFile] = useState<File | null>(null);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string>('');

  // YouTube Link State
  const [youtubeUrlInput, setYoutubeUrlInput] = useState('');
  const [extractedYtId, setExtractedYtId] = useState<string | null>(null);

  // Common Metadata State
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [category, setCategory] = useState<VideoCategory>('РАЗБОР');
  const [isShort, setIsShort] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleSelectLocalFile = (selected: File) => {
    const maxSize = 2 * 1024 * 1024 * 1024; // 2 GB
    if (selected.size > maxSize) {
      setErrorMessage('Файл превышает допустимый лимит в 2 ГБ!');
      return;
    }

    setErrorMessage('');
    setFile(selected);

    if (!title) {
      const cleanName = selected.name.replace(/\.[^/.]+$/, '');
      setTitle(cleanName);
    }

    if (videoPreviewUrl && videoPreviewUrl.startsWith('blob:')) {
      try {
        URL.revokeObjectURL(videoPreviewUrl);
      } catch {}
    }

    const preview = URL.createObjectURL(selected);
    setVideoPreviewUrl(preview);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleSelectLocalFile(e.target.files[0]);
    }
  };

  const handleYouTubeUrlChange = (value: string) => {
    setYoutubeUrlInput(value);
    const id = extractYouTubeId(value);
    setExtractedYtId(id);

    if (id && !title) {
      if (value.toLowerCase().includes('shorts')) {
        setIsShort(true);
        setTitle('YouTube Short');
      } else {
        setTitle('Видео с YouTube');
      }
    }
  };

  const handleApplyPresetYouTube = () => {
    const url = 'https://youtu.be/ZKmfieXJjXc';
    handleYouTubeUrlChange(url);
    setTitle('ОТКРЫЛИ ФУД ТРАК НА КОЛЕСАХ!');
    setCategory('РАЗВЛЕЧЕНИЯ');
    setIsShort(false);
    setDesc('Мы открыли свой собственный настоящий фудтрак на колесах!');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (activeTab === 'youtube') {
      if (!extractedYtId) {
        setErrorMessage('Пожалуйста, укажите корректную ссылку на видео YouTube!');
        return;
      }
      if (!title.trim()) {
        setErrorMessage('Введите название видео!');
        return;
      }

      setIsSaving(true);
      setErrorMessage('');

      const videoId = 'yt_video_' + Date.now() + '_' + extractedYtId;
      const initialViews = Math.floor(Math.random() * 8000) + 500;
      const initialLikes = Math.floor(initialViews / 10) + 12;

      const newVideo: VideoItem = {
        id: videoId,
        channelId,
        channelName,
        channelAvatar,
        channelSubs,
        title: title.trim(),
        desc: desc.trim(),
        category,
        url: youtubeUrlInput.trim(),
        youtubeId: extractedYtId,
        youtubeUrl: youtubeUrlInput.trim(),
        thumbnailUrl: getYouTubeThumbnail(extractedYtId),
        duration: isShort ? '00:30' : '10:15',
        views: initialViews,
        likes: initialLikes,
        comments: getInitialCommentsForVideo(desc, channelName),
        earnings: 0,
        lastMonetizedViews: initialViews,
        isShort,
        fileMissing: false,
        uploadedAt: Date.now(),
      };

      onVideoUploaded(newVideo);
      setIsSaving(false);
      onClose();
      return;
    }

    if (!file) {
      setErrorMessage('Пожалуйста, выберите видеофайл с рабочего стола или компьютера!');
      return;
    }

    if (!title.trim()) {
      setErrorMessage('Введите название видео!');
      return;
    }

    setIsSaving(true);
    setErrorMessage('');

    const videoId = 'video_' + Date.now() + '_' + Math.random().toString(36).substring(2, 8);
    const initialViews = Math.floor(Math.random() * 1200) + 15;
    const initialLikes = Math.floor(initialViews / 12) + 2;

    try {
      await saveVideoBlob(videoId, file, file.name);

      const newVideo: VideoItem = {
        id: videoId,
        channelId,
        channelName,
        channelAvatar,
        channelSubs,
        title: title.trim(),
        desc: desc.trim(),
        category,
        url: videoPreviewUrl,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type || 'video/mp4',
        duration: isShort ? '00:15' : '08:42',
        views: initialViews,
        likes: initialLikes,
        comments: getInitialCommentsForVideo(desc, channelName),
        earnings: 0,
        lastMonetizedViews: initialViews,
        isShort,
        fileMissing: false,
        uploadedAt: Date.now(),
      };

      onVideoUploaded(newVideo);
      setIsSaving(false);
      onClose();

      setFile(null);
      setVideoPreviewUrl('');
      setTitle('');
      setDesc('');
    } catch (err: any) {
      console.error('Ошибка сохранения видео в IndexedDB:', err);
      setIsSaving(false);
      if (err?.name === 'QuotaExceededError' || err?.message?.toLowerCase().includes('quota')) {
        setErrorMessage(
          'Память браузера заполнена! Браузер ограничил квоту хранилища сайта. Попробуйте выбрать файл меньшего размера.'
        );
      } else {
        setErrorMessage('Не удалось сохранить видеофайл. Попробуйте еще раз.');
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-3 md:p-6 overflow-y-auto">
      <div className="relative w-full max-w-2xl rounded-3xl border border-[#333333] bg-[#1a1a1a] p-5 md:p-7 text-white shadow-2xl animate-fade-in my-auto max-h-[94vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#2d2d2d] pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#ff0000]/20 text-[#ff4444]">
              <Video className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Добавление видео на канал</h2>
              <p className="text-[11px] text-[#aaaaaa]">Канал: {channelName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-[#aaaaaa] hover:bg-[#282828] hover:text-white transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {errorMessage && (
          <div className="mt-3 flex items-center gap-2 rounded-xl bg-[#3b1515] border border-[#ef4444]/40 p-3 text-xs text-[#fca5a5]">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="mt-4 flex items-center gap-2 border-b border-[#2d2d2d] pb-2">
          <button
            type="button"
            onClick={() => setActiveTab('file')}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'file'
                ? 'bg-[#2a2a2a] text-white shadow border border-[#444444]'
                : 'text-[#888888] hover:text-white hover:bg-[#222222]'
            }`}
          >
            <Upload className="h-4 w-4" />
            <span>Загрузить видеофайл (до 2 ГБ)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('youtube')}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'youtube'
                ? 'bg-[#3b1818] text-[#ff4444] border border-[#ff4444]/30 shadow'
                : 'text-[#888888] hover:text-white hover:bg-[#222222]'
            }`}
          >
            <Link2 className="h-4 w-4 text-[#ff4444]" />
            <span>Ссылка YouTube</span>
          </button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="video/mp4,video/webm,video/mkv,video/avi,video/mov"
          onChange={handleFileInputChange}
          className="hidden"
        />

        <form onSubmit={handleSubmit} className="mt-4 space-y-4 overflow-y-auto pr-1 flex-1">
          {activeTab === 'file' && (
            <div>
              <label className="block text-xs font-bold text-[#aaaaaa] mb-1.5">
                Выберите видеофайл (до 2 ГБ):
              </label>

              <div
                onClick={() => fileInputRef.current?.click()}
                className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#3d3d3d] bg-[#222222] p-6 text-center cursor-pointer hover:border-[#ff0000] hover:bg-[#252525] transition-colors"
              >
                {file ? (
                  <div className="flex flex-col items-center">
                    <CheckCircle2 className="h-10 w-10 text-[#4ade80] mb-2" />
                    <div className="font-bold text-sm text-white truncate max-w-md">{file.name}</div>
                    <div className="text-xs text-[#aaaaaa] mt-1">
                      Размер: {formatFileSize(file.size)} • Формат: {file.type || 'видео'}
                    </div>
                    <span className="mt-2 text-xs text-[#3ea6ff] hover:underline font-semibold">
                      Нажмите, чтобы выбрать другой файл
                    </span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <Upload className="h-10 w-10 text-[#aaaaaa] mb-2" />
                    <div className="text-sm font-bold text-white">
                      Нажмите для выбора видео с рабочего стола или компьютера
                    </div>
                    <div className="text-xs text-[#888888] mt-1">
                      Поддерживаются MP4, WebM, MKV, AVI, MOV до 2 ГБ
                    </div>
                    <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-[#333333] px-3 py-1 text-[11px] text-[#4ade80] font-medium">
                      <span>✓ Сохраняется автоматически в память браузера</span>
                    </div>
                  </div>
                )}
              </div>

              {videoPreviewUrl && (
                <div className="mt-3 aspect-video w-full overflow-hidden rounded-xl bg-black border border-[#2d2d2d]">
                  <video src={videoPreviewUrl} controls className="h-full w-full object-contain" />
                </div>
              )}
            </div>
          )}

          {activeTab === 'youtube' && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-[#aaaaaa] mb-1.5">
                  Ссылка на видео или Short с YouTube:
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={youtubeUrlInput}
                    onChange={(e) => handleYouTubeUrlChange(e.target.value)}
                    placeholder="https://youtu.be/... или https://www.youtube.com/watch?v=..."
                    className="flex-1 rounded-xl border border-[#3f3f3f] bg-[#222222] p-3 text-xs text-white outline-none focus:border-[#ff0000]"
                  />
                  <button
                    type="button"
                    onClick={handleApplyPresetYouTube}
                    className="shrink-0 rounded-xl bg-[#ff0000]/20 hover:bg-[#ff0000]/30 text-[#ff4444] border border-[#ff4444]/30 px-3 py-2 text-xs font-bold cursor-pointer"
                    title="Вставить ссылку А4"
                  >
                    Пример А4
                  </button>
                </div>
                <p className="mt-1 text-[11px] text-[#888888]">
                  Поддерживаются ссылки вида youtu.be, youtube.com/watch, youtube.com/shorts.
                </p>
              </div>

              {extractedYtId && (
                <div className="rounded-2xl border border-[#2d2d2d] bg-[#141414] p-3">
                  <div className="text-xs font-bold text-[#4ade80] flex items-center gap-1.5 mb-2">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Видео YouTube определено (ID: {extractedYtId})</span>
                  </div>

                  <div className="aspect-video w-full overflow-hidden rounded-xl bg-black border border-[#2d2d2d]">
                    <iframe
                      src={getYouTubeEmbedUrl(extractedYtId, false)}
                      title="YouTube Preview"
                      className="h-full w-full border-0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      referrerPolicy="strict-origin-when-cross-origin"
                      allowFullScreen
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="pt-2 border-t border-[#2d2d2d] space-y-3">
            <div>
              <label className="block text-xs font-bold text-[#aaaaaa] mb-1.5">Рубрика / Тематика:</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as VideoCategory)}
                className="w-full rounded-xl border border-[#3f3f3f] bg-[#222222] p-2.5 text-xs text-white outline-none focus:border-[#3ea6ff] cursor-pointer"
              >
                <option value="РАЗБОР">РАЗБОР</option>
                <option value="ГЛАВНЫЕ МРАЗИ ЮТУБА">ГЛАВНЫЕ МРАЗИ ЮТУБА</option>
                <option value="ГЛАВНЫЕ ВОРЫ">ГЛАВНЫЕ ВОРЫ</option>
                <option value="ОБЗОР">ОБЗОР</option>
                <option value="РАССЛЕДОВАНИЕ">РАССЛЕДОВАНИЕ</option>
                <option value="ИГРЫ">ИГРЫ</option>
                <option value="ТЕХНОЛОГИИ">ТЕХНОЛОГИИ</option>
                <option value="МУЗЫКА">МУЗЫКА</option>
                <option value="ЮМОР">ЮМОР</option>
                <option value="РАЗВЛЕЧЕНИЯ">РАЗВЛЕЧЕНИЯ</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#aaaaaa] mb-1.5">
                Название видео:
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Тема / Название видео..."
                className="w-full rounded-xl border border-[#3f3f3f] bg-[#222222] p-2.5 text-xs text-white outline-none focus:border-[#3ea6ff]"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-[#aaaaaa]">
                  Описание:
                </label>
                <span className="text-[10px] text-[#888888]">Хэштеги для описания:</span>
              </div>
              <textarea
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                rows={2}
                placeholder="Расскажите зрителям, о чем это видео... Используйте #советыначинающимвмонтаже #пакмонтажа"
                className="w-full rounded-xl border border-[#3f3f3f] bg-[#222222] p-2.5 text-xs text-white outline-none focus:border-[#3ea6ff]"
              />

              {/* Quick Hashtags */}
              <div className="mt-2 flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => {
                    if (!desc.includes('#советыначинающимвмонтаже')) {
                      setDesc((prev) => (prev.trim() ? prev.trim() + ' ' : '') + '#советыначинающимвмонтаже');
                    }
                  }}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    desc.includes('#советыначинающимвмонтаже')
                      ? 'bg-blue-500/20 text-blue-300 border-blue-500/50 shadow-sm shadow-blue-950/40'
                      : 'bg-[#222222] hover:bg-[#2c2c2c] text-[#cccccc] border-[#333333]'
                  }`}
                  title="Добавить хэштег #советыначинающимвмонтаже в описание"
                >
                  <Hash className="h-3.5 w-3.5 text-[#3ea6ff]" />
                  <span>#советыначинающимвмонтаже</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (!desc.includes('#пакмонтажа')) {
                      setDesc((prev) => (prev.trim() ? prev.trim() + ' ' : '') + '#пакмонтажа');
                    }
                  }}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    desc.includes('#пакмонтажа')
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-sm shadow-amber-950/40'
                      : 'bg-[#222222] hover:bg-[#2c2c2c] text-[#cccccc] border-[#333333]'
                  }`}
                  title="Добавить хэштег #пакмонтажа в описание"
                >
                  <Hash className="h-3.5 w-3.5 text-[#f59e0b]" />
                  <span>#пакмонтажа</span>
                </button>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-xl bg-[#222222] p-2.5 border border-[#333333]">
              <input
                type="checkbox"
                id="is-short-check"
                checked={isShort}
                onChange={(e) => setIsShort(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 accent-[#ff0000] cursor-pointer"
              />
              <label htmlFor="is-short-check" className="cursor-pointer text-xs font-semibold text-white">
                Опубликовать в раздел Shorts (вертикальный короткий ролик)
              </label>
            </div>
          </div>

          <div className="flex gap-3 pt-2 border-t border-[#2d2d2d]">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="flex-1 rounded-xl bg-[#2a2a2a] py-3 text-xs font-bold text-[#cccccc] hover:bg-[#333333] cursor-pointer"
            >
              Отмена
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="flex-1 rounded-xl bg-[#065fd4] hover:bg-[#0056b3] py-3 text-xs font-bold text-white shadow-lg transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              {isSaving ? 'Сохранение в базу...' : 'Опубликовать'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

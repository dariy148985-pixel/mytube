import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { Channel, NotificationItem, PageView, VideoItem } from './types';
import {
  DEFAULT_PLATFORM_CHANNELS,
  ALL_SCHEDULED_VIDEOS,
  getReleasedVideosForChannel,
  getUpcomingVideoForChannel,
  getAllUpcomingPremieres,
  getStarterCommentsForVideo,
} from './services/sampleData';
import { hydrateVideoObjectUrls, deleteVideoBlob } from './services/videoStorage';
import { processSimulationTick } from './services/simulationEngine';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { VideoCard } from './components/VideoCard';
import { WatchPage } from './components/WatchPage';
import { ShortsPage } from './components/ShortsPage';
import { ChannelPage } from './components/ChannelPage';
import { StudioPage } from './components/StudioPage';
import { UploadModal } from './components/UploadModal';
import { BoostModal } from './components/BoostModal';
import { ChannelModal } from './components/ChannelModal';
import { Flame, Tv, Upload, Video, Clock, RotateCcw, Sparkles } from 'lucide-react';

const STORAGE_KEY = 'yt_all_channels';
const USER_CHAN_KEY = 'mytube_user_channel_id';
const VIEWED_CHAN_KEY = 'mytube_viewed_channel_id';
const ACTIVE_PAGE_KEY = 'mytube_active_page';
const ACTIVE_VIDEO_KEY = 'mytube_active_video_id';
const PREMIERE_START_TIME_KEY = 'mytube_premiere_start_time';

function getInitialPremiereStartTime(): number {
  try {
    const saved = localStorage.getItem(PREMIERE_START_TIME_KEY);
    if (saved) {
      const parsed = parseInt(saved, 10);
      if (!isNaN(parsed) && parsed > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Error reading premiere start time', e);
  }
  const now = Date.now();
  try {
    localStorage.setItem(PREMIERE_START_TIME_KEY, String(now));
  } catch {}
  return now;
}

const CATEGORY_CHIPS: Array<{ id: string; label: string }> = [
  { id: 'all', label: 'Все' },
  { id: 'РАЗВЛЕЧЕНИЯ', label: 'РАЗВЛЕЧЕНИЯ (А4)' },
  { id: 'ИГРЫ', label: 'ИГРЫ (Компот & CS2)' },
  { id: 'ТЕХНОЛОГИИ', label: 'ТЕХНОЛОГИИ (Кисельчик & GTA)' },
  { id: 'РАЗБОР', label: 'РАЗБОР (Стим ключи)' },
  { id: 'ГЛАВНЫЕ ВОРЫ', label: 'ГЛАВНЫЕ ВОРЫ' },
  { id: 'ГЛАВНЫЕ МРАЗИ ЮТУБА', label: 'ГЛАВНЫЕ МРАЗИ ЮТУБА' },
  { id: 'ОБЗОР', label: 'ОБЗОР' },
  { id: 'РАССЛЕДОВАНИЕ', label: 'РАССЛЕДОВАНИЕ' },
  { id: 'МУЗЫКА', label: 'МУЗЫКА' },
  { id: 'ЮМОР', label: 'ЮМОР' },
];

export default function App() {
  // Premiere schedule state - saved in localStorage so published premieres persist across reload!
  const [scheduleStartTime, setScheduleStartTime] = useState<number>(getInitialPremiereStartTime);
  const [scheduleNow, setScheduleNow] = useState<number>(() => Date.now());

  // Calculate elapsed time from scheduleStartTime on load
  const initialElapsedSec = Math.max(0, Math.floor((Date.now() - scheduleStartTime) / 1000));
  const notifiedVideosRef = useRef<Set<string>>(
    new Set(
      ALL_SCHEDULED_VIDEOS.filter((item) => initialElapsedSec >= item.releaseDelaySec).map(
        (item) => item.video.id
      )
    )
  );

  // Initialize channels: everything is preserved across reload (premieres, user channels, views, likes, stats)
  // EXCEPT comments, which refresh/renew on reload as requested!
  const [channels, setChannels] = useState<Channel[]>(() => {
    let savedAllChannels: Channel[] = [];
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed: Channel[] = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          savedAllChannels = parsed;
        }
      }
    } catch (e) {
      console.error('Error reading localStorage', e);
    }

    // Clean out "Мой YouTube Канал" as requested by user
    let userChannels = savedAllChannels.filter(
      (c) => c && c.isUserCreated !== false && c.name !== 'Мой YouTube Канал' && c.id !== 'my_main_channel'
    );

    if (userChannels.length === 0) {
      userChannels.push({
        id: 'chan_roman_stakan',
        name: 'Роман Стакан',
        handle: '@roman_stakan',
        desc: 'Официальный канал Роман Стакан. Качественные видео, разборы, обзоры и атмосфера!',
        subscribers: 31137,
        balance: 1000,
        avatarColor: '#16a34a',
        bannerColor: '#1e293b',
        monetization: { connected: true, connectedAt: Date.now() - 86400000 * 30 },
        verified: false,
        videos: [],
        createdAt: Date.now() - 86400000 * 30,
        isUserCreated: true,
      });
    }

    // Refresh comments for user channels (keep videos, stats, but refresh comments, remove any spontaneous videos)
    const refreshedUserChannels = userChannels.map((uc) => ({
      ...uc,
      videos: (uc.videos || [])
        .filter((v) => !v.id.startsWith('spont_'))
        .map((uv) => ({
          ...uv,
          // Comments refresh upon reload
          comments: getStarterCommentsForVideo(uv.id),
        })),
    }));

    // Calculate premiere elapsed time
    const premiereStart = getInitialPremiereStartTime();
    const elapsed = Math.max(0, Math.floor((Date.now() - premiereStart) / 1000));

    // Platform channels: retain only real released videos according to premiere time and saved stats, with comments refreshed
    const platformChannels = DEFAULT_PLATFORM_CHANNELS.map((def) => {
      const savedChan = savedAllChannels.find((c) => c.id === def.id);
      const released = getReleasedVideosForChannel(def.id, elapsed, premiereStart);

      const savedVideos = (savedChan?.videos || []).filter((v) => !v.id.startsWith('spont_'));
      const savedVideosMap = new Map(savedVideos.map((v) => [v.id, v]));

      const mergedVideos = released.map((rv) => {
        const sv = savedVideosMap.get(rv.id);
        return {
          ...rv,
          views: sv?.views ?? rv.views,
          likes: sv?.likes ?? rv.likes,
          dislikes: sv?.dislikes ?? rv.dislikes,
          earnings: sv?.earnings ?? rv.earnings,
          // ONLY comments are refreshed upon reload!
          comments: getStarterCommentsForVideo(rv.id),
        };
      });

      // For chan_air, starting subscribers are 104242; after 1st video +1 000 000
      let subs = savedChan?.subscribers ?? def.subscribers;
      let isRetired = false;
      let retiredAt: number | undefined = undefined;
      let desc = savedChan?.desc ?? def.desc;
      // Merge saved community posts with any new default posts, avoiding duplicates by id
      const savedCommunityList = savedChan?.communityPosts || [];
      const defaultCommunityList = def.communityPosts || [];
      const savedIds = new Set(savedCommunityList.map((p) => p.id));
      const missingDefaults = defaultCommunityList.filter((p) => !savedIds.has(p.id));
      let communityPosts = [...savedCommunityList, ...missingDefaults];
      if (communityPosts.length === 0) {
        communityPosts = [...defaultCommunityList];
      }

      if (def.id === 'chan_air') {
        isRetired = false;
        retiredAt = undefined;
        desc = def.desc;
        // Clean out any old farewell post or fake owner post
        communityPosts = (communityPosts || []).filter(
          (p) => p.id !== 'air_comm_farewell' && p.id !== 'air_comm_initial' && !p.text?.includes('купил')
        );
        if (mergedVideos.length < 3) {
          communityPosts = communityPosts.filter((p) => p.id !== 'air_comm_study');
        }
        if (mergedVideos.length === 0) {
          subs = 104242;
        } else if (mergedVideos.length >= 1 && (subs < 1000000 || subs > 2000000)) {
          subs = 1104242;
        }
      }

      return {
        ...def,
        ...(savedChan
          ? {
              subscribers: subs,
              balance: savedChan.balance ?? def.balance,
              verified: savedChan.verified ?? def.verified,
              monetization: savedChan.monetization ?? def.monetization,
              isRetired,
              retiredAt,
              desc,
              communityPosts,
            }
          : {
              subscribers: subs,
            }),
        videos: mergedVideos,
        isUserCreated: false,
      };
    });

    return [...refreshedUserChannels, ...platformChannels];
  });

  const [userChannelId, setUserChannelId] = useState<string>(() => {
    const savedId = localStorage.getItem(USER_CHAN_KEY);
    const platformIds = new Set(DEFAULT_PLATFORM_CHANNELS.map((c) => c.id));
    if (savedId && !platformIds.has(savedId)) return savedId;
    return 'my_main_channel';
  });

  const [viewedChannelId, setViewedChannelId] = useState<string>(() => {
    const savedId = localStorage.getItem(VIEWED_CHAN_KEY);
    if (savedId) return savedId;
    return 'my_main_channel';
  });

  const [currentPage, setCurrentPage] = useState<PageView>(() => {
    const saved = localStorage.getItem(ACTIVE_PAGE_KEY) as PageView;
    return saved || 'home';
  });

  const [activeVideo, setActiveVideo] = useState<VideoItem | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [simulationSpeed, setSimulationSpeed] = useState<number>(1);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const [darkMode, setDarkMode] = useState(true);

  // Modals state
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [boostModalOpen, setBoostModalOpen] = useState(false);
  const [channelModalOpen, setChannelModalOpen] = useState(false);
  const [boostTargetVideo, setBoostTargetVideo] = useState<VideoItem | null>(null);

  // Notifications
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: 'n1',
      title: 'Добро пожаловать в MYTube! 🚀',
      message: 'Все каналы (А4, Кисельчик, Компот, Роберт До Нила, MrBeast и др.) начали отсчет до премьер. Следите за таймерами!',
      time: 'только что',
      read: false,
      type: 'system',
    },
  ]);

  // Self-correct state on mount: purge fake videos, remove "Мой YouTube Канал", restore pristine state
  useEffect(() => {
    setChannels((prev) => {
      let needsFix = false;
      const validScheduledIds = new Set(ALL_SCHEDULED_VIDEOS.map((s) => s.video.id));

      // Remove "Мой YouTube Канал" and purge any spontaneous / invalid videos
      const filtered = prev
        .filter((c) => {
          if (c.name === 'Мой YouTube Канал' || c.id === 'my_main_channel') {
            needsFix = true;
            return false;
          }
          return true;
        })
        .map((c) => {
          const isUser = c.isUserCreated !== false;
          const cleanVideos = (c.videos || []).filter((v) => {
            if (v.id.startsWith('spont_')) {
              needsFix = true;
              return false;
            }
            if (!isUser && !validScheduledIds.has(v.id)) {
              needsFix = true;
              return false;
            }
            return true;
          });

          if (c.id === 'chan_air') {
            const videoCount = cleanVideos.length;
            const hasFarewell = (c.communityPosts || []).some((p) => p.id === 'air_comm_farewell');
            const hasFakeOwner = (c.communityPosts || []).some((p) => p.id === 'air_comm_initial' || p.text?.includes('купил'));
            if (c.isRetired || hasFarewell || hasFakeOwner || c.desc?.includes('завершил') || (videoCount === 0 && c.subscribers !== 104242)) {
              needsFix = true;
              return {
                ...c,
                videos: cleanVideos,
                subscribers: videoCount === 0 ? 104242 : (videoCount >= 1 && c.subscribers < 1000000 ? 1104242 : c.subscribers),
                isRetired: false,
                retiredAt: undefined,
                desc: 'Официальный канал ЭЙР. Авторские шортсы, кинематографичный контент и тайны!',
                communityPosts: (c.communityPosts || []).filter((p) => p.id !== 'air_comm_farewell' && p.id !== 'air_comm_initial' && !p.text?.includes('купил')),
              };
            }
          }

          if (cleanVideos.length !== (c.videos || []).length) {
            needsFix = true;
            return {
              ...c,
              videos: cleanVideos,
            };
          }

          return c;
        });

      if (needsFix) {
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
        } catch {}
      }

      // Check if userChannelId needs redirecting away from deleted 'my_main_channel'
      const firstUserChan = filtered.find((c) => c.isUserCreated !== false);
      if (firstUserChan) {
        if (userChannelId === 'my_main_channel' || !filtered.some((c) => c.id === userChannelId)) {
          setUserChannelId(firstUserChan.id);
          try {
            localStorage.setItem(USER_CHAN_KEY, firstUserChan.id);
          } catch {}
        }
        if (viewedChannelId === 'my_main_channel' || !filtered.some((c) => c.id === viewedChannelId)) {
          setViewedChannelId(firstUserChan.id);
          try {
            localStorage.setItem(VIEWED_CHAN_KEY, firstUserChan.id);
          } catch {}
        }
      }

      return needsFix ? filtered : prev;
    });

    // Reset activeVideo if it was one of the spontaneous fake videos
    setActiveVideo((cur) => {
      if (cur && cur.id.startsWith('spont_')) {
        try {
          localStorage.removeItem(ACTIVE_VIDEO_KEY);
        } catch {}
        setCurrentPage('home');
        return null;
      }
      if (cur && (cur.channelId === 'chan_air' || cur.channelName.toLowerCase().includes('эйр'))) {
        const cleanedComments = (cur.comments || []).map((c) => {
          let text = c.text;
          if (text.toLowerCase().includes('вернись')) {
            text = 'Шикарный шортс! Атмосфера и монтаж просто пушка! 🔥';
          }
          if (!c.reply || !c.repliesList || c.repliesList.length === 0) {
            const replyText = 'Спасибо огромное за поддержку! Рад стараться для вас!) ❤️';
            return {
              ...c,
              text,
              reply: replyText,
              repliesList: [
                {
                  id: 'rep_auth_' + Date.now(),
                  author: cur.channelName,
                  text: replyText,
                  likes: 950,
                  timestamp: Date.now() - 5000,
                  isAuthor: true,
                  verified: true,
                  avatarColor: '#0284c7',
                },
              ],
            };
          }
          return text !== c.text ? { ...c, text } : c;
        });
        return { ...cur, comments: cleanedComments };
      }
      return cur;
    });

    // Clean out spontaneous notifications
    setNotifications((prev) => prev.filter((n) => !n.id.startsWith('spont_') && !n.title.includes('выложил новое видео')));
  }, []);

  // Second-by-second ticker for premiere countdowns
  useEffect(() => {
    const timer = setInterval(() => {
      setScheduleNow(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const elapsedSec = Math.max(0, Math.floor((scheduleNow - scheduleStartTime) / 1000));

  // Restart premieres manually or upon request
  const handleRestartPremieres = useCallback(() => {
    const now = Date.now();
    try {
      localStorage.setItem(PREMIERE_START_TIME_KEY, String(now));
    } catch (e) {
      console.error('Error saving premiere start time', e);
    }
    setScheduleStartTime(now);
    setScheduleNow(now);
    notifiedVideosRef.current.clear();

    setChannels((prev) =>
      prev.map((c) => {
        if (c.isUserCreated === false) {
          if (c.id === 'chan_air') {
            const defAir = DEFAULT_PLATFORM_CHANNELS.find((ch) => ch.id === 'chan_air');
            return {
              ...c,
              videos: getReleasedVideosForChannel(c.id, 0, now),
              subscribers: 104242,
              isRetired: false,
              retiredAt: undefined,
              desc: defAir?.desc || 'Официальный канал ЭЙР. Авторские шортсы, кинематографичный контент и тайны!',
              communityPosts: defAir?.communityPosts || [],
            };
          }
          return { ...c, videos: getReleasedVideosForChannel(c.id, 0, now) };
        }
        return c;
      })
    );

    setNotifications((prev) => [
      {
        id: 'notif_restart_' + Date.now(),
        title: 'Премьеры перезапущены заново! 🔄',
        message: 'Все таймеры премьер (Кисельчик, Компот, Кибер Детектив, Роберт До Нила, А4, MrBeast) запущены с 0 секунд.',
        time: 'только что',
        read: false,
        type: 'system',
      },
      ...prev,
    ]);
  }, []);

  // Check scheduled releases whenever elapsedSec updates
  useEffect(() => {
    ALL_SCHEDULED_VIDEOS.forEach((item) => {
      if (elapsedSec >= item.releaseDelaySec && !notifiedVideosRef.current.has(item.video.id)) {
        notifiedVideosRef.current.add(item.video.id);
        setNotifications((prev) => [
          {
            id: `notif_${item.video.id}_${Date.now()}`,
            title: `${item.channelName} выпустил премьеру! 🔔`,
            message: `Вышел новый ролик «${item.video.title}». Премьера уже доступна на канале и в поиске!`,
            time: 'только что',
            read: false,
            type: 'upload',
          },
          ...prev,
        ]);
      }
    });

    setChannels((prev) => {
      let hasChanged = false;
      const nextChannels = prev.map((c) => {
        if (c.isUserCreated === false) {
          const released = getReleasedVideosForChannel(c.id, elapsedSec, scheduleStartTime);
          const currentVideos = c.videos || [];
          const currentIds = new Set(currentVideos.map((v) => v.id));

          // Find newly released videos that aren't yet in this channel
          const newlyReleased = released
            .filter((v) => !currentIds.has(v.id))
            .map((v) => {
              const scheduled = ALL_SCHEDULED_VIDEOS.find((item) => item.video.id === v.id);
              const actualReleaseTime = scheduled
                ? scheduleStartTime + scheduled.releaseDelaySec * 1000
                : Date.now();
              return {
                ...v,
                uploadedAt: actualReleaseTime,
              };
            });

          if (newlyReleased.length > 0) {
            hasChanged = true;
            let updatedSubs = c.subscribers;
            let updatedDesc = c.desc;
            let updatedCommunity = (c.communityPosts || []).filter(
              (p) => p.id !== 'air_comm_farewell' && p.id !== 'air_comm_initial' && !p.text?.includes('купил')
            );

            const totalAfterRelease = currentVideos.length + newlyReleased.length;
            if (c.id === 'chan_air') {
              if (currentVideos.length === 0 && totalAfterRelease >= 1) {
                // First video arrives: +1 000 000 subscribers!
                updatedSubs = 104242 + 1000000;
              }
              if (totalAfterRelease >= 3) {
                if (!updatedCommunity.some((p) => p.id === 'air_comm_study')) {
                  updatedCommunity = [
                    {
                      id: 'air_comm_study',
                      channelId: 'chan_air',
                      authorName: 'ЭЙР',
                      authorHandle: '@air',
                      authorAvatar: c.avatarUrl || 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=400&auto=format&fit=crop&q=80',
                      authorColor: '#0284c7',
                      isChannelOwner: true,
                      isVerified: true,
                      isPinned: true,
                      text: 'Не буду снимать, идей нет. А также учеба. Всем спасибо, снимать больше не буду. Учеба. Я живой, будем общаться в сообществе))',
                      timestamp: Date.now(),
                      likes: 86000,
                      comments: [
                        {
                          id: 'study_c1',
                          author: 'Влад_2026',
                          text: 'Понимаем бро, учеба важнее всего! Главное что живой, будем общаться тут в сообществе! 🔥',
                          timestamp: Date.now() - 5000,
                          likes: 8400,
                        },
                        {
                          id: 'study_c2',
                          author: 'Компот',
                          text: 'Учеба святое дело! Удачи с парами и сессией, пиши сюда как дела 👍',
                          timestamp: Date.now() - 4000,
                          likes: 9500,
                          isVipBlogger: true,
                        },
                        {
                          id: 'study_c3',
                          author: 'Кисельчик',
                          text: 'Шортсы получились пушка! Успехов в учебе, не пропадай из сообщества!',
                          timestamp: Date.now() - 3000,
                          likes: 7200,
                          isVipBlogger: true,
                        },
                        {
                          id: 'study_c4',
                          author: 'Матвей_Киноман',
                          text: 'Респект за честность! Будем ждать постов и общаться тут))',
                          timestamp: Date.now() - 1000,
                          likes: 4200,
                        },
                      ],
                    },
                    ...updatedCommunity,
                  ];
                }
              }
            }

            return {
              ...c,
              subscribers: updatedSubs,
              isRetired: false,
              retiredAt: undefined,
              desc: updatedDesc,
              communityPosts: updatedCommunity,
              videos: [...currentVideos, ...newlyReleased],
            };
          }
        }
        return c;
      });
      return hasChanged ? nextChannels : prev;
    });
  }, [elapsedSec, scheduleStartTime]);

  // Persist user channels and preferences
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(channels));
    } catch (e) {
      console.warn('Could not save channels to localStorage', e);
    }
  }, [channels]);

  useEffect(() => {
    try {
      localStorage.setItem(USER_CHAN_KEY, userChannelId);
    } catch {}
  }, [userChannelId]);

  useEffect(() => {
    try {
      localStorage.setItem(VIEWED_CHAN_KEY, viewedChannelId);
    } catch {}
  }, [viewedChannelId]);

  useEffect(() => {
    try {
      localStorage.setItem(ACTIVE_PAGE_KEY, currentPage);
    } catch {}
  }, [currentPage]);

  // Hydrate local video blobs from IndexedDB
  useEffect(() => {
    async function hydrate() {
      const updated = await Promise.all(
        channels.map(async (ch) => {
          if (!ch.videos || ch.videos.length === 0) return ch;
          const hydratedVideos = await hydrateVideoObjectUrls(ch.videos);
          return { ...ch, videos: hydratedVideos };
        })
      );
      setChannels(updated);

      const savedVidId = localStorage.getItem(ACTIVE_VIDEO_KEY);
      if (savedVidId) {
        for (const ch of updated) {
          const found = ch.videos.find((v) => v.id === savedVidId);
          if (found) {
            setActiveVideo(found);
            break;
          }
        }
      }
    }
    hydrate();
  }, []);

  // Growth simulation tick (viewers, comments, likes)
  useEffect(() => {
    if (simulationSpeed === 0) return;

    const intervalMs = Math.max(1000, Math.round(8000 / simulationSpeed));
    const interval = setInterval(() => {
      setChannels((prevChannels) => {
        const { updatedChannels, newEvents } = processSimulationTick(prevChannels, 1);

        if (newEvents.length > 0) {
          setNotifications((prevNotifs) => [
            ...newEvents.map((ev) => ({
              id: 'ev_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
              title: ev.title,
              message: ev.message,
              time: 'только что',
              read: false,
              type: ev.type as any,
            })),
            ...prevNotifs,
          ]);
        }

        if (activeVideo) {
          for (const c of updatedChannels) {
            const fresh = c.videos?.find((v) => v.id === activeVideo.id);
            if (fresh) {
              setActiveVideo(fresh);
              break;
            }
          }
        }

        return updatedChannels;
      });
    }, intervalMs);

    return () => clearInterval(interval);
  }, [simulationSpeed, activeVideo?.id]);

  const userChannel = useMemo(() => {
    return (
      channels.find((c) => c.id === userChannelId && c.isUserCreated !== false) ||
      channels.find((c) => c.isUserCreated !== false) ||
      channels[0] ||
      null
    );
  }, [channels, userChannelId]);

  const viewedChannel = useMemo(() => {
    return channels.find((c) => c.id === viewedChannelId) || userChannel;
  }, [channels, viewedChannelId, userChannel]);

  // Upcoming info for currently viewed channel
  const upcomingForViewedChannel = useMemo(() => {
    if (!viewedChannel) return null;
    return getUpcomingVideoForChannel(viewedChannel.id, elapsedSec);
  }, [viewedChannel?.id, elapsedSec]);

  // All upcoming premieres across the platform
  const upcomingPremieresList = useMemo(() => {
    return getAllUpcomingPremieres(elapsedSec);
  }, [elapsedSec]);

  const allPlatformVideos = useMemo(() => {
    const list: VideoItem[] = [];
    const seenIds = new Set<string>();

    for (const c of channels) {
      if (c.videos && c.videos.length > 0) {
        for (const v of c.videos) {
          if (!v || !v.id || seenIds.has(v.id)) continue;
          seenIds.add(v.id);
          list.push({
            ...v,
            channelName: c.name,
            channelAvatar: c.avatarColor,
            channelSubs: c.subscribers,
          });
        }
      }
    }
    return list;
  }, [channels]);

  const feedVideos = useMemo(() => {
    let list = [...allPlatformVideos];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (v) =>
          v.title.toLowerCase().includes(q) ||
          (v.desc && v.desc.toLowerCase().includes(q)) ||
          v.category.toLowerCase().includes(q) ||
          v.channelName.toLowerCase().includes(q)
      );
    }

    if (selectedCategory !== 'all') {
      list = list.filter((v) => v.category.toLowerCase().includes(selectedCategory.toLowerCase()));
    }

    if (currentPage === 'trending') {
      list.sort((a, b) => b.views - a.views);
    } else {
      list.sort((a, b) => b.uploadedAt - a.uploadedAt);
    }

    return list;
  }, [allPlatformVideos, searchQuery, selectedCategory, currentPage]);

  const handleSelectVideo = (video: VideoItem) => {
    try {
      localStorage.setItem(ACTIVE_VIDEO_KEY, video.id);
    } catch {}

    setChannels((prev) => {
      let matched = false;
      const next = prev.map((chan) => {
        if (chan.id === video.channelId) {
          matched = true;
          const exists = (chan.videos || []).some((v) => v.id === video.id);
          return {
            ...chan,
            videos: exists
              ? (chan.videos || []).map((v) =>
                  v.id === video.id ? { ...v, views: (v.views || 0) + 1 } : v
                )
              : [{ ...video, views: (video.views || 0) + 1 }, ...(chan.videos || [])],
          };
        }
        return chan;
      });

      if (!matched) {
        for (const chan of next) {
          if ((chan.videos || []).some((v) => v.id === video.id)) {
            chan.videos = (chan.videos || []).map((v) =>
              v.id === video.id ? { ...v, views: (v.views || 0) + 1 } : v
            );
            matched = true;
            break;
          }
        }
      }

      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {}
      return next;
    });

    setActiveVideo({ ...video, views: (video.views || 0) + 1 });
    setCurrentPage('watch');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleUpdateVideo = (updatedVideo: VideoItem) => {
    // HARD LIMIT: 50 comments max per video across all channels
    const safeVideo: VideoItem = {
      ...updatedVideo,
      comments: (updatedVideo.comments || []).slice(0, 50),
    };

    setActiveVideo(safeVideo);
    setChannels((prev) => {
      let matched = false;
      const next = prev.map((chan) => {
        if (chan.id === safeVideo.channelId) {
          matched = true;
          const exists = (chan.videos || []).some((v) => v.id === safeVideo.id);
          return {
            ...chan,
            videos: exists
              ? (chan.videos || []).map((v) => (v.id === safeVideo.id ? safeVideo : v))
              : [safeVideo, ...(chan.videos || [])],
          };
        }
        return chan;
      });

      if (!matched) {
        for (const chan of next) {
          if ((chan.videos || []).some((v) => v.id === safeVideo.id)) {
            chan.videos = (chan.videos || []).map((v) => (v.id === safeVideo.id ? safeVideo : v));
            break;
          }
        }
      }

      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const handleUpdateChannel = (updatedChannel: Channel) => {
    setChannels((prev) => {
      const next = prev.map((c) => (c.id === updatedChannel.id ? updatedChannel : c));
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const handleAddNotification = (
    notif: Partial<NotificationItem> & { title: string; message: string; type: NotificationItem['type'] }
  ) => {
    setNotifications((prev) => [
      {
        id: notif.id || 'notif_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
        title: notif.title,
        message: notif.message,
        time: notif.time || 'только что',
        read: false,
        type: notif.type,
      },
      ...prev,
    ]);
  };

  const handleDeleteVideo = async (videoId: string) => {
    try {
      await deleteVideoBlob(videoId);
    } catch (err) {
      console.error('Error deleting video blob', err);
    }

    setChannels((prev) => {
      const next = prev.map((chan) => ({
        ...chan,
        videos: (chan.videos || []).filter((v) => v.id !== videoId),
      }));
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {}
      return next;
    });

    if (activeVideo && activeVideo.id === videoId) {
      setActiveVideo(null);
      try {
        localStorage.removeItem(ACTIVE_VIDEO_KEY);
      } catch {}
      setCurrentPage('home');
    }
  };

  const handleVideoUploaded = (newVideo: VideoItem) => {
    const targetChanId = newVideo.channelId || userChannel?.id || 'my_main_channel';

    setChannels((prev) => {
      const next = prev.map((chan) => {
        if (chan.id === targetChanId) {
          const existingVideos = chan.videos || [];
          const newSubs = (chan.subscribers || 0) + Math.floor(Math.random() * 4) + 1;
          return {
            ...chan,
            subscribers: newSubs,
            videos: [newVideo, ...existingVideos.filter((v) => v.id !== newVideo.id)],
          };
        }
        return chan;
      });

      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch (err) {
        console.error('Error saving updated channels to storage', err);
      }
      return next;
    });

    setNotifications((prev) => [
      {
        id: 'notif_' + Date.now(),
        title: 'Видео сохранено и опубликовано!',
        message: `Ролик «${newVideo.title}» доступен на вашем канале и в поиске.`,
        time: 'только что',
        read: false,
        type: 'upload',
      },
      ...prev,
    ]);

    setCurrentPage((prev) => (prev === 'studio' ? 'studio' : 'channel'));
  };

  const handleCreateChannel = (name: string, desc: string) => {
    const colors = ['#e11d48', '#2563eb', '#7c3aed', '#059669', '#d97706', '#db2777'];
    const newChan: Channel = {
      id: 'chan_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      name,
      handle: '@' + name.toLowerCase().replace(/[^a-z0-9а-яё_]/gi, '_'),
      desc,
      subscribers: 0,
      balance: 1000,
      avatarColor: colors[Math.floor(Math.random() * colors.length)],
      bannerColor: '#1e293b',
      monetization: { connected: false },
      videos: [],
      createdAt: Date.now(),
      isUserCreated: true,
    };

    setChannels((prev) => [newChan, ...prev]);
    setUserChannelId(newChan.id);
    setViewedChannelId(newChan.id);
  };

  const handleDeleteChannel = (targetChannelId: string) => {
    const chanToDelete = channels.find((c) => c.id === targetChannelId);
    if (chanToDelete?.videos) {
      chanToDelete.videos.forEach((v) => {
        if (v.blobKey) {
          deleteVideoBlob(v.blobKey).catch(() => {});
        }
      });
    }

    setChannels((prev) => {
      const remaining = prev.filter((c) => c.id !== targetChannelId);
      if (remaining.length === 0 || !remaining.some((c) => c.isUserCreated !== false)) {
        const colors = ['#16a34a', '#2563eb', '#7c3aed', '#059669', '#d97706'];
        const freshChannel: Channel = {
          id: 'chan_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
          name: 'Роман Стакан',
          handle: '@roman_stakan',
          desc: 'Официальный канал Роман Стакан.',
          subscribers: 31137,
          balance: 1000,
          avatarColor: colors[Math.floor(Math.random() * colors.length)],
          bannerColor: '#1e293b',
          monetization: { connected: true, connectedAt: Date.now() - 86400000 * 30 },
          videos: [],
          createdAt: Date.now(),
          isUserCreated: true,
        };
        const updated = [freshChannel, ...remaining];
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
          localStorage.setItem(USER_CHAN_KEY, freshChannel.id);
          localStorage.setItem(VIEWED_CHAN_KEY, freshChannel.id);
        } catch {}
        setUserChannelId(freshChannel.id);
        setViewedChannelId(freshChannel.id);
        return updated;
      }

      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(remaining));
      } catch {}

      if (userChannelId === targetChannelId) {
        const nextUserChan = remaining.find((c) => c.isUserCreated !== false) || remaining[0];
        setUserChannelId(nextUserChan.id);
        try {
          localStorage.setItem(USER_CHAN_KEY, nextUserChan.id);
        } catch {}
      }

      if (viewedChannelId === targetChannelId) {
        const nextChan = remaining.find((c) => c.isUserCreated !== false) || remaining[0];
        setViewedChannelId(nextChan.id);
        try {
          localStorage.setItem(VIEWED_CHAN_KEY, nextChan.id);
        } catch {}
      }

      return remaining;
    });

    if (activeVideo && activeVideo.channelId === targetChannelId) {
      setActiveVideo(null);
    }

    if (currentPage === 'channel' && viewedChannelId === targetChannelId) {
      setCurrentPage('home');
    }
    if (currentPage === 'studio' && userChannelId === targetChannelId) {
      setCurrentPage('home');
    }

    handleAddNotification({
      title: '🗑️ Канал удален',
      message: `Канал «${chanToDelete?.name || ''}» успешно удален.`,
      type: 'system',
    });
  };

  const handleDeleteCurrentChannel = () => {
    if (!userChannel) return;
    handleDeleteChannel(userChannel.id);
  };

  const handleOpenBoostModal = (video?: VideoItem) => {
    setBoostTargetVideo(video || activeVideo || userChannel?.videos[0] || null);
    setBoostModalOpen(true);
  };

  const markNotificationsAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-[#f1f1f1] font-sans antialiased">
      {/* Top Navbar */}
      <Header
        currentChannel={userChannel}
        channels={channels}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onSearchSubmit={(q) => {
          setSearchQuery(q);
          if (currentPage !== 'home' && currentPage !== 'trending') {
            setCurrentPage('home');
          }
        }}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        onOpenUpload={() => setUploadModalOpen(true)}
        onOpenBoost={() => handleOpenBoostModal()}
        onOpenChannelModal={() => setChannelModalOpen(true)}
        onSelectChannel={(id) => {
          const ch = channels.find((c) => c.id === id);
          if (ch && ch.isUserCreated !== false) {
            setUserChannelId(id);
          }
          setViewedChannelId(id);
          setCurrentPage('channel');
        }}
        onDeleteCurrentChannel={handleDeleteCurrentChannel}
        toggleSidebar={() => setIsSidebarExpanded(!isSidebarExpanded)}
        simulationSpeed={simulationSpeed}
        setSimulationSpeed={setSimulationSpeed}
        notifications={notifications}
        markNotificationsAsRead={markNotificationsAsRead}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        onRestartPremieres={handleRestartPremieres}
      />

      {/* Main Container */}
      <div className="flex">
        {/* Left Sidebar */}
        <Sidebar
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          isExpanded={isSidebarExpanded}
          currentChannel={userChannel}
          channels={channels}
          onSelectChannel={(id) => {
            const ch = channels.find((c) => c.id === id);
            if (ch && ch.isUserCreated !== false) {
              setUserChannelId(id);
            }
            setViewedChannelId(id);
            setCurrentPage('channel');
          }}
          onOpenMyChannel={() => {
            if (userChannel) setViewedChannelId(userChannel.id);
            setCurrentPage('channel');
          }}
          onOpenChannelModal={() => setChannelModalOpen(true)}
          onOpenUpload={() => setUploadModalOpen(true)}
        />

        {/* Content Area */}
        <main
          className={`flex-1 transition-all duration-200 pb-16 min-h-[calc(100vh-56px)] ${
            isSidebarExpanded ? 'sm:ml-60' : 'sm:ml-[72px]'
          }`}
        >
          {/* HOME & TRENDING & SUBSCRIPTIONS VIEW */}
          {(currentPage === 'home' || currentPage === 'trending' || currentPage === 'subscriptions') && (
            <div className="p-4 md:p-6 max-w-[1920px] mx-auto">
              {/* Premieres Live Countdown Banner on Home */}
              {upcomingPremieresList.length > 0 && (
                <div className="mb-5 rounded-2xl bg-gradient-to-r from-[#b45309]/30 via-[#78350f]/30 to-[#1e1e1e] p-4 border border-[#f59e0b]/40 shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#f59e0b] text-black font-black">
                      <Clock className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="text-xs font-black uppercase tracking-wider text-[#fbbf24] flex items-center gap-1.5">
                        <Sparkles className="h-3.5 w-3.5 text-[#fbbf24]" />
                        <span>РАСПИСАНИЕ ПРЕМЬЕР БЛОГЕРОВ (А4, КИСЕЛЬЧИК, КОМПОТ, ДЕТЕКТИВ)</span>
                      </div>
                      <div className="text-sm font-semibold text-white mt-0.5">
                        Ближайшая премьера: <span className="font-bold text-[#fbbf24]">{upcomingPremieresList[0].channelName}</span> — «{upcomingPremieresList[0].video.title}»
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
                    <div className="text-left md:text-right">
                      <span className="text-[11px] text-[#aaaaaa] block">Выход через:</span>
                      <span className="text-lg font-black text-[#fbbf24]">
                        {upcomingPremieresList[0].secondsLeft > 60
                          ? `${Math.floor(upcomingPremieresList[0].secondsLeft / 60)} мин. ${upcomingPremieresList[0].secondsLeft % 60} сек.`
                          : `${upcomingPremieresList[0].secondsLeft} сек.`}
                      </span>
                    </div>

                    <button
                      onClick={handleRestartPremieres}
                      title="Перезапустить таймеры премьер заново"
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#272727] hover:bg-[#383838] text-white text-xs font-bold border border-[#383838] transition-colors cursor-pointer"
                    >
                      <RotateCcw className="h-3.5 w-3.5 text-[#fbbf24]" />
                      <span>Заново</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Category Chips Bar */}
              <div className="flex items-center gap-2 overflow-x-auto pb-4 scrollbar-none">
                {CATEGORY_CHIPS.map((chip) => (
                  <button
                    key={chip.id}
                    onClick={() => setSelectedCategory(chip.id)}
                    className={`shrink-0 rounded-lg px-3.5 py-1.5 text-xs md:text-sm font-bold transition-colors cursor-pointer ${
                      selectedCategory === chip.id
                        ? 'bg-white text-[#0f0f0f]'
                        : 'bg-[#272727] text-[#f1f1f1] hover:bg-[#383838]'
                    }`}
                  >
                    {chip.label}
                  </button>
                ))}
              </div>

              {/* Feed Heading if Trending or Subscriptions */}
              {currentPage === 'trending' && (
                <div className="flex items-center gap-2 mb-4 text-xl font-bold text-white">
                  <Flame className="h-6 w-6 text-[#ff0000]" />
                  <span>В тренде прямо сейчас</span>
                </div>
              )}

              {currentPage === 'subscriptions' && (
                <div className="flex items-center gap-2 mb-4 text-xl font-bold text-white">
                  <Tv className="h-6 w-6 text-[#3ea6ff]" />
                  <span>Новые видео от подписок</span>
                </div>
              )}

              {/* Videos Grid */}
              {feedVideos.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-3xl bg-[#141414] p-16 text-center border border-[#222222] my-8">
                  <Video className="h-12 w-12 text-[#555555] mb-3" />
                  <h3 className="text-lg font-bold text-white">Видео еще не вышли</h3>
                  <p className="mt-1 text-sm text-[#888888] max-w-md">
                    {upcomingPremieresList.length > 0
                      ? `Премьеры каналов выйдут по таймеру (ближайшая через ${upcomingPremieresList[0].secondsLeft} сек.). Вы также можете загрузить свое видео прямо сейчас!`
                      : searchQuery
                      ? `По запросу «${searchQuery}» ничего не найдено.`
                      : 'Загрузите свое видео или дождитесь премьер!'}
                  </p>
                  <div className="mt-4 flex gap-3 flex-wrap justify-center">
                    <button
                      onClick={() => setUploadModalOpen(true)}
                      className="flex items-center gap-2 rounded-full bg-[#ff0000] hover:bg-[#cc0000] px-5 py-2.5 text-xs font-bold text-white shadow transition-all active:scale-95 cursor-pointer"
                    >
                      <Upload className="h-4 w-4" />
                      <span>Загрузить первое видео (до 2 ГБ)</span>
                    </button>
                    <button
                      onClick={handleRestartPremieres}
                      className="flex items-center gap-2 rounded-full bg-[#272727] hover:bg-[#383838] px-5 py-2.5 text-xs font-bold text-white border border-[#383838] transition-all cursor-pointer"
                    >
                      <RotateCcw className="h-4 w-4 text-[#fbbf24]" />
                      <span>Перезапустить премьеры</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-x-4 gap-y-8">
                  {feedVideos.map((video) => (
                    <VideoCard
                      key={video.id}
                      video={video}
                      onSelect={handleSelectVideo}
                      onDelete={(_, vid) => handleDeleteVideo(vid)}
                      onBoost={(_, v) => handleOpenBoostModal(v)}
                      isOwner={userChannel?.id === video.channelId}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* WATCH VIEW */}
          {currentPage === 'watch' && activeVideo && (
            <WatchPage
              video={activeVideo}
              currentChannel={userChannel}
              channels={channels}
              onSelectVideo={handleSelectVideo}
              onUpdateVideo={handleUpdateVideo}
              onUpdateChannel={handleUpdateChannel}
              onOpenBoost={(v) => handleOpenBoostModal(v)}
              onDeleteVideo={handleDeleteVideo}
              allVideos={allPlatformVideos}
              onNavigateToChannel={(channelId) => {
                setViewedChannelId(channelId);
                setCurrentPage('channel');
              }}
              onAddNotification={handleAddNotification}
            />
          )}

          {/* SHORTS VIEW */}
          {currentPage === 'shorts' && (
            <ShortsPage
              videos={allPlatformVideos}
              currentChannel={userChannel}
              onUpdateVideo={handleUpdateVideo}
              onUpdateChannel={handleUpdateChannel}
            />
          )}

          {/* CHANNEL VIEW */}
          {currentPage === 'channel' && viewedChannel && (
            <ChannelPage
              channel={viewedChannel}
              currentChannel={userChannel}
              onSelectVideo={handleSelectVideo}
              onDeleteVideo={handleDeleteVideo}
              onOpenUpload={() => setUploadModalOpen(true)}
              onOpenBoost={(v) => handleOpenBoostModal(v)}
              onOpenStudio={() => {
                if (userChannel) setViewedChannelId(userChannel.id);
                setCurrentPage('studio');
              }}
              onUpdateChannel={handleUpdateChannel}
              onDeleteChannel={() => handleDeleteChannel(viewedChannel.id)}
              isOwner={viewedChannel.id === userChannel?.id && viewedChannel.isUserCreated !== false}
              upcomingVideoInfo={upcomingForViewedChannel}
              onRestartPremieres={handleRestartPremieres}
            />
          )}

          {/* STUDIO VIEW */}
          {currentPage === 'studio' && userChannel && (
            <StudioPage
              channel={userChannel}
              onUpdateChannel={handleUpdateChannel}
              onSelectVideo={handleSelectVideo}
              onDeleteVideo={handleDeleteVideo}
              simulationSpeed={simulationSpeed}
              setSimulationSpeed={setSimulationSpeed}
            />
          )}
        </main>
      </div>

      {/* Upload Video Modal */}
      {userChannel && (
        <UploadModal
          isOpen={uploadModalOpen}
          onClose={() => setUploadModalOpen(false)}
          channelId={userChannel.id}
          channelName={userChannel.name}
          channelAvatar={userChannel.avatarColor}
          channelSubs={userChannel.subscribers}
          onVideoUploaded={handleVideoUploaded}
        />
      )}

      {/* Boost Modal */}
      {userChannel && (
        <BoostModal
          isOpen={boostModalOpen}
          onClose={() => setBoostModalOpen(false)}
          channel={userChannel}
          currentVideo={boostTargetVideo}
          onUpdateChannel={handleUpdateChannel}
        />
      )}

      {/* Channel Switcher / Creator Modal */}
      <ChannelModal
        isOpen={channelModalOpen}
        onClose={() => setChannelModalOpen(false)}
        channels={channels}
        currentChannelId={userChannel?.id || ''}
        onSelectChannel={(id) => {
          const ch = channels.find((c) => c.id === id);
          if (ch && ch.isUserCreated !== false) {
            setUserChannelId(id);
          }
          setViewedChannelId(id);
          setCurrentPage('channel');
        }}
        onCreateChannel={handleCreateChannel}
        onDeleteChannel={handleDeleteChannel}
      />
    </div>
  );
}

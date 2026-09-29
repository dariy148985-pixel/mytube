export type VideoCategory =
  | 'РАЗБОР'
  | 'ГЛАВНЫЕ МРАЗИ ЮТУБА'
  | 'ГЛАВНЫЕ ВОРЫ'
  | 'ОБЗОР'
  | 'РАССЛЕДОВАНИЕ'
  | 'ИГРЫ'
  | 'ТЕХНОЛОГИИ'
  | 'МУЗЫКА'
  | 'ЮМОР'
  | 'РАЗВЛЕЧЕНИЯ';

export type CommentType = 'normal' | 'hater' | 'subscriber' | 'fan' | 'reformed';

export interface DialogueStep {
  authorReply: string;
  haterReply: string;
}

export interface CommentReplyItem {
  id: string;
  author: string;
  text: string;
  likes: number;
  timestamp: number;
  isAuthor?: boolean;
  isPromotedChannel?: boolean;
  avatarColor?: string;
  verified?: boolean;
}

export interface CommentItem {
  id: string;
  author: string;
  authorChannelId?: string;
  authorSubs?: number;
  text: string;
  type: CommentType;
  reply: string | null;
  dialogue: DialogueStep[];
  repliesList?: CommentReplyItem[];
  isShoutout?: boolean;
  promotedChannelId?: string;
  promotedChannelName?: string;
  subsGainedFromPr?: number;
  leftChannel: boolean;
  reformed: boolean;
  userReaction: string | null;
  joyReply: string | null;
  likes: number;
  isLikedByViewer?: boolean;
  isHeartedByAuthor?: boolean;
  isPinned?: boolean;
  verified?: boolean;
  isVipBlogger?: boolean;
  timestamp: number;
  avatarColor?: string;
}

export interface VideoItem {
  id: string;
  channelId: string;
  channelName: string;
  channelAvatar?: string;
  channelSubs?: number;
  channelVerified?: boolean;
  title: string;
  desc?: string;
  category?: VideoCategory | string;
  url: string;
  videoUrl?: string;
  youtubeId?: string;
  youtubeUrl?: string;
  thumbnailUrl?: string;
  fileName?: string;
  fileSize?: number;
  fileType?: string;
  duration?: string;
  views: number;
  likes: number;
  dislikes?: number;
  isLikedByViewer?: boolean;
  isDislikedByViewer?: boolean;
  comments: CommentItem[];
  earnings: number;
  lastMonetizedViews: number;
  fileMissing?: boolean;
  isShort?: boolean;
  uploadedAt: number;
}

export interface CommunityComment {
  id: string;
  author: string;
  authorHandle?: string;
  authorAvatar?: string;
  authorColor?: string;
  text: string;
  timestamp: number;
  likes: number;
  isLikedByViewer?: boolean;
  isAuthor?: boolean;
  isVipBlogger?: boolean;
}

export interface CommunityPost {
  id: string;
  channelId: string;
  authorName: string;
  authorHandle?: string;
  authorAvatar?: string;
  authorColor?: string;
  isChannelOwner?: boolean;
  isVerified?: boolean;
  text: string;
  timestamp: number;
  likes: number;
  isLikedByViewer?: boolean;
  imageUrl?: string;
  poll?: {
    question?: string;
    options: { id: string; text: string; votes: number }[];
    totalVotes: number;
    userVotedOptionId?: string;
    isClosed?: boolean;
    closedAt?: number;
    winningOptionId?: string;
  };
  comments: CommunityComment[];
  isPinned?: boolean;
}

export interface Channel {
  id: string;
  name: string;
  handle: string;
  desc: string;
  subscribers: number;
  balance: number;
  avatarColor: string;
  avatarUrl?: string;
  bannerColor: string;
  bannerUrl?: string;
  monetization: {
    connected: boolean;
    connectedAt?: number;
  };
  verified?: boolean;
  isRetired?: boolean;
  retiredAt?: number;
  communityPosts?: CommunityPost[];
  videos: VideoItem[];
  createdAt: number;
  isUserCreated: boolean;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: 'sub' | 'money' | 'comment' | 'milestone' | 'boost' | 'system' | 'upload';
}

export type PageView =
  | 'home'
  | 'watch'
  | 'shorts'
  | 'channel'
  | 'studio'
  | 'subscriptions'
  | 'trending';

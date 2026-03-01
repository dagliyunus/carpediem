export const ContentStatus = {
  DRAFT: 'DRAFT',
  PUBLISHED: 'PUBLISHED',
  SCHEDULED: 'SCHEDULED',
  ARCHIVED: 'ARCHIVED',
} as const;

export type ContentStatus = (typeof ContentStatus)[keyof typeof ContentStatus];

export const MediaType = {
  IMAGE: 'IMAGE',
  VIDEO: 'VIDEO',
  FILE: 'FILE',
} as const;

export type MediaType = (typeof MediaType)[keyof typeof MediaType];

export const SocialPlatform = {
  INSTAGRAM: 'INSTAGRAM',
  PINTEREST: 'PINTEREST',
  TIKTOK: 'TIKTOK',
  FACEBOOK: 'FACEBOOK',
  YOUTUBE: 'YOUTUBE',
  LINKEDIN: 'LINKEDIN',
  X: 'X',
} as const;

export type SocialPlatform = (typeof SocialPlatform)[keyof typeof SocialPlatform];

export const AiChannel = {
  MAGAZIN: 'MAGAZIN',
  INSTAGRAM: 'INSTAGRAM',
  PINTEREST: 'PINTEREST',
  TIKTOK: 'TIKTOK',
} as const;

export type AiChannel = (typeof AiChannel)[keyof typeof AiChannel];

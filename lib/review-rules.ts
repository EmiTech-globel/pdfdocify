// Limits and allowed types for review media. Shared by the form (client) and the API routes (server).
export const IMAGE_TYPES = {'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp'} as const
export const VIDEO_TYPES = {'video/mp4': 'mp4', 'video/webm': 'webm', 'video/quicktime': 'mov'} as const
export const LIMITS = {images: 4, videos: 1, imageBytes: 5 * 1024 * 1024, videoBytes: 50 * 1024 * 1024}

export type MediaKind = 'image' | 'video'
export const kindOf = (type: string): MediaKind | null =>
  type in IMAGE_TYPES ? 'image' : type in VIDEO_TYPES ? 'video' : null
export const extOf = (type: string): string | null =>
  (IMAGE_TYPES as Record<string, string>)[type] ?? (VIDEO_TYPES as Record<string, string>)[type] ?? null
export const maxBytes = (kind: MediaKind) => (kind === 'image' ? LIMITS.imageBytes : LIMITS.videoBytes)
export const mb = (bytes: number) => Math.round(bytes / 1024 / 1024)

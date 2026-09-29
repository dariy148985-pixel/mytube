/**
 * Utility functions for extracting YouTube video IDs, embed URLs, and thumbnails.
 */

export function extractYouTubeId(urlOrId: string): string | null {
  if (!urlOrId) return null;
  const trimmed = urlOrId.trim();

  // If it's already an 11-char ID
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return trimmed;
  }

  // Regex supporting youtu.be, youtube.com/watch, youtube.com/shorts, youtube.com/embed
  const match = trimmed.match(
    /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|shorts\/|watch\?v=|watch\?.+&v=))([\w-]{11})/
  );

  return match ? match[1] : null;
}

export function getYouTubeEmbedUrl(idOrUrl: string, autoplay: boolean = true, isShort: boolean = false): string {
  const id = extractYouTubeId(idOrUrl) || idOrUrl;
  const params = new URLSearchParams({
    autoplay: autoplay ? '1' : '0',
    rel: '0',
    playsinline: '1',
    enablejsapi: '1',
  });

  if (isShort) {
    params.set('loop', '1');
    params.set('playlist', id);
  }

  return `https://www.youtube.com/embed/${id}?${params.toString()}`;
}

export function getYouTubeDirectUrl(idOrUrl: string): string {
  const id = extractYouTubeId(idOrUrl) || idOrUrl;
  return `https://www.youtube.com/watch?v=${id}`;
}

export function getYouTubeThumbnail(idOrUrl: string): string {
  const id = extractYouTubeId(idOrUrl) || idOrUrl;
  return `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
}

export function isYouTubeSource(item: { youtubeId?: string; youtubeUrl?: string; url?: string }): boolean {
  if (item.youtubeId) return true;
  if (item.youtubeUrl && extractYouTubeId(item.youtubeUrl)) return true;
  if (item.url && extractYouTubeId(item.url)) return true;
  return false;
}

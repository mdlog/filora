/**
 * Filbeam CDN utilities for fast Filecoin content delivery
 * Docs: https://filbeam.com/docs
 */

export const FILBEAM_GATEWAY = "https://gateway.filbeam.com";

/**
 * Get Filbeam URL for piece CID
 */
export const getFilbeamPieceUrl = (pieceCid: string): string => {
  return `${FILBEAM_GATEWAY}/piece/${pieceCid}`;
};

/**
 * Get Filbeam URL for IPFS CID
 */
export const getFilbeamIpfsUrl = (ipfsCid: string): string => {
  return `${FILBEAM_GATEWAY}/ipfs/${ipfsCid}`;
};

/**
 * Check if file is previewable (image, video, audio, pdf)
 */
export const isPreviewable = (filename: string): boolean => {
  const ext = filename.split('.').pop()?.toLowerCase();
  const previewableExts = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'mp4', 'webm', 'mp3', 'wav', 'pdf'];
  return previewableExts.includes(ext || '');
};

/**
 * Get file type from filename
 */
export const getFileType = (filename: string): 'image' | 'video' | 'audio' | 'pdf' | 'other' => {
  const ext = filename.split('.').pop()?.toLowerCase();
  if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext || '')) return 'image';
  if (['mp4', 'webm', 'mov'].includes(ext || '')) return 'video';
  if (['mp3', 'wav', 'ogg'].includes(ext || '')) return 'audio';
  if (ext === 'pdf') return 'pdf';
  return 'other';
};

/**
 * Media utilities for asset preview and file type detection
 */

export type MediaType = "image" | "video" | "audio" | "pdf" | "3d" | "document" | "unknown";

export interface MediaInfo {
    type: MediaType;
    extension: string;
    mimeType?: string;
    canPreview: boolean;
    previewUrl?: string;
}

/**
 * Detect media type based on filename or CID
 */
export const detectMediaType = (filename?: string, cid?: string): MediaType => {
    if (!filename && !cid) return "unknown";

    const file = filename || cid || "";
    const extension = file.split('.').pop()?.toLowerCase();

    // Image formats
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'ico', 'tiff', 'tif'].includes(extension || '')) {
        return "image";
    }

    // Video formats
    if (['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm', 'mkv', 'm4v', '3gp', 'ogv'].includes(extension || '')) {
        return "video";
    }

    // Audio formats
    if (['mp3', 'wav', 'flac', 'aac', 'ogg', 'm4a', 'wma', 'opus', 'wav'].includes(extension || '')) {
        return "audio";
    }

    // PDF
    if (extension === 'pdf') {
        return "pdf";
    }

    // 3D formats
    if (['obj', 'gltf', 'glb', 'fbx', 'dae', '3ds', 'blend', 'stl', 'ply'].includes(extension || '')) {
        return "3d";
    }

    // Document formats
    if (['txt', 'doc', 'docx', 'rtf', 'odt', 'md', 'json', 'xml', 'csv', 'xls', 'xlsx', 'ppt', 'pptx'].includes(extension || '')) {
        return "document";
    }

    return "unknown";
};

/**
 * Get media info including type, extension, and preview capabilities
 */
export const getMediaInfo = (filename?: string, cid?: string): MediaInfo => {
    const type = detectMediaType(filename, cid);
    const extension = (filename || cid || "").split('.').pop()?.toLowerCase() || "";

    return {
        type,
        extension,
        canPreview: ['image', 'video', 'audio', 'pdf'].includes(type),
        previewUrl: type === 'image' ? generatePreviewUrl(cid || '', type) : undefined
    };
};

/**
 * Generate preview URL using Filbeam CDN
 */
export const generatePreviewUrl = (cid: string, mediaType: MediaType): string => {
    const baseUrl = "https://gateway.filbeam.com/ipfs";
    return `${baseUrl}/${cid}`;
};

/**
 * Get MIME type for file extension
 */
export const getMimeType = (extension: string): string => {
    const mimeTypes: Record<string, string> = {
        // Images
        'jpg': 'image/jpeg',
        'jpeg': 'image/jpeg',
        'png': 'image/png',
        'gif': 'image/gif',
        'webp': 'image/webp',
        'svg': 'image/svg+xml',
        'bmp': 'image/bmp',
        'ico': 'image/x-icon',
        'tiff': 'image/tiff',
        'tif': 'image/tiff',

        // Videos
        'mp4': 'video/mp4',
        'avi': 'video/x-msvideo',
        'mov': 'video/quicktime',
        'wmv': 'video/x-ms-wmv',
        'flv': 'video/x-flv',
        'webm': 'video/webm',
        'mkv': 'video/x-matroska',
        'm4v': 'video/x-m4v',
        '3gp': 'video/3gpp',
        'ogv': 'video/ogg',

        // Audio
        'mp3': 'audio/mpeg',
        'wav': 'audio/wav',
        'flac': 'audio/flac',
        'aac': 'audio/aac',
        'ogg': 'audio/ogg',
        'm4a': 'audio/mp4',
        'wma': 'audio/x-ms-wma',
        'opus': 'audio/opus',

        // Documents
        'pdf': 'application/pdf',
        'txt': 'text/plain',
        'doc': 'application/msword',
        'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'rtf': 'application/rtf',
        'odt': 'application/vnd.oasis.opendocument.text',
        'md': 'text/markdown',
        'json': 'application/json',
        'xml': 'application/xml',
        'csv': 'text/csv',
        'xls': 'application/vnd.ms-excel',
        'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'ppt': 'application/vnd.ms-powerpoint',
        'pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',

        // 3D
        'obj': 'application/object',
        'gltf': 'model/gltf+json',
        'glb': 'model/gltf-binary',
        'fbx': 'application/octet-stream',
        'dae': 'model/vnd.collada+xml',
        '3ds': 'application/octet-stream',
        'blend': 'application/x-blender',
        'stl': 'application/sla',
        'ply': 'application/ply',
    };

    return mimeTypes[extension] || 'application/octet-stream';
};

/**
 * Get icon for media type
 */
export const getMediaIcon = (type: MediaType): string => {
    const icons: Record<MediaType, string> = {
        'image': '🖼️',
        'video': '🎥',
        'audio': '🎵',
        'pdf': '📄',
        '3d': '🎮',
        'document': '📝',
        'unknown': '📄'
    };

    return icons[type] || '📄';
};

/**
 * Get background color class for media type
 */
export const getMediaBgColor = (type: MediaType): string => {
    const colors: Record<MediaType, string> = {
        'image': 'bg-gradient-to-br from-blue-400 to-blue-600',
        'video': 'bg-gradient-to-br from-red-400 to-red-600',
        'audio': 'bg-gradient-to-br from-green-400 to-green-600',
        'pdf': 'bg-gradient-to-br from-orange-400 to-orange-600',
        '3d': 'bg-gradient-to-br from-purple-400 to-purple-600',
        'document': 'bg-gradient-to-br from-gray-400 to-gray-600',
        'unknown': 'bg-gradient-to-br from-gray-400 to-gray-600'
    };

    return colors[type] || 'bg-gradient-to-br from-gray-400 to-gray-600';
};

/**
 * Format file size in human readable format
 */
export const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Check if file type is supported for preview
 */
export const isPreviewSupported = (type: MediaType): boolean => {
    return ['image', 'video', 'audio', 'pdf'].includes(type);
};

/**
 * Get appropriate preview component name
 */
export const getPreviewComponent = (type: MediaType): string => {
    const components: Record<MediaType, string> = {
        'image': 'ImagePreview',
        'video': 'VideoPreview',
        'audio': 'AudioPreview',
        'pdf': 'PDFPreview',
        '3d': 'Model3DPreview',
        'document': 'DocumentPreview',
        'unknown': 'GenericPreview'
    };

    return components[type] || 'GenericPreview';
};

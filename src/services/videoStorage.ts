const VIDEO_DB_NAME = 'mytube_video_storage';
const VIDEO_DB_VERSION = 1;
const VIDEO_STORE_NAME = 'videos';

let videoDBInstance: IDBDatabase | null = null;
const memoryBlobCache = new Map<string, Blob>();

export function openVideoDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (videoDBInstance) return resolve(videoDBInstance);

    const request = indexedDB.open(VIDEO_DB_NAME, VIDEO_DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(VIDEO_STORE_NAME)) {
        db.createObjectStore(VIDEO_STORE_NAME, { keyPath: 'id' });
      }
    };

    request.onsuccess = (event) => {
      videoDBInstance = (event.target as IDBOpenDBRequest).result;
      resolve(videoDBInstance);
    };

    request.onerror = () => {
      reject(request.error || new Error('Не удалось открыть IndexedDB видеохранилище.'));
    };
  });
}

export function saveVideoBlob(id: string, file: File | Blob, customName?: string): Promise<void> {
  memoryBlobCache.set(id, file);
  return openVideoDB().then(
    (db) =>
      new Promise((resolve, reject) => {
        const tx = db.transaction(VIDEO_STORE_NAME, 'readwrite');
        const store = tx.objectStore(VIDEO_STORE_NAME);

        const fileName = customName || (file as File).name || `video_${id}`;
        store.put({
          id,
          blob: file,
          name: fileName,
          type: file.type || 'video/mp4',
          size: file.size,
          savedAt: Date.now(),
        });

        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error || new Error('Ошибка записи видео в хранилище.'));
        tx.onabort = () => reject(tx.error || new Error('Транзакция сохранения видео прервана.'));
      })
  );
}

export function getVideoBlob(id: string): Promise<Blob | null> {
  if (memoryBlobCache.has(id)) {
    return Promise.resolve(memoryBlobCache.get(id) || null);
  }

  return openVideoDB().then(
    (db) =>
      new Promise((resolve, reject) => {
        const tx = db.transaction(VIDEO_STORE_NAME, 'readonly');
        const store = tx.objectStore(VIDEO_STORE_NAME);
        const request = store.get(id);

        request.onsuccess = () => {
          const blob = request.result ? request.result.blob : null;
          if (blob) {
            memoryBlobCache.set(id, blob);
          }
          resolve(blob);
        };
        request.onerror = () => reject(request.error);
      })
  );
}

export async function findVideoBlob(
  id?: string,
  fileName?: string,
  fileSize?: number
): Promise<Blob | null> {
  if (id) {
    const directBlob = await getVideoBlob(id);
    if (directBlob) return directBlob;
  }

  // Automatic recovery scan in IndexedDB
  try {
    const db = await openVideoDB();
    return new Promise((resolve) => {
      const tx = db.transaction(VIDEO_STORE_NAME, 'readonly');
      const store = tx.objectStore(VIDEO_STORE_NAME);
      const request = store.openCursor();

      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result as IDBCursorWithValue;
        if (cursor) {
          const val = cursor.value;
          if (
            (id && val.id === id) ||
            (fileName && val.name && val.name.toLowerCase() === fileName.toLowerCase()) ||
            (fileSize && val.size === fileSize && (!fileName || val.name === fileName))
          ) {
            const blob = val.blob;
            if (blob && id) memoryBlobCache.set(id, blob);
            resolve(blob);
            return;
          }
          cursor.continue();
        } else {
          resolve(null);
        }
      };
      request.onerror = () => resolve(null);
    });
  } catch {
    return null;
  }
}

export function deleteVideoBlob(id: string): Promise<void> {
  memoryBlobCache.delete(id);
  if (!id) return Promise.resolve();
  return openVideoDB().then(
    (db) =>
      new Promise((resolve, reject) => {
        const tx = db.transaction(VIDEO_STORE_NAME, 'readwrite');
        const store = tx.objectStore(VIDEO_STORE_NAME);
        store.delete(id);
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      })
  );
}

export async function hydrateVideoObjectUrls<
  T extends {
    id: string;
    url?: string;
    fileName?: string;
    fileSize?: number;
    fileMissing?: boolean;
    youtubeId?: string;
  }
>(videos: T[]): Promise<T[]> {
  for (const video of videos) {
    // If it's an external YouTube video or direct web link, skip blob creation
    if (
      video.youtubeId ||
      (video.url &&
        (video.url.startsWith('http://') || video.url.startsWith('https://')) &&
        !video.url.startsWith('blob:'))
    ) {
      video.fileMissing = false;
      continue;
    }

    if (!video.id) continue;

    try {
      const blob = await findVideoBlob(video.id, video.fileName, video.fileSize);
      if (blob) {
        if (video.url && video.url.startsWith('blob:')) {
          try {
            URL.revokeObjectURL(video.url);
          } catch {}
        }
        video.url = URL.createObjectURL(blob);
        video.fileMissing = false;
      } else {
        if (video.url && video.url.startsWith('blob:')) {
          video.url = '';
        }
        video.fileMissing = true;
      }
    } catch (err) {
      console.error('Ошибка восстановления URL видео:', video.id, err);
      if (video.url && video.url.startsWith('blob:')) {
        video.url = '';
      }
      video.fileMissing = true;
    }
  }
  return videos;
}

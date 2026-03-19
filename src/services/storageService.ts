import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from '../config/firebase';

export const storageService = {
  async upload(file: Blob, onProgress?: (pct: number) => void): Promise<{ url: string; path: string }> {
    const path = `artifacts/${Date.now()}_${Math.random().toString(36).slice(2)}`;
    const storageRef = ref(storage, path);
    const task = uploadBytesResumable(storageRef, file);

    return new Promise((resolve, reject) => {
      task.on(
        'state_changed',
        (snap) => {
          if (onProgress) {
            onProgress(Math.round((snap.bytesTransferred / snap.totalBytes) * 100));
          }
        },
        reject,
        async () => {
          const url = await getDownloadURL(task.snapshot.ref);
          resolve({ url, path });
        }
      );
    });
  },

  async delete(path: string): Promise<void> {
    try {
      await deleteObject(ref(storage, path));
    } catch {
      // ignore not-found errors
    }
  },
};

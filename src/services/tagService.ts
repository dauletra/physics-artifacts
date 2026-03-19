import {
  collection,
  doc,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import type { Tag } from '../types/artifact.types';

const COL = 'tags';

export const tagService = {
  async create(data: Omit<Tag, 'id'>): Promise<string> {
    const ref = await addDoc(collection(db, COL), { ...data, createdAt: serverTimestamp() });
    return ref.id;
  },

  async getAll(): Promise<Tag[]> {
    const snap = await getDocs(collection(db, COL));
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as Tag));
  },

  async update(id: string, data: Partial<Omit<Tag, 'id'>>): Promise<void> {
    await updateDoc(doc(db, COL, id), data);
  },

  async delete(id: string): Promise<void> {
    await deleteDoc(doc(db, COL, id));
  },
};

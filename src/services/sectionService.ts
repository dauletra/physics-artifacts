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
import type { Section } from '../types/artifact.types';

const COL = 'sections';

export const sectionService = {
  async create(data: Omit<Section, 'id'>): Promise<string> {
    const ref = await addDoc(collection(db, COL), { ...data, createdAt: serverTimestamp() });
    return ref.id;
  },

  async getAll(): Promise<Section[]> {
    const snap = await getDocs(collection(db, COL));
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as Section));
  },

  async update(id: string, data: Partial<Omit<Section, 'id'>>): Promise<void> {
    await updateDoc(doc(db, COL, id), data);
  },

  async delete(id: string): Promise<void> {
    await deleteDoc(doc(db, COL, id));
  },
};

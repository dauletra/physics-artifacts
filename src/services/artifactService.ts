import {
  collection,
  doc,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import type { Artifact } from '../types/artifact.types';

const COL = 'artifacts';

function stripUndefined<T extends object>(obj: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v !== undefined)
  ) as Partial<T>;
}

export const artifactService = {
  async create(data: Omit<Artifact, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const ref = await addDoc(collection(db, COL), {
      ...stripUndefined(data),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return ref.id;
  },

  async getByGroupId(groupId: string): Promise<Artifact[]> {
    const q = query(collection(db, COL), where('groupId', '==', groupId));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as Artifact));
  },

  async update(id: string, data: Partial<Omit<Artifact, 'id' | 'createdAt'>>): Promise<void> {
    await updateDoc(doc(db, COL, id), { ...stripUndefined(data), updatedAt: serverTimestamp() });
  },

  async delete(id: string): Promise<void> {
    await deleteDoc(doc(db, COL, id));
  },
};

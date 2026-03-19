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

export const artifactService = {
  async create(data: Omit<Artifact, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const ref = await addDoc(collection(db, COL), {
      ...data,
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
    await updateDoc(doc(db, COL, id), { ...data, updatedAt: serverTimestamp() });
  },

  async delete(id: string): Promise<void> {
    await deleteDoc(doc(db, COL, id));
  },
};

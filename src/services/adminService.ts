import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  deleteField,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import type { Admin } from '../types/artifact.types';

const COL = 'admins';

export const adminService = {
  async getAll(): Promise<Admin[]> {
    const snap = await getDocs(collection(db, COL));
    return snap.docs.map(d => ({ email: d.id, ...d.data() } as Admin));
  },

  async getByEmail(email: string): Promise<Admin | null> {
    const snap = await getDoc(doc(db, COL, email));
    if (!snap.exists()) return null;
    return { email: snap.id, ...snap.data() } as Admin;
  },

  async add(email: string, isSuper: boolean, addedBy: string, publicName?: string): Promise<void> {
    const data: Record<string, unknown> = {
      isSuper,
      addedBy,
      addedAt: serverTimestamp(),
    };
    if (publicName?.trim()) data.publicName = publicName.trim();
    await setDoc(doc(db, COL, email), data);
  },

  async updatePublicName(email: string, publicName: string): Promise<void> {
    const trimmed = publicName.trim();
    await updateDoc(doc(db, COL, email), {
      publicName: trimmed ? trimmed : deleteField(),
    });
  },

  async remove(email: string): Promise<void> {
    await deleteDoc(doc(db, COL, email));
  },
};

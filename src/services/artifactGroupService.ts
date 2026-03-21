import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  deleteField,
  query,
  where,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import type { ArtifactGroup } from '../types/artifact.types';
import { artifactService } from './artifactService';
import { storageService } from './storageService';
import { normalizeArtifactGroup } from '../utils/artifactHelpers';

const COL = 'artifact_groups';

function stripUndefined<T extends object>(obj: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v !== undefined)
  ) as Partial<T>;
}

export const artifactGroupService = {
  async create(data: Omit<ArtifactGroup, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const ref = await addDoc(collection(db, COL), {
      ...stripUndefined(data),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return ref.id;
  },

  async getById(id: string): Promise<ArtifactGroup | null> {
    const snap = await getDoc(doc(db, COL, id));
    if (!snap.exists()) return null;
    return normalizeArtifactGroup({ id: snap.id, ...snap.data() });
  },

  async getAll(): Promise<ArtifactGroup[]> {
    const snap = await getDocs(collection(db, COL));
    return snap.docs.map(d => normalizeArtifactGroup({ id: d.id, ...d.data() }));
  },

  async getPublic(): Promise<ArtifactGroup[]> {
    const q = query(collection(db, COL), where('isPublic', '==', true));
    const snap = await getDocs(q);
    return snap.docs.map(d => normalizeArtifactGroup({ id: d.id, ...d.data() }));
  },

  async update(id: string, data: Partial<Omit<ArtifactGroup, 'id' | 'createdAt'>>): Promise<void> {
    await updateDoc(doc(db, COL, id), { ...stripUndefined(data), updatedAt: serverTimestamp() });
  },

  async clearThumbnail(id: string): Promise<void> {
    await updateDoc(doc(db, COL, id), {
      thumbnail: deleteField(),
      thumbnailPath: deleteField(),
      updatedAt: serverTimestamp(),
    });
  },

  async clearSectionId(sectionId: string): Promise<void> {
    const q = query(collection(db, COL), where('sectionId', '==', sectionId));
    const snap = await getDocs(q);
    await Promise.all(snap.docs.map(d => updateDoc(d.ref, { sectionId: deleteField() })));
  },

  async delete(id: string): Promise<void> {
    const group = await this.getById(id);
    if (group?.thumbnailPath) {
      await storageService.delete(group.thumbnailPath);
    }
    const artifacts = await artifactService.getByGroupId(id);
    await Promise.all(artifacts.map(a => artifactService.delete(a.id)));
    await deleteDoc(doc(db, COL, id));
  },
};

import { Timestamp } from 'firebase/firestore';

export interface ArtifactGroup {
  id: string;
  title: string;
  description?: string;
  thumbnail?: string;
  thumbnailPath?: string;
  isPublic: boolean;
  usesAI?: boolean;
  variantCount: number;
  variantLabels: string[];
  grade?: number[];
  quarter?: number;
  sectionId?: string;
  tagIds: string[];
  createdBy?: string;
  createdByName?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Artifact {
  id: string;
  groupId: string;
  variantLabel: string;
  embedUrl: string;
  description?: string;
  order: number;
  requiresAuth?: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Section {
  id: string;
  grade: number;
  quarter: number;
  label: string;
  order: number;
}

export interface Tag {
  id: string;
  label: string;
  order: number;
}

export interface Admin {
  email: string;
  isSuper?: boolean;
  publicName?: string;
  addedBy?: string;
  addedAt?: Timestamp;
}

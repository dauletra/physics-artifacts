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

import type { ArtifactGroup } from '../types/artifact.types';

export function normalizeArtifactGroup(raw: Record<string, unknown>): ArtifactGroup {
  return {
    ...(raw as unknown as ArtifactGroup),
    grade: (raw.grade as number[]) ?? [],
    tagIds: (raw.tagIds as string[]) ?? [],
    variantCount: (raw.variantCount as number) ?? 0,
    variantLabels: (raw.variantLabels as string[]) ?? [],
  };
}

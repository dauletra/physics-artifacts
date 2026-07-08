import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useArtifactGroups } from '../hooks/useArtifactGroups';
import { useSections } from '../hooks/useSections';
import { useTags } from '../hooks/useTags';
import { SiteHeader } from '../components/layout/SiteHeader';
import { GradeSection } from '../components/showcase/GradeSection';
import { ArtifactCard } from '../components/showcase/ArtifactCard';
import { FilterBar } from '../components/showcase/FilterBar';
import { FilterChips } from '../components/showcase/FilterChips';
import { SkeletonCard } from '../components/ui/SkeletonCard';
import { ErrorState } from '../components/ui/ErrorState';
import { EmptyState } from '../components/ui/EmptyState';
import { GRADES, NEW_ARTIFACT_THRESHOLD_MS } from '../config/constants';

export function ShowcasePage() {
  const { groups, loading, error, reload } = useArtifactGroups({ publicOnly: true });
  const { sections } = useSections();
  const { tags } = useTags();
  const [searchParams, setSearchParams] = useSearchParams();

  const selectedTagIds = searchParams.get('tags')?.split(',').filter(Boolean) ?? [];
  const selectedAuthor = searchParams.get('author') || null;
  const search = searchParams.get('q') || '';

  function onTagIdsChange(ids: string[]) {
    setSearchParams(prev => {
      if (ids.length > 0) prev.set('tags', ids.join(',')); else prev.delete('tags');
      return prev;
    });
  }

  function onSearchChange(value: string) {
    setSearchParams(prev => {
      if (value) prev.set('q', value); else prev.delete('q');
      return prev;
    });
  }

  function clearAuthor() {
    setSearchParams(prev => {
      prev.delete('author');
      return prev;
    });
  }

  function clearAll() {
    setSearchParams(prev => {
      ['tags', 'author', 'q'].forEach(k => prev.delete(k));
      return prev;
    });
  }

  const [now] = useState(() => Date.now());

  const filteredGroups = useMemo(() => {
    const q = search.trim().toLowerCase();
    return groups
      .filter(g => selectedTagIds.length === 0 || selectedTagIds.some(id => g.tagIds.includes(id)))
      .filter(g => !selectedAuthor || g.createdBy === selectedAuthor)
      .filter(g => !q || g.title.toLowerCase().includes(q) || g.description?.toLowerCase().includes(q));
  }, [groups, selectedTagIds, selectedAuthor, search]);

  const isFiltered = !!(selectedTagIds.length || selectedAuthor || search);

  const authorDisplayName = useMemo(() => {
    if (!selectedAuthor) return null;
    const match = groups.find(g => g.createdBy === selectedAuthor && g.createdByName);
    return match?.createdByName || selectedAuthor.split('@')[0];
  }, [groups, selectedAuthor]);

  const gradeSections = useMemo(
    () => GRADES.map(grade => ({
      grade,
      groups: filteredGroups.filter(g => g.grade?.includes(grade)),
    })),
    [filteredGroups]
  );

  const otherGroups = useMemo(
    () => filteredGroups.filter(g => !g.grade || g.grade.length === 0),
    [filteredGroups]
  );

  const hasAnyResults = gradeSections.some(s => s.groups.length > 0) || otherGroups.length > 0;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <SiteHeader search={search} onSearchChange={onSearchChange} />

      <FilterBar
        tags={tags}
        selectedTagIds={selectedTagIds}
        onTagIdsChange={onTagIdsChange}
      />

      <main className="max-w-7xl mx-auto px-4 py-6">
        <FilterChips
          authorDisplayName={authorDisplayName}
          search={search}
          isFiltered={isFiltered}
          onClearAuthor={clearAuthor}
          onClearSearch={() => onSearchChange('')}
          onClearAll={clearAll}
        />

        {/* Results count */}
        {isFiltered && !loading && (
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Табылды: {filteredGroups.length}
          </p>
        )}

        {/* Error */}
        {error && <ErrorState message={`Артефактілерді жүктеу мүмкін болмады: ${error.message}`} onRetry={reload} />}

        {!error && (
          <>
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
              </div>
            ) : (
              <div className="space-y-10">
                {gradeSections.map(({ grade, groups: gGroups }) => (
                  <GradeSection
                    key={grade}
                    title={`${grade} сынып`}
                    grade={grade}
                    groups={gGroups}
                    sections={sections}
                    now={now}
                    newArtifactThresholdMs={NEW_ARTIFACT_THRESHOLD_MS}
                  />
                ))}

                {otherGroups.length > 0 && (
                  <section className="space-y-4">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 pb-2 border-b border-gray-200 dark:border-gray-800">
                      Басқа
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                      {otherGroups.map(g => (
                        <ArtifactCard
                          key={g.id}
                          group={g}
                          showNewBadge={now - g.createdAt.toMillis() < NEW_ARTIFACT_THRESHOLD_MS}
                        />
                      ))}
                    </div>
                  </section>
                )}

                {!hasAnyResults && <EmptyState onClearFilters={clearAll} />}
              </div>
            )}
          </>
        )}
      </main>

      <footer className="mt-12 border-t border-gray-200 dark:border-gray-800 py-6 px-4">
        <div className="max-w-7xl mx-auto flex flex-col items-center gap-3 text-xs text-gray-500 dark:text-gray-500">
          <div className="flex flex-wrap justify-center items-center gap-x-4 gap-y-2">
            <a
              href="https://t.me/dauletra"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
            >
              Telegram: @dauletra
            </a>
            <a
              href="mailto:daulet.rakhmankul@gmail.com"
              className="hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
            >
              daulet.rakhmankul@gmail.com
            </a>
            <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-800 rounded-full">
              Артефакт қалай жасалады? — жақында
            </span>
          </div>
          <span>Тараз, 2026</span>
        </div>
      </footer>
    </div>
  );
}

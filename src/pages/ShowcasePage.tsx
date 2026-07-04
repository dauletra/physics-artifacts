import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useArtifactGroups } from '../hooks/useArtifactGroups';
import { useSections } from '../hooks/useSections';
import { useTags } from '../hooks/useTags';
import { SiteHeader } from '../components/layout/SiteHeader';
import { ArtifactCard } from '../components/showcase/ArtifactCard';
import { FilterBar } from '../components/showcase/FilterBar';
import { FilterChips } from '../components/showcase/FilterChips';
import { SkeletonCard } from '../components/ui/SkeletonCard';
import { ErrorState } from '../components/ui/ErrorState';
import { EmptyState } from '../components/ui/EmptyState';
import { INITIAL_PAGE_SIZE, PAGE_SIZE, NEW_ARTIFACT_THRESHOLD_MS } from '../config/constants';

export function ShowcasePage() {
  const { groups, loading, error, reload } = useArtifactGroups({ publicOnly: true });
  const { sections } = useSections();
  const { tags } = useTags();
  const [searchParams, setSearchParams] = useSearchParams();

  const selectedGrade = Number(searchParams.get('grade')) || null;
  const selectedQuarter = Number(searchParams.get('quarter')) || null;
  const selectedSectionId = searchParams.get('section') || null;
  const selectedTagIds = searchParams.get('tags')?.split(',').filter(Boolean) ?? [];
  const selectedOther = searchParams.get('other') === 'true';
  const selectedAuthor = searchParams.get('author') || null;
  const search = searchParams.get('q') || '';

  const [visibleCount, setVisibleCount] = useState(INITIAL_PAGE_SIZE);

  useEffect(() => {
    setVisibleCount(INITIAL_PAGE_SIZE);
  }, [selectedGrade, selectedQuarter, selectedSectionId, selectedTagIds.join(','), selectedOther, selectedAuthor, search]);

  function onGradeChange(grade: number | null) {
    setSearchParams(prev => {
      if (grade) prev.set('grade', String(grade)); else prev.delete('grade');
      prev.delete('quarter');
      prev.delete('section');
      prev.delete('other');
      return prev;
    });
  }

  function onOtherChange(val: boolean) {
    setSearchParams(prev => {
      if (val) {
        prev.set('other', 'true');
        prev.delete('grade');
        prev.delete('quarter');
        prev.delete('section');
      } else {
        prev.delete('other');
      }
      return prev;
    });
  }

  function onQuarterChange(quarter: number | null) {
    setSearchParams(prev => {
      if (quarter) prev.set('quarter', String(quarter)); else prev.delete('quarter');
      prev.delete('section');
      return prev;
    });
  }

  function onSectionChange(section: string | null) {
    setSearchParams(prev => {
      if (section) prev.set('section', section); else prev.delete('section');
      return prev;
    });
  }

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
      ['grade', 'quarter', 'section', 'tags', 'other', 'author', 'q'].forEach(k => prev.delete(k));
      return prev;
    });
  }

  const now = Date.now();

  const filteredGroups = useMemo(() => {
    const q = search.trim().toLowerCase();
    return groups
      .filter(g => {
        if (selectedOther) return !g.grade || g.grade.length === 0;
        return !selectedGrade || g.grade?.includes(selectedGrade);
      })
      .filter(g => !selectedQuarter || g.quarter === selectedQuarter)
      .filter(g => !selectedSectionId || g.sectionId === selectedSectionId)
      .filter(g => selectedTagIds.length === 0 || selectedTagIds.some(id => g.tagIds.includes(id)))
      .filter(g => !selectedAuthor || g.createdBy === selectedAuthor)
      .filter(g => !q || g.title.toLowerCase().includes(q) || g.description?.toLowerCase().includes(q));
  }, [groups, selectedGrade, selectedQuarter, selectedSectionId, selectedTagIds, selectedOther, selectedAuthor, search]);

  const visibleGroups = filteredGroups.slice(0, visibleCount);
  const hasMore = visibleCount < filteredGroups.length;
  const isFiltered = !!(selectedGrade || selectedQuarter || selectedSectionId || selectedTagIds.length || selectedOther || selectedAuthor || search);

  const authorDisplayName = useMemo(() => {
    if (!selectedAuthor) return null;
    const match = groups.find(g => g.createdBy === selectedAuthor && g.createdByName);
    return match?.createdByName || selectedAuthor.split('@')[0];
  }, [groups, selectedAuthor]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <SiteHeader search={search} onSearchChange={onSearchChange} />

      <FilterBar
        sections={sections}
        tags={tags}
        selectedGrade={selectedGrade}
        selectedQuarter={selectedQuarter}
        selectedSectionId={selectedSectionId}
        selectedTagIds={selectedTagIds}
        selectedOther={selectedOther}
        onGradeChange={onGradeChange}
        onQuarterChange={onQuarterChange}
        onSectionChange={onSectionChange}
        onTagIdsChange={onTagIdsChange}
        onOtherChange={onOtherChange}
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

        {/* Grid */}
        {!error && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {loading
                ? Array.from({ length: INITIAL_PAGE_SIZE }).map((_, i) => <SkeletonCard key={i} />)
                : visibleGroups.map(g => (
                    <ArtifactCard
                      key={g.id}
                      group={g}
                      showNewBadge={now - g.createdAt.toMillis() < NEW_ARTIFACT_THRESHOLD_MS}
                    />
                  ))
              }
            </div>

            {/* Load more */}
            {!loading && hasMore && (
              <div className="flex justify-center mt-8">
                <button
                  onClick={() => setVisibleCount(c => c + PAGE_SIZE)}
                  className="px-6 py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Көбірек жүктеу ({filteredGroups.length - visibleCount})
                </button>
              </div>
            )}

            {!loading && filteredGroups.length === 0 && <EmptyState onClearFilters={clearAll} />}
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

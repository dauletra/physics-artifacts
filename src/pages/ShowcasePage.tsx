import { useState, useMemo, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useArtifactGroups } from '../hooks/useArtifactGroups';
import { useSections } from '../hooks/useSections';
import { useTags } from '../hooks/useTags';
import { useAuth } from '../context/AuthContext';
import { ArtifactCard } from '../components/showcase/ArtifactCard';
import { HierarchicalFilter } from '../components/showcase/HierarchicalFilter';
import { SkeletonCard } from '../components/ui/SkeletonCard';
import { ErrorState } from '../components/ui/ErrorState';
import { INITIAL_PAGE_SIZE, PAGE_SIZE, NEW_ARTIFACT_THRESHOLD_MS } from '../config/constants';

export function ShowcasePage() {
  const { isAdmin } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const { groups, loading, error, reload } = useArtifactGroups({ publicOnly: true });
  const { sections } = useSections();
  const { tags } = useTags();

  const selectedGrade = Number(searchParams.get('grade')) || null;
  const selectedQuarter = Number(searchParams.get('quarter')) || null;
  const selectedSectionId = searchParams.get('section') || null;
  const selectedTagIds = searchParams.get('tags')?.split(',').filter(Boolean) ?? [];
  const selectedOther = searchParams.get('other') === 'true';

  const [visibleCount, setVisibleCount] = useState(INITIAL_PAGE_SIZE);

  useEffect(() => {
    setVisibleCount(INITIAL_PAGE_SIZE);
  }, [selectedGrade, selectedQuarter, selectedSectionId, selectedTagIds.join(','), selectedOther]);

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

  const now = Date.now();

  const filteredGroups = useMemo(() => {
    return groups
      .filter(g => {
        if (selectedOther) return !g.grade || g.grade.length === 0;
        return !selectedGrade || g.grade?.includes(selectedGrade);
      })
      .filter(g => !selectedQuarter || g.quarter === selectedQuarter)
      .filter(g => !selectedSectionId || g.sectionId === selectedSectionId)
      .filter(g => selectedTagIds.length === 0 || selectedTagIds.some(id => g.tagIds.includes(id)));
  }, [groups, selectedGrade, selectedQuarter, selectedSectionId, selectedTagIds, selectedOther]);

  const visibleGroups = filteredGroups.slice(0, visibleCount);
  const hasMore = visibleCount < filteredGroups.length;
  const isFiltered = !!(selectedGrade || selectedQuarter || selectedSectionId || selectedTagIds.length || selectedOther);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-4 py-3 flex items-center justify-between">
        <h1 className="font-bold text-gray-900 dark:text-gray-100 text-lg">Физика — Артефактілер</h1>
        <Link
          to={isAdmin ? '/admin' : '/login'}
          className="text-xs text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
        >
          {isAdmin ? 'Әкімші панелі' : 'Кіру'}
        </Link>
      </header>

      {/* Filter */}
      <HierarchicalFilter
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

            {!loading && filteredGroups.length === 0 && (
              <div className="text-center py-16 text-gray-500 dark:text-gray-400">
                Таңдалған сүзгілер бойынша артефактілер жоқ
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

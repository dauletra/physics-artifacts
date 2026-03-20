import { ChevronLeft } from 'lucide-react';
import type { Section, Tag } from '../../types/artifact.types';
import { GRADES, QUARTERS } from '../../config/constants';

interface HierarchicalFilterProps {
  sections: Section[];
  tags: Tag[];
  selectedGrade: number | null;
  selectedQuarter: number | null;
  selectedSectionId: string | null;
  selectedTagIds: string[];
  selectedOther: boolean;
  onGradeChange(v: number | null): void;
  onQuarterChange(v: number | null): void;
  onSectionChange(v: string | null): void;
  onTagIdsChange(v: string[]): void;
  onOtherChange(v: boolean): void;
}

function OptionBtn({ onClick, children }: { onClick(): void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className="px-3 py-1.5 rounded-full text-sm whitespace-nowrap bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
    >
      {children}
    </button>
  );
}

function ActiveCrumb({ label, onBack }: { label: string; onBack(): void }) {
  return (
    <button
      onClick={onBack}
      className="flex items-center gap-1 px-3 py-1.5 rounded-full text-sm whitespace-nowrap bg-blue-600 text-white hover:bg-blue-500 transition-colors shrink-0"
    >
      <ChevronLeft className="w-3.5 h-3.5" />
      {label}
    </button>
  );
}

function TagBtn({ active, onClick, children }: { active: boolean; onClick(): void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-full text-sm whitespace-nowrap transition-colors ${
        active
          ? 'bg-violet-600 text-white'
          : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-violet-50 dark:hover:bg-violet-900/30 hover:text-violet-600 dark:hover:text-violet-400'
      }`}
    >
      {children}
    </button>
  );
}

export function HierarchicalFilter({
  sections,
  tags,
  selectedGrade,
  selectedQuarter,
  selectedSectionId,
  selectedTagIds,
  selectedOther,
  onGradeChange,
  onQuarterChange,
  onSectionChange,
  onTagIdsChange,
  onOtherChange,
}: HierarchicalFilterProps) {
  const visibleSections = sections.filter(
    s => s.grade === selectedGrade && s.quarter === selectedQuarter
  );

  function toggleTag(id: string) {
    onTagIdsChange(
      selectedTagIds.includes(id)
        ? selectedTagIds.filter(t => t !== id)
        : [...selectedTagIds, id]
    );
  }

  // Determine current level
  // level 0: choose grade
  // level 1: grade chosen, choose quarter
  // level 2: quarter chosen, choose section (or no sections available)
  const level = selectedGrade === null ? 0 : selectedQuarter === null ? 1 : 2;

  return (
    <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-20 py-3 px-4 space-y-2">

      {/* Row 1: hierarchical drill-down */}
      <div className="overflow-x-auto scrollbar-hide">
        <div className="flex items-center gap-2 min-w-max">

          {/* "Басқа" selected — terminal state, no further drill-down */}
          {selectedOther && (
            <ActiveCrumb label="Басқа" onBack={() => onOtherChange(false)} />
          )}

          {/* Level 0: pick grade */}
          {!selectedOther && level === 0 && (
            <>
              <span className="text-xs text-gray-400 dark:text-gray-500 shrink-0">Сынып:</span>
              {GRADES.map(g => (
                <OptionBtn key={g} onClick={() => onGradeChange(g)}>
                  {g}
                </OptionBtn>
              ))}
              <OptionBtn onClick={() => onOtherChange(true)}>Басқа</OptionBtn>
            </>
          )}

          {/* Level 1: grade chosen, pick quarter */}
          {!selectedOther && level === 1 && (
            <>
              <ActiveCrumb
                label={`${selectedGrade} сынып`}
                onBack={() => onGradeChange(null)}
              />
              <span className="text-xs text-gray-400 dark:text-gray-500 shrink-0">Тоқсан:</span>
              {QUARTERS.map(q => (
                <OptionBtn key={q} onClick={() => onQuarterChange(q)}>
                  {q}
                </OptionBtn>
              ))}
            </>
          )}

          {/* Level 2: quarter chosen, pick section */}
          {!selectedOther && level === 2 && (
            <>
              <ActiveCrumb
                label={`${selectedGrade} сынып`}
                onBack={() => onGradeChange(null)}
              />
              <ActiveCrumb
                label={`${selectedQuarter} тоқсан`}
                onBack={() => onQuarterChange(null)}
              />
              {visibleSections.length > 0 ? (
                <>
                  <span className="text-xs text-gray-400 dark:text-gray-500 shrink-0">Бөлім:</span>
                  {visibleSections.map(s => (
                    <button
                      key={s.id}
                      onClick={() => onSectionChange(selectedSectionId === s.id ? null : s.id)}
                      className={`px-3 py-1.5 rounded-full text-sm whitespace-nowrap transition-colors ${
                        selectedSectionId === s.id
                          ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 ring-1 ring-blue-400'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:text-blue-600 dark:hover:text-blue-400'
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </>
              ) : (
                <span className="text-xs text-gray-400 dark:text-gray-500 italic">бөлімдер жоқ</span>
              )}
            </>
          )}
        </div>
      </div>

      {/* Row 2: Tags */}
      {tags.length > 0 && (
        <div className="overflow-x-auto scrollbar-hide">
          <div className="flex items-center gap-2 min-w-max">
            <span className="text-xs text-gray-400 dark:text-gray-500 shrink-0">Тегтер:</span>
            {tags.map(tag => (
              <TagBtn
                key={tag.id}
                active={selectedTagIds.includes(tag.id)}
                onClick={() => toggleTag(tag.id)}
              >
                {tag.label}
              </TagBtn>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

import { useState } from 'react';
import type { ArtifactGroup, Section } from '../../types/artifact.types';
import { QUARTERS } from '../../config/constants';
import { ArtifactCard } from './ArtifactCard';

interface GradeSectionProps {
  title: string;
  grade: number;
  groups: ArtifactGroup[];
  sections: Section[];
  now: number;
  newArtifactThresholdMs: number;
}

interface CommonProps {
  now: number;
  newArtifactThresholdMs: number;
}

const OTHER_SECTION = 'other';

function ArtifactGrid({ groups, now, newArtifactThresholdMs }: { groups: ArtifactGroup[] } & CommonProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {groups.map(g => (
        <ArtifactCard
          key={g.id}
          group={g}
          showNewBadge={now - g.createdAt.toMillis() < newArtifactThresholdMs}
        />
      ))}
    </div>
  );
}

function FlatGroup({ title, groups, now, newArtifactThresholdMs }: { title: string; groups: ArtifactGroup[] } & CommonProps) {
  if (groups.length === 0) return null;

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</h3>
      <ArtifactGrid groups={groups} now={now} newArtifactThresholdMs={newArtifactThresholdMs} />
    </div>
  );
}

function QuarterGroup({ grade, quarter, groups, sections, now, newArtifactThresholdMs }: { grade: number; quarter: number; groups: ArtifactGroup[]; sections: Section[] } & CommonProps) {
  const [activeSection, setActiveSection] = useState<string | null>(null);

  if (groups.length === 0) return null;

  const quarterSections = sections.filter(s => s.grade === grade && s.quarter === quarter).sort((a, b) => a.order - b.order);

  if (quarterSections.length === 0) {
    return <FlatGroup title={`${quarter} тоқсан`} groups={groups} now={now} newArtifactThresholdMs={newArtifactThresholdMs} />;
  }

  const sectionIds = new Set(quarterSections.map(s => s.id));
  const hasOther = groups.some(g => !g.sectionId || !sectionIds.has(g.sectionId));

  const visibleGroups = !activeSection
    ? groups
    : activeSection === OTHER_SECTION
      ? groups.filter(g => !g.sectionId || !sectionIds.has(g.sectionId))
      : groups.filter(g => g.sectionId === activeSection);

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">{quarter} тоқсан</h3>
      <div className="flex flex-wrap items-center gap-2">
        {quarterSections.map(s => (
          <button
            key={s.id}
            onClick={() => setActiveSection(prev => prev === s.id ? null : s.id)}
            className={`px-3.5 py-2 rounded-full text-sm whitespace-nowrap transition-colors ${
              activeSection === s.id
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:text-blue-600 dark:hover:text-blue-400'
            }`}
          >
            {s.label}
          </button>
        ))}
        {hasOther && (
          <button
            onClick={() => setActiveSection(prev => prev === OTHER_SECTION ? null : OTHER_SECTION)}
            className={`px-3.5 py-2 rounded-full text-sm whitespace-nowrap transition-colors ${
              activeSection === OTHER_SECTION
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:text-blue-600 dark:hover:text-blue-400'
            }`}
          >
            Басқа
          </button>
        )}
      </div>
      <ArtifactGrid groups={visibleGroups} now={now} newArtifactThresholdMs={newArtifactThresholdMs} />
    </div>
  );
}

export function GradeSection({ title, grade, groups, sections, now, newArtifactThresholdMs }: GradeSectionProps) {
  if (groups.length === 0) return null;

  const noQuarter = groups.filter(g => !g.quarter);
  const byQuarter = QUARTERS.map(q => ({ quarter: q, items: groups.filter(g => g.quarter === q) }));

  return (
    <section className="space-y-6">
      <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 pb-2 border-b border-gray-200 dark:border-gray-800">
        {title}
      </h2>

      <div className="space-y-6">
        <FlatGroup title="Тоқсаны көрсетілмеген" groups={noQuarter} now={now} newArtifactThresholdMs={newArtifactThresholdMs} />
        {byQuarter.map(({ quarter, items }) => (
          <QuarterGroup
            key={quarter}
            grade={grade}
            quarter={quarter}
            groups={items}
            sections={sections}
            now={now}
            newArtifactThresholdMs={newArtifactThresholdMs}
          />
        ))}
      </div>
    </section>
  );
}

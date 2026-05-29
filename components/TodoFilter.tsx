'use client';

import { FilterType, SortMode } from '@/types/todo';

interface TodoFilterProps {
  filter: FilterType;
  setFilter: (filter: FilterType) => void;
  activeCount: number;
  completedCount: number;
  onClearCompleted: () => void;
  sortMode: SortMode;
  setSortMode: (mode: SortMode) => void;
}

const FILTERS: { label: string; value: FilterType }[] = [
  { label: 'All', value: 'all' },
  { label: 'Active', value: 'active' },
  { label: 'Completed', value: 'completed' },
];

const SORT_OPTIONS: { label: string; value: SortMode }[] = [
  { label: 'Default',  value: 'default' },
  { label: 'Priority', value: 'priority' },
  { label: 'Deadline', value: 'deadline' },
];

export default function TodoFilter({
  filter,
  setFilter,
  activeCount,
  completedCount,
  onClearCompleted,
  sortMode,
  setSortMode,
}: TodoFilterProps) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-center gap-1">
        <span className="text-xs text-gray-400 dark:text-gray-500 mr-1">Sort:</span>
        <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-700/60 rounded-xl p-1" role="group" aria-label="Sort todos">
          {SORT_OPTIONS.map(({ label, value }) => (
            <button
              key={value}
              onClick={() => setSortMode(value)}
              aria-pressed={sortMode === value}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all duration-150 ${
                sortMode === value
                  ? 'bg-white dark:bg-gray-600 text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <p className="text-xs text-gray-400 dark:text-gray-500 order-last sm:order-first tabular-nums">
          {activeCount} {activeCount === 1 ? 'item' : 'items'} left
        </p>

        <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-700/60 rounded-xl p-1" role="group" aria-label="Filter todos">
          {FILTERS.map(({ label, value }) => (
            <button
              key={value}
              onClick={() => setFilter(value)}
              aria-pressed={filter === value}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 ${
                filter === value
                  ? 'bg-white dark:bg-gray-600 text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <button
          onClick={onClearCompleted}
          disabled={completedCount === 0}
          className="text-xs text-gray-400 hover:text-red-500 dark:hover:text-red-400 disabled:opacity-30 disabled:cursor-not-allowed transition-colors order-first sm:order-last"
        >
          Clear completed
        </button>
      </div>
    </div>
  );
}

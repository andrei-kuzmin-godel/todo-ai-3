'use client';

import { useState, FormEvent } from 'react';
import { PriorityLevel } from '@/types/todo';

interface TodoInputProps {
  onAdd: (text: string, priority: PriorityLevel, deadline?: number) => void;
}

const PRIORITY_OPTIONS: { value: PriorityLevel; label: string; dotClass: string }[] = [
  { value: 'high',   label: 'High',   dotClass: 'bg-red-400' },
  { value: 'medium', label: 'Medium', dotClass: 'bg-yellow-400' },
  { value: 'low',    label: 'Low',    dotClass: 'bg-emerald-400' },
];

// Built once at module load — constructing an Intl.DateTimeFormat is expensive
// and must not happen on every render (mirrors TodoItem's DEADLINE_FORMATTER).
const DATE_LABEL_FORMATTER = new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric' });

// `deadline` is a YYYY-MM-DD string. Parse it as a local date (same approach as
// handleSubmit) so the label shows the picked day, with no UTC off-by-one.
function formatDeadlineLabel(deadline: string): string {
  const [y, m, d] = deadline.split('-').map(Number);
  return DATE_LABEL_FORMATTER.format(new Date(y, m - 1, d));
}

export default function TodoInput({ onAdd }: TodoInputProps) {
  const [value, setValue] = useState('');
  const [priority, setPriority] = useState<PriorityLevel>('medium');
  const [deadline, setDeadline] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = value.trim();
    if (!trimmed) return;
    let deadlineMs: number | undefined;
    if (deadline) {
      const [y, m, d] = deadline.split('-').map(Number);
      deadlineMs = new Date(y, m - 1, d).getTime();
    }
    onAdd(trimmed, priority, deadlineMs);
    setValue('');
    setPriority('medium');
    setDeadline('');
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <div className="flex gap-3">
        <input
          type="text"
          value={value}
          onChange={e => setValue(e.target.value)}
          placeholder="What needs to be done?"
          aria-label="New todo"
          maxLength={500}
          className="flex-1 px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-sm sm:text-base shadow-sm"
        />
        <button
          type="submit"
          disabled={!value.trim()}
          className="px-5 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 dark:disabled:bg-indigo-800/50 text-white font-semibold rounded-xl transition-all shadow-sm hover:shadow-md disabled:cursor-not-allowed text-sm sm:text-base flex items-center gap-2 min-w-[52px] justify-center"
          aria-label="Add todo"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          <span className="hidden sm:inline">Add</span>
        </button>
      </div>

      {/* Compact metadata toolbar: priority segmented control + due-date pill */}
      <div className="flex flex-wrap items-center gap-2">
        <div
          className="inline-flex items-center gap-0.5 p-0.5 rounded-lg bg-gray-100 dark:bg-gray-700/50"
          role="group"
          aria-label="Priority"
        >
          {PRIORITY_OPTIONS.map(({ value: val, label, dotClass }) => (
            <button
              key={val}
              type="button"
              onClick={() => setPriority(val)}
              aria-pressed={priority === val}
              aria-label={`${label} priority`}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                priority === val
                  ? 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-100 shadow-sm'
                  : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'
              }`}
            >
              <span className={`w-2 h-2 rounded-full flex-shrink-0 ${dotClass}`} aria-hidden="true" />
              {label}
            </button>
          ))}
        </div>

        {/* Due-date pill. The native date input is overlaid transparently on
            top, so tapping the pill opens the OS picker directly — reliable on
            mobile (iOS Safari) where showPicker() is not. */}
        <div
          className={`relative flex items-center gap-1 rounded-lg text-xs font-medium transition-all border ${
            deadline
              ? 'border-indigo-200 dark:border-indigo-500/40 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300'
              : 'border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700/50'
          }`}
        >
          {/* Visual label (non-interactive — the input overlay handles taps) */}
          <span className="flex items-center gap-1.5 pl-2.5 pr-2 py-1 pointer-events-none">
            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            {deadline ? formatDeadlineLabel(deadline) : 'Due date'}
          </span>

          {/* Real date input, transparent and stretched over the label so a tap
              anywhere on the pill opens the native picker. When a date is set it
              stops short of the clear button so that stays tappable. */}
          <input
            type="date"
            value={deadline}
            onChange={e => setDeadline(e.target.value)}
            title="Set a due date"
            aria-label="Due date (optional)"
            className={`absolute inset-y-0 left-0 opacity-0 cursor-pointer ${deadline ? 'right-7' : 'right-0'}`}
          />

          {deadline && (
            <button
              type="button"
              onClick={() => setDeadline('')}
              aria-label="Clear due date"
              className="relative z-10 flex items-center justify-center pr-2 py-1 text-indigo-400 hover:text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-200 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </form>
  );
}

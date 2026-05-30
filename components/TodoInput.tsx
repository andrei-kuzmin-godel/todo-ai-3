'use client';

import { useState, FormEvent } from 'react';
import { PriorityLevel } from '@/types/todo';
import DatePicker from '@/components/DatePicker';

interface TodoInputProps {
  onAdd: (text: string, priority: PriorityLevel, deadline?: number) => void;
}

const PRIORITY_OPTIONS: { value: PriorityLevel; label: string; dotClass: string }[] = [
  { value: 'high',   label: 'High',   dotClass: 'bg-red-400' },
  { value: 'medium', label: 'Medium', dotClass: 'bg-yellow-400' },
  { value: 'low',    label: 'Low',    dotClass: 'bg-emerald-400' },
];

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

        {/* Due-date picker. Custom popover calendar (not the native date input):
            tapping outside closes it without applying a date — see DatePicker. */}
        <DatePicker value={deadline} onChange={setDeadline} />
      </div>
    </form>
  );
}

'use client';

import { useState, useRef, useEffect } from 'react';

interface DatePickerProps {
  value: string;                     // 'YYYY-MM-DD' or '' (no date)
  onChange: (value: string) => void; // '' clears the date
}

// Built once at module load — constructing an Intl.DateTimeFormat is expensive
// and must not happen on every render (mirrors TodoItem's DEADLINE_FORMATTER).
const PILL_FORMATTER  = new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric' });
const DAY_FORMATTER   = new Intl.DateTimeFormat(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
const MONTH_FORMATTER = new Intl.DateTimeFormat(undefined, { month: 'long', year: 'numeric' });

const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

const pad = (n: number) => String(n).padStart(2, '0');

// Local YYYY-MM-DD (no UTC off-by-one) — the inverse of parseYMD.
function toYMD(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

// Parse a YYYY-MM-DD string as a local date.
function parseYMD(s: string): Date {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function formatPillLabel(value: string): string {
  return PILL_FORMATTER.format(parseYMD(value));
}

function sameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

export default function DatePicker({ value, onChange }: DatePickerProps) {
  const [open, setOpen] = useState(false);
  // The month currently shown in the grid (only year+month matter).
  const [view, setView] = useState(() => (value ? parseYMD(value) : new Date()));
  const containerRef = useRef<HTMLDivElement>(null);

  // Close (without committing) on outside pointerdown or Escape while open. This
  // is the fix: dismissing the popover never applies a date — only a day tap does.
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  const handleToggle = () => {
    // Re-anchor the grid on the selected month each time it opens.
    if (!open) setView(value ? parseYMD(value) : new Date());
    setOpen(o => !o);
  };

  const handlePickDay = (day: Date) => {
    onChange(toYMD(day));
    setOpen(false);
  };

  const today = new Date();
  const selected = value ? parseYMD(value) : null;
  const viewYear = view.getFullYear();
  const viewMonth = view.getMonth();
  const firstWeekday = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

  return (
    <div
      ref={containerRef}
      className={`relative flex items-center gap-1 rounded-lg text-xs font-medium transition-all border ${
        value
          ? 'border-indigo-200 dark:border-indigo-500/40 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300'
          : 'border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700/50'
      }`}
    >
      <button
        type="button"
        onClick={handleToggle}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label="Due date"
        className="flex items-center gap-1.5 pl-2.5 pr-2 py-1 cursor-pointer"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
        {value ? formatPillLabel(value) : 'Due date'}
      </button>

      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          aria-label="Clear due date"
          className="relative z-10 flex items-center justify-center pr-2 py-1 text-indigo-400 hover:text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-200 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      )}

      {open && (
        <div
          role="dialog"
          aria-label="Choose due date"
          className="absolute top-full right-0 mt-1 z-20 w-64 max-w-[calc(100vw-2rem)] p-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-100 shadow-lg"
        >
          <div className="flex items-center justify-between mb-2">
            <button
              type="button"
              onClick={() => setView(new Date(viewYear, viewMonth - 1, 1))}
              aria-label="Previous month"
              className="p-1 rounded-md text-gray-400 hover:text-gray-700 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
            <span className="text-xs font-semibold">{MONTH_FORMATTER.format(view)}</span>
            <button
              type="button"
              onClick={() => setView(new Date(viewYear, viewMonth + 1, 1))}
              aria-label="Next month"
              className="p-1 rounded-md text-gray-400 hover:text-gray-700 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </div>

          <div className="grid grid-cols-7 gap-0.5 mb-1" aria-hidden="true">
            {WEEKDAYS.map(wd => (
              <span key={wd} className="flex items-center justify-center h-7 text-[10px] font-medium text-gray-400 dark:text-gray-500">
                {wd}
              </span>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-0.5">
            {Array.from({ length: firstWeekday }).map((_, i) => (
              <span key={`blank-${i}`} className="h-7" />
            ))}
            {Array.from({ length: daysInMonth }, (_, i) => {
              const day = new Date(viewYear, viewMonth, i + 1);
              const isSelected = selected != null && sameDay(day, selected);
              const isToday = sameDay(day, today);
              return (
                <button
                  key={i + 1}
                  type="button"
                  onClick={() => handlePickDay(day)}
                  aria-label={DAY_FORMATTER.format(day)}
                  aria-pressed={isSelected}
                  className={`flex items-center justify-center h-7 rounded-md text-xs transition-colors ${
                    isSelected
                      ? 'bg-indigo-600 text-white font-semibold'
                      : isToday
                      ? 'ring-1 ring-inset ring-indigo-400 text-indigo-600 dark:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/30'
                      : 'text-gray-600 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600'
                  }`}
                >
                  {i + 1}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

'use client';

import { useState, useRef, useEffect, memo, KeyboardEvent } from 'react';
import { Todo, PriorityLevel } from '@/types/todo';

interface TodoItemProps {
  todo: Todo;
  onToggle: (id: string) => void;
  onEdit: (id: string, text: string) => void;
  onDelete: (id: string) => void;
  onChangePriority: (id: string, priority: PriorityLevel) => void;
}

const PRIORITY_BORDER: Record<PriorityLevel, string> = {
  high:   'border-l-red-400',
  medium: 'border-l-yellow-400',
  low:    'border-l-emerald-400',
};

const PRIORITY_BG: Record<PriorityLevel, string> = {
  high:   'bg-red-50 dark:bg-red-900/10 hover:bg-red-100 dark:hover:bg-red-900/20',
  medium: 'bg-amber-50 dark:bg-amber-900/10 hover:bg-amber-100 dark:hover:bg-amber-900/20',
  low:    'bg-emerald-50 dark:bg-emerald-900/10 hover:bg-emerald-100 dark:hover:bg-emerald-900/20',
};

// Constructed once at module load — building an Intl.DateTimeFormat is expensive
// and must not happen on every render.
const DEADLINE_FORMATTER = new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric' });

function formatDeadline(deadline: number): { label: string; colorClass: string } {
  const today = new Date();
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
  const diff = Math.round((deadline - todayStart) / 86_400_000);
  if (diff < 0) {
    const n = Math.abs(diff);
    return { label: `${n} day${n === 1 ? '' : 's'} overdue`, colorClass: 'text-red-500 dark:text-red-400' };
  }
  if (diff === 0) return { label: 'Due today', colorClass: 'text-amber-500 dark:text-amber-400' };
  if (diff === 1) return { label: 'Due tomorrow', colorClass: 'text-gray-500 dark:text-gray-400' };
  const label = DEADLINE_FORMATTER.format(new Date(deadline));
  return { label, colorClass: 'text-gray-400 dark:text-gray-500' };
}

const PRIORITY_OPTIONS: { value: PriorityLevel; label: string; dotClass: string }[] = [
  { value: 'high',   label: 'High',   dotClass: 'bg-red-400' },
  { value: 'medium', label: 'Medium', dotClass: 'bg-yellow-400' },
  { value: 'low',    label: 'Low',    dotClass: 'bg-emerald-400' },
];

function TodoItem({ todo, onToggle, onEdit, onDelete, onChangePriority }: TodoItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(todo.text);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleEditStart = () => {
    setEditValue(todo.text);
    setIsEditing(true);
  };

  const handleEditSave = () => {
    const trimmed = editValue.trim();
    if (trimmed) {
      onEdit(todo.id, trimmed);
    } else {
      setEditValue(todo.text);
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleEditSave();
    if (e.key === 'Escape') {
      setEditValue(todo.text);
      setIsEditing(false);
    }
  };

  const borderLeft = todo.completed ? 'border-l-transparent' : PRIORITY_BORDER[todo.priority ?? 'medium'];

  return (
    <li className={`group flex items-center gap-3 p-3.5 rounded-xl transition-all duration-150 ${
      todo.completed
        ? 'bg-gray-50 dark:bg-gray-700/20'
        : PRIORITY_BG[todo.priority ?? 'medium']
    } shadow-sm border-t border-r border-b border-gray-100 dark:border-gray-700/30 border-l-4 ${borderLeft}`}>

      {/* Completion toggle */}
      <button
        onClick={() => onToggle(todo.id)}
        className={`flex-shrink-0 w-5 h-5 rounded-full border-2 transition-all duration-150 flex items-center justify-center ${
          todo.completed
            ? 'bg-emerald-500 border-emerald-500'
            : 'border-gray-300 dark:border-gray-500 hover:border-indigo-500 dark:hover:border-indigo-400'
        }`}
        aria-label={todo.completed ? 'Mark as incomplete' : 'Mark as complete'}
      >
        {todo.completed && (
          <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        )}
      </button>

      {/* Text / Edit input */}
      <div className="flex-1 min-w-0">
        {isEditing ? (
          <input
            ref={inputRef}
            type="text"
            value={editValue}
            onChange={e => setEditValue(e.target.value)}
            onBlur={handleEditSave}
            onKeyDown={handleKeyDown}
            maxLength={500}
            className="w-full px-2 py-0.5 rounded-lg border border-indigo-300 dark:border-indigo-500 bg-white dark:bg-gray-600 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-400 text-sm sm:text-base"
            aria-label="Edit todo text"
          />
        ) : (
          <span
            className={`block text-sm sm:text-base leading-snug ${
              todo.completed
                ? 'line-through text-gray-400 dark:text-gray-500'
                : 'text-gray-700 dark:text-gray-200 cursor-pointer'
            }`}
            onDoubleClick={!todo.completed ? handleEditStart : undefined}
            title={!todo.completed ? 'Double-click to edit' : todo.text}
          >
            {todo.text}
          </span>
        )}
        {!todo.completed && todo.deadline != null && (() => {
          const { label, colorClass } = formatDeadline(todo.deadline);
          return (
            <time
              dateTime={new Date(todo.deadline).toISOString().slice(0, 10)}
              className={`block text-xs mt-0.5 ${colorClass}`}
            >
              {label}
            </time>
          );
        })()}
      </div>

      {/* Action buttons */}
      <div className={`flex items-center gap-1 flex-shrink-0 transition-opacity duration-150 ${
        isEditing ? 'opacity-100' : 'opacity-0 group-hover:opacity-100 focus-within:opacity-100'
      }`}>
        {!isEditing && !todo.completed && (
          <div className="flex items-center gap-0.5" role="group" aria-label="Change priority">
            {PRIORITY_OPTIONS.map(({ value, label, dotClass }) => (
              <button
                key={value}
                type="button"
                onClick={() => onChangePriority(todo.id, value)}
                aria-pressed={(todo.priority ?? 'medium') === value}
                aria-label={`Set ${label} priority`}
                className={`p-1 rounded transition-all ${
                  (todo.priority ?? 'medium') === value
                    ? 'opacity-100'
                    : 'opacity-40 hover:opacity-80'
                }`}
              >
                <span className={`block w-2.5 h-2.5 rounded-full ${dotClass}`} aria-hidden="true" />
              </button>
            ))}
          </div>
        )}
        {!isEditing && !todo.completed && (
          <button
            onClick={handleEditStart}
            className="p-1.5 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-all"
            aria-label="Edit todo"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
          </button>
        )}
        <button
          onClick={() => onDelete(todo.id)}
          className="p-1.5 text-gray-400 hover:text-red-500 dark:hover:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
          aria-label="Delete todo"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
          </svg>
        </button>
      </div>
    </li>
  );
}

// Memoized so toggling/editing one todo only re-renders that row, not the whole
// list. Safe because every handler prop is useCallback-stable in useTodos and
// unchanged todo objects keep their identity across updates.
export default memo(TodoItem);

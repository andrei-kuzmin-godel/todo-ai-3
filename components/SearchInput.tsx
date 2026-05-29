'use client';

import { ChangeEvent } from 'react';

interface SearchInputProps {
  query: string;
  onChange: (value: string) => void;
  onClear: () => void;
}

export default function SearchInput({ query, onChange, onClear }: SearchInputProps) {
  return (
    <div className="relative">
      <input
        type="text"
        value={query}
        onChange={(e: ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
        placeholder="Search todos..."
        aria-label="Search todos"
        className="w-full px-4 py-2.5 pr-9 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-sm shadow-sm"
      />
      {query.length > 0 && (
        <button
          type="button"
          onClick={onClear}
          aria-label="Clear search"
          className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      )}
    </div>
  );
}

'use client';

import TodoInput from '@/components/TodoInput';
import TodoItem from '@/components/TodoItem';
import TodoFilter from '@/components/TodoFilter';
import { useTodos } from '@/hooks/useTodos';

export default function Home() {
  const {
    todos,
    filter,
    setFilter,
    addTodo,
    editTodo,
    deleteTodo,
    toggleTodo,
    clearCompleted,
    activeCount,
    completedCount,
    totalCount,
    isLoaded,
  } = useTodos();

  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-indigo-950 px-4 py-10 sm:py-16">
      <div className="max-w-lg mx-auto w-full">

        {/* Header */}
        <header className="text-center mb-8 sm:mb-10">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-200 dark:shadow-indigo-900/40 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M9 11l3 3L22 4" />
              <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
            </svg>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent tracking-tight">
            My Todos
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1.5">
            Stay organized, get things done.
          </p>
        </header>

        {/* Main Card */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl shadow-indigo-100/60 dark:shadow-black/40 border border-white/60 dark:border-gray-700/50 overflow-hidden">

          {/* Input Section */}
          <div className="p-4 sm:p-6 border-b border-gray-100 dark:border-gray-700/50">
            <TodoInput onAdd={addTodo} />
          </div>

          {/* List Section */}
          {!isLoaded ? (
            <div className="p-10 flex flex-col items-center gap-3 text-gray-400 dark:text-gray-500">
              <div className="w-8 h-8 border-2 border-indigo-200 dark:border-indigo-800 border-t-indigo-500 rounded-full animate-spin" />
              <span className="text-sm">Loading</span>
            </div>
          ) : todos.length === 0 ? (
            <div className="p-12 text-center select-none">
              <p className="text-4xl mb-3" aria-hidden="true">
                {filter === 'completed' ? '✅' : filter === 'active' ? '🎉' : '📋'}
              </p>
              <p className="text-gray-400 dark:text-gray-500 text-sm font-medium">
                {filter === 'completed'
                  ? 'No completed todos yet'
                  : filter === 'active'
                  ? 'Nothing left to do — nice work!'
                  : 'Add your first todo above'}
              </p>
            </div>
          ) : (
            <ul className="p-4 sm:p-5 space-y-2" aria-label="Todo list">
              {todos.map(todo => (
                <TodoItem
                  key={todo.id}
                  todo={todo}
                  onToggle={toggleTodo}
                  onEdit={editTodo}
                  onDelete={deleteTodo}
                />
              ))}
            </ul>
          )}

          {/* Footer  Filter bar */}
          {totalCount > 0 && (
            <div className="px-4 sm:px-5 py-3.5 border-t border-gray-100 dark:border-gray-700/50 bg-gray-50/60 dark:bg-gray-800/60">
              <TodoFilter
                filter={filter}
                setFilter={setFilter}
                activeCount={activeCount}
                completedCount={completedCount}
                onClearCompleted={clearCompleted}
              />
            </div>
          )}
        </div>

        {/* Summary stats */}
        {totalCount > 0 && (
          <div className="mt-4 flex justify-center gap-5 text-xs text-gray-400 dark:text-gray-500 tabular-nums">
            <span>{totalCount} total</span>
            <span className="text-indigo-400 dark:text-indigo-500">{activeCount} active</span>
            <span className="text-emerald-500 dark:text-emerald-600">{completedCount} done</span>
          </div>
        )}

        <p className="text-center text-xs text-gray-300 dark:text-gray-700 mt-6 select-none">
          Double-click to edit · Esc to cancel
        </p>
      </div>
    </main>
  );
}

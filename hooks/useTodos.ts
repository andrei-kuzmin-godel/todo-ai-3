'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Todo, FilterType } from '@/types/todo';

const STORAGE_KEY = 'todo-ai-3-todos';

const isValidTodo = (v: unknown): v is Todo =>
  typeof v === 'object' && v !== null &&
  typeof (v as Todo).id === 'string' &&
  typeof (v as Todo).text === 'string' &&
  typeof (v as Todo).completed === 'boolean' &&
  typeof (v as Todo).createdAt === 'number';

export function useTodos() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [filter, setFilter] = useState<FilterType>('all');
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed: unknown = JSON.parse(stored);
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setTodos(Array.isArray(parsed) ? parsed.filter(isValidTodo) : []);
      }
    } catch {
      // Ignore parse errors; start with empty list
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
    } catch {
      // Ignore storage errors (e.g. private browsing quota)
    }
  }, [todos, isLoaded]);

  const addTodo = useCallback((text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    setTodos(prev => [
      {
        id: crypto.randomUUID(),
        text: trimmed,
        completed: false,
        createdAt: Date.now(),
      },
      ...prev,
    ]);
  }, []);

  const editTodo = useCallback((id: string, text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    setTodos(prev =>
      prev.map(todo => (todo.id === id ? { ...todo, text: trimmed } : todo))
    );
  }, []);

  const deleteTodo = useCallback((id: string) => {
    setTodos(prev => prev.filter(todo => todo.id !== id));
  }, []);

  const toggleTodo = useCallback((id: string) => {
    setTodos(prev =>
      prev.map(todo =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  }, []);

  const clearCompleted = useCallback(() => {
    setTodos(prev => prev.filter(todo => !todo.completed));
  }, []);

  const filteredTodos = useMemo(() => todos.filter(todo => {
    if (filter === 'active') return !todo.completed;
    if (filter === 'completed') return todo.completed;
    return true;
  }), [todos, filter]);

  const activeCount = useMemo(() => todos.filter(todo => !todo.completed).length, [todos]);
  const completedCount = useMemo(() => todos.filter(todo => todo.completed).length, [todos]);

  return {
    todos: filteredTodos,
    filter,
    setFilter,
    addTodo,
    editTodo,
    deleteTodo,
    toggleTodo,
    clearCompleted,
    activeCount,
    completedCount,
    totalCount: todos.length,
    isLoaded,
  };
}

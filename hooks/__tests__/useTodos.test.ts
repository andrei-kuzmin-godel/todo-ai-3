import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useTodos } from '@/hooks/useTodos'

const STORAGE_KEY = 'todo-ai-3-todos'

beforeEach(() => {
  localStorage.clear()
  vi.restoreAllMocks()
})

describe('initial state', () => {
  it('starts with empty todos, all filter, and isLoaded true', () => {
    const { result } = renderHook(() => useTodos())
    expect(result.current.todos).toEqual([])
    expect(result.current.filter).toBe('all')
    expect(result.current.isLoaded).toBe(true)
  })
})

describe('addTodo', () => {
  it('adds a todo with trimmed text and completed false', () => {
    const { result } = renderHook(() => useTodos())
    act(() => { result.current.addTodo('  Buy milk  ') })
    expect(result.current.todos).toHaveLength(1)
    expect(result.current.todos[0].text).toBe('Buy milk')
    expect(result.current.todos[0].completed).toBe(false)
  })

  it('ignores empty string', () => {
    const { result } = renderHook(() => useTodos())
    act(() => { result.current.addTodo('') })
    expect(result.current.todos).toHaveLength(0)
  })

  it('ignores whitespace-only string', () => {
    const { result } = renderHook(() => useTodos())
    act(() => { result.current.addTodo('   ') })
    expect(result.current.todos).toHaveLength(0)
  })
})

describe('editTodo', () => {
  it('updates todo text', () => {
    const { result } = renderHook(() => useTodos())
    act(() => { result.current.addTodo('Original') })
    const id = result.current.todos[0].id
    act(() => { result.current.editTodo(id, 'Updated') })
    expect(result.current.todos[0].text).toBe('Updated')
  })

  it('trims whitespace when editing', () => {
    const { result } = renderHook(() => useTodos())
    act(() => { result.current.addTodo('Original') })
    const id = result.current.todos[0].id
    act(() => { result.current.editTodo(id, '  Trimmed  ') })
    expect(result.current.todos[0].text).toBe('Trimmed')
  })

  it('does not update when text is empty', () => {
    const { result } = renderHook(() => useTodos())
    act(() => { result.current.addTodo('Original') })
    const id = result.current.todos[0].id
    act(() => { result.current.editTodo(id, '') })
    expect(result.current.todos[0].text).toBe('Original')
  })
})

describe('deleteTodo', () => {
  it('removes the correct todo, leaving others intact', () => {
    const { result } = renderHook(() => useTodos())
    act(() => { result.current.addTodo('First') })
    act(() => { result.current.addTodo('Second') })
    const firstId = result.current.todos.find(t => t.text === 'First')!.id
    act(() => { result.current.deleteTodo(firstId) })
    expect(result.current.todos).toHaveLength(1)
    expect(result.current.todos[0].text).toBe('Second')
  })
})

describe('toggleTodo', () => {
  it('flips completed state both ways', () => {
    const { result } = renderHook(() => useTodos())
    act(() => { result.current.addTodo('Task') })
    const id = result.current.todos[0].id
    expect(result.current.todos[0].completed).toBe(false)
    act(() => { result.current.toggleTodo(id) })
    expect(result.current.todos[0].completed).toBe(true)
    act(() => { result.current.toggleTodo(id) })
    expect(result.current.todos[0].completed).toBe(false)
  })
})

describe('clearCompleted', () => {
  it('removes only completed todos', () => {
    const { result } = renderHook(() => useTodos())
    act(() => { result.current.addTodo('Active') })
    act(() => { result.current.addTodo('Done') })
    const doneId = result.current.todos.find(t => t.text === 'Done')!.id
    act(() => { result.current.toggleTodo(doneId) })
    act(() => { result.current.clearCompleted() })
    expect(result.current.todos).toHaveLength(1)
    expect(result.current.todos[0].text).toBe('Active')
  })
})

describe('filteredTodos', () => {
  it("filter 'all' returns all todos", () => {
    const { result } = renderHook(() => useTodos())
    act(() => { result.current.addTodo('A') })
    act(() => { result.current.addTodo('B') })
    act(() => { result.current.toggleTodo(result.current.todos[0].id) })
    act(() => { result.current.setFilter('all') })
    expect(result.current.todos).toHaveLength(2)
  })

  it("filter 'active' returns only incomplete todos", () => {
    const { result } = renderHook(() => useTodos())
    act(() => { result.current.addTodo('Active') })
    act(() => { result.current.addTodo('Done') })
    const doneId = result.current.todos.find(t => t.text === 'Done')!.id
    act(() => { result.current.toggleTodo(doneId) })
    act(() => { result.current.setFilter('active') })
    expect(result.current.todos).toHaveLength(1)
    expect(result.current.todos[0].text).toBe('Active')
  })

  it("filter 'completed' returns only completed todos", () => {
    const { result } = renderHook(() => useTodos())
    act(() => { result.current.addTodo('Active') })
    act(() => { result.current.addTodo('Done') })
    const doneId = result.current.todos.find(t => t.text === 'Done')!.id
    act(() => { result.current.toggleTodo(doneId) })
    act(() => { result.current.setFilter('completed') })
    expect(result.current.todos).toHaveLength(1)
    expect(result.current.todos[0].text).toBe('Done')
  })
})

describe('counts', () => {
  it('returns correct activeCount, completedCount, totalCount', () => {
    const { result } = renderHook(() => useTodos())
    act(() => { result.current.addTodo('A') })
    act(() => { result.current.addTodo('B') })
    act(() => { result.current.addTodo('C') })
    act(() => { result.current.toggleTodo(result.current.todos[0].id) })
    expect(result.current.totalCount).toBe(3)
    expect(result.current.completedCount).toBe(1)
    expect(result.current.activeCount).toBe(2)
  })
})

describe('localStorage', () => {
  it('hydrates todos from localStorage on mount', () => {
    const stored = [{ id: '1', text: 'Persisted', completed: false, createdAt: 1000 }]
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stored))
    const { result } = renderHook(() => useTodos())
    expect(result.current.todos[0].text).toBe('Persisted')
  })

  it('ignores invalid JSON in localStorage gracefully', () => {
    localStorage.setItem(STORAGE_KEY, 'not-json{{{')
    const { result } = renderHook(() => useTodos())
    expect(result.current.todos).toHaveLength(0)
    expect(result.current.isLoaded).toBe(true)
  })

  it('filters out items that fail schema validation', () => {
    const stored = [
      { id: '1', text: 'Valid', completed: false, createdAt: 1000 },
      { id: 2, text: 'Bad id type', completed: false, createdAt: 1000 },
    ]
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stored))
    const { result } = renderHook(() => useTodos())
    expect(result.current.todos).toHaveLength(1)
    expect(result.current.todos[0].text).toBe('Valid')
  })

  it('persists todos to localStorage after addTodo', () => {
    const { result } = renderHook(() => useTodos())
    act(() => { result.current.addTodo('Save me') })
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY)!)
    expect(stored[0].text).toBe('Save me')
  })
})

describe('addTodo with priority', () => {
  it('stores the given priority on the todo', () => {
    const { result } = renderHook(() => useTodos())
    act(() => { result.current.addTodo('Urgent', 'high') })
    expect(result.current.todos[0].priority).toBe('high')
  })

  it('defaults to medium when no priority argument is given', () => {
    const { result } = renderHook(() => useTodos())
    act(() => { result.current.addTodo('Normal task') })
    expect(result.current.todos[0].priority).toBe('medium')
  })
})

describe('changePriority', () => {
  it('updates the priority of the correct todo', () => {
    const { result } = renderHook(() => useTodos())
    act(() => { result.current.addTodo('Task') })
    const id = result.current.todos[0].id
    act(() => { result.current.changePriority(id, 'low') })
    expect(result.current.todos[0].priority).toBe('low')
  })

  it('does not affect other todos', () => {
    const { result } = renderHook(() => useTodos())
    act(() => { result.current.addTodo('A') })
    act(() => { result.current.addTodo('B') })
    const idA = result.current.todos.find(t => t.text === 'A')!.id
    act(() => { result.current.changePriority(idA, 'high') })
    const todoB = result.current.todos.find(t => t.text === 'B')!
    expect(todoB.priority).toBe('medium')
  })
})

describe('priority sort', () => {
  it('initial sortMode is priority', () => {
    const { result } = renderHook(() => useTodos())
    expect(result.current.sortMode).toBe('priority')
  })

  it('sortMode default returns insertion order (newest first)', () => {
    const { result } = renderHook(() => useTodos())
    act(() => { result.current.addTodo('Low task', 'low') })
    act(() => { result.current.addTodo('High task', 'high') })
    act(() => { result.current.setSortMode('default') })
    expect(result.current.todos[0].text).toBe('High task')
  })

  it('sortMode priority orders High then Medium then Low', () => {
    const { result } = renderHook(() => useTodos())
    act(() => { result.current.addTodo('Low task', 'low') })
    act(() => { result.current.addTodo('High task', 'high') })
    act(() => { result.current.addTodo('Medium task', 'medium') })
    act(() => { result.current.setSortMode('priority') })
    const texts = result.current.todos.map(t => t.text)
    expect(texts).toEqual(['High task', 'Medium task', 'Low task'])
  })

  it('completed todos appear after active ones in priority sort', () => {
    const { result } = renderHook(() => useTodos())
    act(() => { result.current.addTodo('Low active', 'low') })
    act(() => { result.current.addTodo('High done', 'high') })
    const doneId = result.current.todos.find(t => t.text === 'High done')!.id
    act(() => { result.current.toggleTodo(doneId) })
    act(() => { result.current.setSortMode('priority') })
    const texts = result.current.todos.map(t => t.text)
    expect(texts[0]).toBe('Low active')
    expect(texts[1]).toBe('High done')
  })

  it('treats undefined priority as medium in priority sort', () => {
    const stored = [
      { id: '1', text: 'Old todo', completed: false, createdAt: 1000 },
      { id: '2', text: 'High todo', completed: false, createdAt: 999, priority: 'high' },
      { id: '3', text: 'Low todo', completed: false, createdAt: 998, priority: 'low' },
    ]
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stored))
    const { result } = renderHook(() => useTodos())
    act(() => { result.current.setSortMode('priority') })
    const texts = result.current.todos.map(t => t.text)
    expect(texts).toEqual(['High todo', 'Old todo', 'Low todo'])
  })

  it('sortMode deadline behaves like default (no deadline field yet)', () => {
    const { result } = renderHook(() => useTodos())
    act(() => { result.current.addTodo('Low task', 'low') })
    act(() => { result.current.addTodo('High task', 'high') })
    act(() => { result.current.setSortMode('deadline') })
    expect(result.current.todos[0].text).toBe('High task')
  })
})

describe('searchQuery', () => {
  it('returns all todos when searchQuery is empty string', () => {
    const { result } = renderHook(() => useTodos())
    act(() => { result.current.addTodo('Buy milk') })
    act(() => { result.current.addTodo('Walk dog') })
    expect(result.current.todos).toHaveLength(2)
  })

  it('filters case-insensitively by search query', () => {
    const { result } = renderHook(() => useTodos())
    act(() => { result.current.addTodo('Buy Milk') })
    act(() => { result.current.addTodo('Walk dog') })
    act(() => { result.current.setSearchQuery('milk') })
    expect(result.current.todos).toHaveLength(1)
    expect(result.current.todos[0].text).toBe('Buy Milk')
  })

  it('matches substring anywhere in the todo text', () => {
    const { result } = renderHook(() => useTodos())
    act(() => { result.current.addTodo('Remember to buy groceries') })
    act(() => { result.current.addTodo('Walk the dog') })
    act(() => { result.current.setSearchQuery('grocer') })
    expect(result.current.todos).toHaveLength(1)
    expect(result.current.todos[0].text).toBe('Remember to buy groceries')
  })

  it('combines with the completion filter (active + search)', () => {
    const { result } = renderHook(() => useTodos())
    act(() => { result.current.addTodo('Buy milk') })
    act(() => { result.current.addTodo('Buy eggs') })
    act(() => { result.current.addTodo('Walk dog') })
    const eggsId = result.current.todos.find(t => t.text === 'Buy eggs')!.id
    act(() => { result.current.toggleTodo(eggsId) })
    act(() => { result.current.setFilter('active') })
    act(() => { result.current.setSearchQuery('buy') })
    expect(result.current.todos).toHaveLength(1)
    expect(result.current.todos[0].text).toBe('Buy milk')
  })

  it('resets to full filter-respecting list when searchQuery is cleared', () => {
    const { result } = renderHook(() => useTodos())
    act(() => { result.current.addTodo('Buy milk') })
    act(() => { result.current.addTodo('Walk dog') })
    act(() => { result.current.setSearchQuery('milk') })
    expect(result.current.todos).toHaveLength(1)
    act(() => { result.current.setSearchQuery('') })
    expect(result.current.todos).toHaveLength(2)
  })

  it('returns no todos when query matches nothing', () => {
    const { result } = renderHook(() => useTodos())
    act(() => { result.current.addTodo('Buy milk') })
    act(() => { result.current.setSearchQuery('zzznomatch') })
    expect(result.current.todos).toHaveLength(0)
  })
})

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import TodoItem from '@/components/TodoItem'
import type { Todo } from '@/types/todo'

const todo: Todo = { id: 'test-id', text: 'Test task', completed: false, createdAt: 1000 }
const completedTodo: Todo = { ...todo, completed: true }

const defaultProps = {
  todo,
  onToggle: vi.fn(),
  onEdit: vi.fn(),
  onDelete: vi.fn(),
  onChangePriority: vi.fn(),
}

describe('TodoItem', () => {
  it('renders todo text and action buttons', () => {
    render(<TodoItem {...defaultProps} />)
    expect(screen.getByText('Test task')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Mark as complete' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Delete todo' })).toBeInTheDocument()
  })

  it('calls onToggle with todo id when toggle button is clicked', async () => {
    const user = userEvent.setup()
    const onToggle = vi.fn()
    render(<TodoItem {...defaultProps} onToggle={onToggle} />)
    await user.click(screen.getByRole('button', { name: 'Mark as complete' }))
    expect(onToggle).toHaveBeenCalledWith('test-id')
  })

  it('calls onDelete with todo id when delete button is clicked', async () => {
    const user = userEvent.setup()
    const onDelete = vi.fn()
    render(<TodoItem {...defaultProps} onDelete={onDelete} />)
    await user.click(screen.getByRole('button', { name: 'Delete todo' }))
    expect(onDelete).toHaveBeenCalledWith('test-id')
  })

  it('shows "Mark as incomplete" label for a completed todo', () => {
    render(<TodoItem {...defaultProps} todo={completedTodo} />)
    expect(screen.getByRole('button', { name: 'Mark as incomplete' })).toBeInTheDocument()
  })

  it('enters edit mode on double-click', async () => {
    const user = userEvent.setup()
    render(<TodoItem {...defaultProps} />)
    await user.dblClick(screen.getByText('Test task'))
    expect(screen.getByRole('textbox', { name: 'Edit todo text' })).toBeInTheDocument()
  })

  it('saves edit on Enter and calls onEdit with new text', async () => {
    const user = userEvent.setup()
    const onEdit = vi.fn()
    render(<TodoItem {...defaultProps} onEdit={onEdit} />)
    await user.dblClick(screen.getByText('Test task'))
    const editInput = screen.getByRole('textbox', { name: 'Edit todo text' })
    await user.clear(editInput)
    await user.type(editInput, 'Updated task')
    await user.keyboard('{Enter}')
    expect(onEdit).toHaveBeenCalledWith('test-id', 'Updated task')
  })

  it('cancels edit on Escape without calling onEdit', async () => {
    const user = userEvent.setup()
    const onEdit = vi.fn()
    render(<TodoItem {...defaultProps} onEdit={onEdit} />)
    await user.dblClick(screen.getByText('Test task'))
    const editInput = screen.getByRole('textbox', { name: 'Edit todo text' })
    await user.clear(editInput)
    await user.type(editInput, 'Changed')
    await user.keyboard('{Escape}')
    expect(onEdit).not.toHaveBeenCalled()
    expect(screen.getByText('Test task')).toBeInTheDocument()
  })
})

describe('priority border', () => {
  it('applies border-l-red-400 for high priority active todo', () => {
    const highTodo: Todo = { ...todo, priority: 'high' }
    const { container } = render(<TodoItem {...defaultProps} todo={highTodo} />)
    expect(container.firstChild).toHaveClass('border-l-red-400')
  })

  it('applies border-l-yellow-400 for medium priority active todo', () => {
    const medTodo: Todo = { ...todo, priority: 'medium' }
    const { container } = render(<TodoItem {...defaultProps} todo={medTodo} />)
    expect(container.firstChild).toHaveClass('border-l-yellow-400')
  })

  it('applies border-l-emerald-400 for low priority active todo', () => {
    const lowTodo: Todo = { ...todo, priority: 'low' }
    const { container } = render(<TodoItem {...defaultProps} todo={lowTodo} />)
    expect(container.firstChild).toHaveClass('border-l-emerald-400')
  })

  it('applies border-l-yellow-400 for todo with undefined priority (defaults to medium)', () => {
    const { container } = render(<TodoItem {...defaultProps} todo={todo} />)
    expect(container.firstChild).toHaveClass('border-l-yellow-400')
  })

  it('applies border-l-transparent for a completed todo', () => {
    const { container } = render(<TodoItem {...defaultProps} todo={completedTodo} />)
    expect(container.firstChild).toHaveClass('border-l-transparent')
  })
})

describe('inline priority selector', () => {
  it('renders priority pill buttons for an active todo', () => {
    render(<TodoItem {...defaultProps} />)
    expect(screen.getByRole('button', { name: 'Set High priority' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Set Medium priority' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Set Low priority' })).toBeInTheDocument()
  })

  it('does not render priority pills for a completed todo', () => {
    render(<TodoItem {...defaultProps} todo={completedTodo} />)
    expect(screen.queryByRole('button', { name: 'Set High priority' })).not.toBeInTheDocument()
  })

  it('aria-pressed reflects current priority (medium by default)', () => {
    render(<TodoItem {...defaultProps} />)
    expect(screen.getByRole('button', { name: 'Set Medium priority' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: 'Set High priority' })).toHaveAttribute('aria-pressed', 'false')
  })

  it('aria-pressed reflects explicitly set priority', () => {
    const highTodo: Todo = { ...todo, priority: 'high' }
    render(<TodoItem {...defaultProps} todo={highTodo} />)
    expect(screen.getByRole('button', { name: 'Set High priority' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: 'Set Medium priority' })).toHaveAttribute('aria-pressed', 'false')
  })

  it('calls onChangePriority with todo id and new priority when a pill is clicked', async () => {
    const user = userEvent.setup()
    const onChangePriority = vi.fn()
    render(<TodoItem {...defaultProps} onChangePriority={onChangePriority} />)
    await user.click(screen.getByRole('button', { name: 'Set High priority' }))
    expect(onChangePriority).toHaveBeenCalledWith('test-id', 'high')
  })
})

describe('deadline display', () => {
  // Pin "today" to 2026-05-30 (midnight local) for deterministic tests
  const TODAY = new Date(2026, 4, 30).getTime() // month is 0-indexed

  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(TODAY)
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('renders no <time> element when deadline is undefined', () => {
    render(<TodoItem {...defaultProps} />)
    expect(document.querySelector('time')).toBeNull()
  })

  it('renders no <time> element for a completed todo even with a deadline', () => {
    const withDeadline: Todo = { ...completedTodo, deadline: TODAY }
    render(<TodoItem {...defaultProps} todo={withDeadline} />)
    expect(document.querySelector('time')).toBeNull()
  })

  it('shows "1 day overdue" in red for yesterday\'s deadline', () => {
    const yesterday = new Date(2026, 4, 29).getTime()
    const withDeadline: Todo = { ...todo, deadline: yesterday }
    render(<TodoItem {...defaultProps} todo={withDeadline} />)
    const time = document.querySelector('time')
    expect(time).not.toBeNull()
    expect(time!.textContent).toBe('1 day overdue')
    expect(time!.className).toContain('text-red-500')
  })

  it('shows "2 days overdue" for two days ago', () => {
    const twoDaysAgo = new Date(2026, 4, 28).getTime()
    const withDeadline: Todo = { ...todo, deadline: twoDaysAgo }
    render(<TodoItem {...defaultProps} todo={withDeadline} />)
    expect(document.querySelector('time')!.textContent).toBe('2 days overdue')
  })

  it('shows "Due today" in amber for today\'s deadline', () => {
    const withDeadline: Todo = { ...todo, deadline: TODAY }
    render(<TodoItem {...defaultProps} todo={withDeadline} />)
    const time = document.querySelector('time')
    expect(time!.textContent).toBe('Due today')
    expect(time!.className).toContain('text-amber-500')
  })

  it('shows "Due tomorrow" for tomorrow\'s deadline', () => {
    const tomorrow = new Date(2026, 4, 31).getTime()
    const withDeadline: Todo = { ...todo, deadline: tomorrow }
    render(<TodoItem {...defaultProps} todo={withDeadline} />)
    expect(document.querySelector('time')!.textContent).toBe('Due tomorrow')
  })

  it('shows a formatted date for a future deadline', () => {
    const future = new Date(2026, 5, 15).getTime() // Jun 15
    const withDeadline: Todo = { ...todo, deadline: future }
    render(<TodoItem {...defaultProps} todo={withDeadline} />)
    const time = document.querySelector('time')
    expect(time).not.toBeNull()
    // Formatted via Intl — just verify it contains the day number
    expect(time!.textContent).toContain('15')
    expect(time!.className).toContain('text-gray-400')
  })
})

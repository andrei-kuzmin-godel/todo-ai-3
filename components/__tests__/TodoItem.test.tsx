import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import TodoItem from '@/components/TodoItem'
import type { Todo } from '@/types/todo'

const todo: Todo = { id: 'test-id', text: 'Test task', completed: false, createdAt: 1000 }
const completedTodo: Todo = { ...todo, completed: true }

describe('TodoItem', () => {
  it('renders todo text and action buttons', () => {
    render(<TodoItem todo={todo} onToggle={vi.fn()} onEdit={vi.fn()} onDelete={vi.fn()} />)
    expect(screen.getByText('Test task')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Mark as complete' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Delete todo' })).toBeInTheDocument()
  })

  it('calls onToggle with todo id when toggle button is clicked', async () => {
    const user = userEvent.setup()
    const onToggle = vi.fn()
    render(<TodoItem todo={todo} onToggle={onToggle} onEdit={vi.fn()} onDelete={vi.fn()} />)
    await user.click(screen.getByRole('button', { name: 'Mark as complete' }))
    expect(onToggle).toHaveBeenCalledWith('test-id')
  })

  it('calls onDelete with todo id when delete button is clicked', async () => {
    const user = userEvent.setup()
    const onDelete = vi.fn()
    render(<TodoItem todo={todo} onToggle={vi.fn()} onEdit={vi.fn()} onDelete={onDelete} />)
    await user.click(screen.getByRole('button', { name: 'Delete todo' }))
    expect(onDelete).toHaveBeenCalledWith('test-id')
  })

  it('shows "Mark as incomplete" label for a completed todo', () => {
    render(<TodoItem todo={completedTodo} onToggle={vi.fn()} onEdit={vi.fn()} onDelete={vi.fn()} />)
    expect(screen.getByRole('button', { name: 'Mark as incomplete' })).toBeInTheDocument()
  })

  it('enters edit mode on double-click', async () => {
    const user = userEvent.setup()
    render(<TodoItem todo={todo} onToggle={vi.fn()} onEdit={vi.fn()} onDelete={vi.fn()} />)
    await user.dblClick(screen.getByText('Test task'))
    expect(screen.getByRole('textbox', { name: 'Edit todo text' })).toBeInTheDocument()
  })

  it('saves edit on Enter and calls onEdit with new text', async () => {
    const user = userEvent.setup()
    const onEdit = vi.fn()
    render(<TodoItem todo={todo} onToggle={vi.fn()} onEdit={onEdit} onDelete={vi.fn()} />)
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
    render(<TodoItem todo={todo} onToggle={vi.fn()} onEdit={onEdit} onDelete={vi.fn()} />)
    await user.dblClick(screen.getByText('Test task'))
    const editInput = screen.getByRole('textbox', { name: 'Edit todo text' })
    await user.clear(editInput)
    await user.type(editInput, 'Changed')
    await user.keyboard('{Escape}')
    expect(onEdit).not.toHaveBeenCalled()
    expect(screen.getByText('Test task')).toBeInTheDocument()
  })
})

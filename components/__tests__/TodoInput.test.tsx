import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import TodoInput from '@/components/TodoInput'

describe('TodoInput', () => {
  it('renders input and submit button', () => {
    render(<TodoInput onAdd={vi.fn()} />)
    expect(screen.getByRole('textbox', { name: 'New todo' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Add todo' })).toBeInTheDocument()
  })

  it('submit button is disabled when input is empty', () => {
    render(<TodoInput onAdd={vi.fn()} />)
    expect(screen.getByRole('button', { name: 'Add todo' })).toBeDisabled()
  })

  it('submit button is enabled when input has text', async () => {
    const user = userEvent.setup()
    render(<TodoInput onAdd={vi.fn()} />)
    await user.type(screen.getByRole('textbox'), 'Buy milk')
    expect(screen.getByRole('button', { name: 'Add todo' })).toBeEnabled()
  })

  it('calls onAdd with trimmed text and default medium priority on form submit', async () => {
    const user = userEvent.setup()
    const onAdd = vi.fn()
    render(<TodoInput onAdd={onAdd} />)
    await user.type(screen.getByRole('textbox'), 'Buy milk')
    await user.click(screen.getByRole('button', { name: 'Add todo' }))
    expect(onAdd).toHaveBeenCalledWith('Buy milk', 'medium', undefined)
  })

  it('clears input after submit', async () => {
    const user = userEvent.setup()
    render(<TodoInput onAdd={vi.fn()} />)
    const input = screen.getByRole('textbox')
    await user.type(input, 'Task')
    await user.click(screen.getByRole('button', { name: 'Add todo' }))
    expect(input).toHaveValue('')
  })

  it('does not call onAdd for whitespace-only input (button stays disabled)', async () => {
    const user = userEvent.setup()
    const onAdd = vi.fn()
    render(<TodoInput onAdd={onAdd} />)
    await user.type(screen.getByRole('textbox'), '   ')
    expect(screen.getByRole('button', { name: 'Add todo' })).toBeDisabled()
    expect(onAdd).not.toHaveBeenCalled()
  })
})

describe('priority selector', () => {
  it('renders three priority toggle buttons', () => {
    render(<TodoInput onAdd={vi.fn()} />)
    expect(screen.getByRole('button', { name: 'High priority' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Medium priority' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Low priority' })).toBeInTheDocument()
  })

  it('Medium is selected by default', () => {
    render(<TodoInput onAdd={vi.fn()} />)
    expect(screen.getByRole('button', { name: 'Medium priority' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: 'High priority' })).toHaveAttribute('aria-pressed', 'false')
    expect(screen.getByRole('button', { name: 'Low priority' })).toHaveAttribute('aria-pressed', 'false')
  })

  it('clicking High sets it as selected', async () => {
    const user = userEvent.setup()
    render(<TodoInput onAdd={vi.fn()} />)
    await user.click(screen.getByRole('button', { name: 'High priority' }))
    expect(screen.getByRole('button', { name: 'High priority' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: 'Medium priority' })).toHaveAttribute('aria-pressed', 'false')
  })

  it('submits the selected priority with the todo text', async () => {
    const user = userEvent.setup()
    const onAdd = vi.fn()
    render(<TodoInput onAdd={onAdd} />)
    await user.click(screen.getByRole('button', { name: 'High priority' }))
    await user.type(screen.getByRole('textbox'), 'Urgent task')
    await user.click(screen.getByRole('button', { name: 'Add todo' }))
    expect(onAdd).toHaveBeenCalledWith('Urgent task', 'high', undefined)
  })

  it('resets priority to medium after form submit', async () => {
    const user = userEvent.setup()
    render(<TodoInput onAdd={vi.fn()} />)
    await user.click(screen.getByRole('button', { name: 'Low priority' }))
    await user.type(screen.getByRole('textbox'), 'Task')
    await user.click(screen.getByRole('button', { name: 'Add todo' }))
    expect(screen.getByRole('button', { name: 'Medium priority' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: 'Low priority' })).toHaveAttribute('aria-pressed', 'false')
  })
})

describe('due date', () => {
  // On iOS, dismissing the native date picker by tapping outside commits the
  // shown value and fires `change`, then `cancel`. We revert on `cancel` so a
  // dismissed picker leaves the deadline as it was before it opened.
  it('reverts to no date when the picker is cancelled (iOS tap-outside)', async () => {
    const user = userEvent.setup()
    const onAdd = vi.fn()
    render(<TodoInput onAdd={onAdd} />)
    const dateInput = screen.getByLabelText('Due date (optional)')

    fireEvent.focus(dateInput)                                  // picker opens, captures ''
    fireEvent.change(dateInput, { target: { value: '2030-01-15' } }) // iOS spurious commit
    fireEvent(dateInput, new Event('cancel'))                   // tap outside

    await user.type(screen.getByRole('textbox'), 'Task')
    await user.click(screen.getByRole('button', { name: 'Add todo' }))
    expect(onAdd).toHaveBeenCalledWith('Task', 'medium', undefined)
  })

  it('applies the date when the user actually selects one', async () => {
    const user = userEvent.setup()
    const onAdd = vi.fn()
    render(<TodoInput onAdd={onAdd} />)
    const dateInput = screen.getByLabelText('Due date (optional)')

    fireEvent.focus(dateInput)
    fireEvent.change(dateInput, { target: { value: '2030-01-15' } }) // real selection, no cancel

    await user.type(screen.getByRole('textbox'), 'Task')
    await user.click(screen.getByRole('button', { name: 'Add todo' }))
    expect(onAdd).toHaveBeenCalledWith('Task', 'medium', new Date(2030, 0, 15).getTime())
  })

  it('keeps the existing date when a re-opened picker is cancelled', async () => {
    const user = userEvent.setup()
    const onAdd = vi.fn()
    render(<TodoInput onAdd={onAdd} />)
    const dateInput = screen.getByLabelText('Due date (optional)')

    // First, genuinely pick a date.
    fireEvent.focus(dateInput)
    fireEvent.change(dateInput, { target: { value: '2030-01-15' } })

    // Re-open, iOS commits a different value, then user taps outside to cancel.
    fireEvent.focus(dateInput)
    fireEvent.change(dateInput, { target: { value: '2030-06-01' } })
    fireEvent(dateInput, new Event('cancel'))

    await user.type(screen.getByRole('textbox'), 'Task')
    await user.click(screen.getByRole('button', { name: 'Add todo' }))
    expect(onAdd).toHaveBeenCalledWith('Task', 'medium', new Date(2030, 0, 15).getTime())
  })
})

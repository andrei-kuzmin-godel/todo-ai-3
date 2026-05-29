import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
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
    expect(onAdd).toHaveBeenCalledWith('Buy milk', 'medium')
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
    expect(onAdd).toHaveBeenCalledWith('Urgent task', 'high')
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

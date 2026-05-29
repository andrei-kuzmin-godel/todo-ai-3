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

  it('calls onAdd with trimmed text on form submit', async () => {
    const user = userEvent.setup()
    const onAdd = vi.fn()
    render(<TodoInput onAdd={onAdd} />)
    await user.type(screen.getByRole('textbox'), 'Buy milk')
    await user.click(screen.getByRole('button', { name: 'Add todo' }))
    expect(onAdd).toHaveBeenCalledWith('Buy milk')
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

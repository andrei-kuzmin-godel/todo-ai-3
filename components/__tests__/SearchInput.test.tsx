import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import SearchInput from '@/components/SearchInput'

describe('SearchInput', () => {
  it('renders input with aria-label "Search todos"', () => {
    render(<SearchInput query="" onChange={vi.fn()} onClear={vi.fn()} />)
    expect(screen.getByRole('textbox', { name: 'Search todos' })).toBeInTheDocument()
  })

  it('clear button is absent when query is empty', () => {
    render(<SearchInput query="" onChange={vi.fn()} onClear={vi.fn()} />)
    expect(screen.queryByRole('button', { name: 'Clear search' })).not.toBeInTheDocument()
  })

  it('clear button is present when query is non-empty', () => {
    render(<SearchInput query="milk" onChange={vi.fn()} onClear={vi.fn()} />)
    expect(screen.getByRole('button', { name: 'Clear search' })).toBeInTheDocument()
  })

  it('typing calls onChange with the new value', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<SearchInput query="" onChange={onChange} onClear={vi.fn()} />)
    await user.type(screen.getByRole('textbox', { name: 'Search todos' }), 'm')
    expect(onChange).toHaveBeenCalledWith('m')
  })

  it('clicking clear button calls onClear', async () => {
    const user = userEvent.setup()
    const onClear = vi.fn()
    render(<SearchInput query="milk" onChange={vi.fn()} onClear={onClear} />)
    await user.click(screen.getByRole('button', { name: 'Clear search' }))
    expect(onClear).toHaveBeenCalled()
  })
})

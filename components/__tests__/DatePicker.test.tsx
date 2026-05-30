import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import DatePicker from '@/components/DatePicker'

// Day numbers that exist in every month are picked from the (real) current month
// so assertions are deterministic without faking the clock — faking it hangs
// userEvent. Helpers mirror DatePicker's own local YYYY-MM-DD formatting.
const pad = (n: number) => String(n).padStart(2, '0')
const ymd = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
const monthOffsetDay = (offset: number, day: number) => {
  const now = new Date()
  return ymd(new Date(now.getFullYear(), now.getMonth() + offset, day))
}

describe('DatePicker', () => {
  it('shows "Due date" when no value is set', () => {
    render(<DatePicker value="" onChange={vi.fn()} />)
    expect(screen.getByRole('button', { name: 'Due date' })).toHaveTextContent('Due date')
  })

  it('shows a formatted label when a value is set', () => {
    render(<DatePicker value="2026-05-15" onChange={vi.fn()} />)
    expect(screen.getByRole('button', { name: 'Due date' })).toHaveTextContent('May 15')
  })

  it('opens the calendar dialog on click', async () => {
    const user = userEvent.setup()
    render(<DatePicker value="" onChange={vi.fn()} />)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Due date' }))
    expect(screen.getByRole('dialog', { name: 'Choose due date' })).toBeInTheDocument()
  })

  it('calls onChange with the picked day and closes', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<DatePicker value="" onChange={onChange} />)
    await user.click(screen.getByRole('button', { name: 'Due date' }))
    await user.click(within(screen.getByRole('dialog')).getByText('15'))
    expect(onChange).toHaveBeenCalledWith(monthOffsetDay(0, 15))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('navigates to the next month and picks a day there', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<DatePicker value="" onChange={onChange} />)
    await user.click(screen.getByRole('button', { name: 'Due date' }))
    await user.click(screen.getByRole('button', { name: 'Next month' }))
    await user.click(within(screen.getByRole('dialog')).getByText('10'))
    expect(onChange).toHaveBeenCalledWith(monthOffsetDay(1, 10))
  })

  it('navigates to the previous month', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<DatePicker value="" onChange={onChange} />)
    await user.click(screen.getByRole('button', { name: 'Due date' }))
    await user.click(screen.getByRole('button', { name: 'Previous month' }))
    await user.click(within(screen.getByRole('dialog')).getByText('20'))
    expect(onChange).toHaveBeenCalledWith(monthOffsetDay(-1, 20))
  })

  it('closes without committing on outside pointerdown', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<DatePicker value="" onChange={onChange} />)
    await user.click(screen.getByRole('button', { name: 'Due date' }))
    fireEvent.pointerDown(document.body)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(onChange).not.toHaveBeenCalled()
  })

  it('closes without committing on Escape', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<DatePicker value="" onChange={onChange} />)
    await user.click(screen.getByRole('button', { name: 'Due date' }))
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(onChange).not.toHaveBeenCalled()
  })

  it('clear button calls onChange with empty string', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<DatePicker value="2026-05-15" onChange={onChange} />)
    await user.click(screen.getByRole('button', { name: 'Clear due date' }))
    expect(onChange).toHaveBeenCalledWith('')
  })
})

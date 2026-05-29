import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import TodoFilter from '@/components/TodoFilter'

const defaultProps = {
  filter: 'all' as const,
  setFilter: vi.fn(),
  activeCount: 2,
  completedCount: 0,
  onClearCompleted: vi.fn(),
}

describe('TodoFilter', () => {
  it('renders all three filter buttons', () => {
    render(<TodoFilter {...defaultProps} />)
    expect(screen.getByRole('button', { name: 'All' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Active' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Completed' })).toBeInTheDocument()
  })

  it('the current filter button has aria-pressed true', () => {
    render(<TodoFilter {...defaultProps} filter="active" />)
    expect(screen.getByRole('button', { name: 'Active' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: 'All' })).toHaveAttribute('aria-pressed', 'false')
  })

  it('calls setFilter with correct value when a filter is clicked', async () => {
    const user = userEvent.setup()
    const setFilter = vi.fn()
    render(<TodoFilter {...defaultProps} setFilter={setFilter} />)
    await user.click(screen.getByRole('button', { name: 'Active' }))
    expect(setFilter).toHaveBeenCalledWith('active')
  })

  it('displays active count', () => {
    render(<TodoFilter {...defaultProps} activeCount={3} />)
    expect(screen.getByText('3 items left')).toBeInTheDocument()
  })

  it('uses singular "item" when activeCount is 1', () => {
    render(<TodoFilter {...defaultProps} activeCount={1} />)
    expect(screen.getByText('1 item left')).toBeInTheDocument()
  })

  it('clear completed button is disabled when completedCount is 0', () => {
    render(<TodoFilter {...defaultProps} completedCount={0} />)
    expect(screen.getByRole('button', { name: 'Clear completed' })).toBeDisabled()
  })

  it('clear completed button is enabled when completedCount > 0', () => {
    render(<TodoFilter {...defaultProps} completedCount={2} />)
    expect(screen.getByRole('button', { name: 'Clear completed' })).toBeEnabled()
  })

  it('calls onClearCompleted when the button is clicked', async () => {
    const user = userEvent.setup()
    const onClearCompleted = vi.fn()
    render(<TodoFilter {...defaultProps} completedCount={2} onClearCompleted={onClearCompleted} />)
    await user.click(screen.getByRole('button', { name: 'Clear completed' }))
    expect(onClearCompleted).toHaveBeenCalled()
  })
})

import { render, screen, fireEvent } from '@testing-library/react'
import { FillBlank } from '@/components/lesson/exercises/FillBlank'

const content = {
  prompt: 'N172SP, _____ 28, cleared for _____.',
  blanks: ['runway', 'takeoff'],
  context: 'ATC is giving you a takeoff clearance.',
}

describe('FillBlank', () => {
  it('renders the prompt with inputs', () => {
    render(<FillBlank content={content} onNext={jest.fn()} />)
    expect(screen.getByText(/ATC is giving you a takeoff clearance/)).toBeInTheDocument()
    expect(screen.getAllByRole('textbox')).toHaveLength(2)
  })

  it('marks correct answers as correct', () => {
    render(<FillBlank content={content} onNext={jest.fn()} />)
    const inputs = screen.getAllByRole('textbox')
    fireEvent.change(inputs[0], { target: { value: 'runway' } })
    fireEvent.change(inputs[1], { target: { value: 'takeoff' } })
    fireEvent.click(screen.getByRole('button', { name: /check/i }))
    expect(screen.getByText(/correct/i)).toBeInTheDocument()
  })

  it('calls onNext with true for all-correct answers', () => {
    const onNext = jest.fn()
    render(<FillBlank content={content} onNext={onNext} />)
    const inputs = screen.getAllByRole('textbox')
    fireEvent.change(inputs[0], { target: { value: 'runway' } })
    fireEvent.change(inputs[1], { target: { value: 'takeoff' } })
    fireEvent.click(screen.getByRole('button', { name: /check/i }))
    fireEvent.click(screen.getByRole('button', { name: /continue/i }))
    expect(onNext).toHaveBeenCalledWith(true)
  })

  it('calls onNext with false for wrong answers', () => {
    const onNext = jest.fn()
    render(<FillBlank content={content} onNext={onNext} />)
    const inputs = screen.getAllByRole('textbox')
    fireEvent.change(inputs[0], { target: { value: 'taxiway' } })
    fireEvent.change(inputs[1], { target: { value: 'landing' } })
    fireEvent.click(screen.getByRole('button', { name: /check/i }))
    fireEvent.click(screen.getByRole('button', { name: /continue/i }))
    expect(onNext).toHaveBeenCalledWith(false)
  })
})

'use client'

import { useState, useEffect } from 'react'
import { Poll } from '@/lib/firestore'

interface VoteFormProps {
  poll: Poll
  userVote: string[]
  onVote: (selectedOptions: string[]) => void
}

export default function VoteForm({ poll, userVote, onVote }: VoteFormProps) {
  const [selectedOptions, setSelectedOptions] = useState<string[]>(userVote)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [hasVoted, setHasVoted] = useState(userVote.length > 0)

  useEffect(() => {
    setSelectedOptions(userVote)
    setHasVoted(userVote.length > 0)
  }, [userVote])

  const handleOptionChange = (option: string, checked: boolean) => {
    if (poll.type === 'single') {
      setSelectedOptions(checked ? [option] : [])
    } else {
      if (checked) {
        setSelectedOptions([...selectedOptions, option])
      } else {
        setSelectedOptions(selectedOptions.filter(o => o !== option))
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (selectedOptions.length === 0) {
      alert('Please select at least one option')
      return
    }

    setIsSubmitting(true)
    try {
      await onVote(selectedOptions)
    } finally {
      setIsSubmitting(false)
    }
  }

  const isOptionSelected = (option: string) => {
    return selectedOptions.includes(option)
  }

  const hasVoteChanged = () => {
    if (userVote.length !== selectedOptions.length) return true
    return !userVote.every(vote => selectedOptions.includes(vote))
  }

  return (
    <div className="card">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">
        {hasVoted ? 'Update Your Vote' : 'Cast Your Vote'}
      </h2>
      
      {hasVoted && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-700">
            <strong>Current vote:</strong> {userVote.join(', ')}
          </p>
          <p className="text-xs text-blue-600 mt-1">
            You can change your vote at any time. Your previous vote will be replaced.
          </p>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {poll.options.map((option, index) => (
          <label key={index} className="flex items-start space-x-3 p-3 rounded-lg border border-gray-200 hover:border-primary-300 cursor-pointer transition-colors">
            <input
              type={poll.type === 'single' ? 'radio' : 'checkbox'}
              name={poll.type === 'single' ? 'poll-option' : `poll-option-${index}`}
              value={option}
              checked={isOptionSelected(option)}
              onChange={(e) => handleOptionChange(option, e.target.checked)}
              className="mt-1"
            />
            <span className="flex-1 text-gray-900">{option}</span>
          </label>
        ))}
        
        <button
          type="submit"
          disabled={isSubmitting || selectedOptions.length === 0 || (!hasVoteChanged() && hasVoted)}
          className="w-full btn-primary py-3 text-lg disabled:opacity-50 disabled:cursor-not-allowed mt-6"
        >
          {isSubmitting ? 'Submitting...' : 
           hasVoted ? (hasVoteChanged() ? 'Update Vote' : 'No Changes') : 'Submit Vote'}
        </button>
      </form>
      
      {hasVoted && !hasVoteChanged() && (
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600">
            No changes detected. Select different options to update your vote.
          </p>
        </div>
      )}
    </div>
  )
} 
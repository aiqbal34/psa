'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Poll, VoteResult, getPoll, submitVote, subscribeToPoll, subscribeToVoteResults, getUserVote } from '@/lib/firestore'
import { getClientId } from '@/lib/utils'
import VoteForm from '@/components/VoteForm'
import ResultsDisplay from '@/components/ResultsDisplay'

export default function PollPage() {
  const params = useParams()
  const pollId = params.id as string
  
  const [poll, setPoll] = useState<Poll | null>(null)
  const [results, setResults] = useState<VoteResult[]>([])
  const [userVote, setUserVote] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!pollId) return

    const clientId = getClientId()
    
    // Subscribe to poll changes
    const unsubscribePoll = subscribeToPoll(pollId, (pollData) => {
      if (pollData) {
        setPoll(pollData)
        setError(null)
      } else {
        setError('Poll not found')
      }
      setIsLoading(false)
    })

    // Subscribe to vote results
    const unsubscribeResults = subscribeToVoteResults(pollId, (voteResults) => {
      setResults(voteResults)
    })

    // Get user's current vote
    getUserVote(pollId, clientId).then((vote) => {
      if (vote) {
        setUserVote(vote)
      }
    })

    return () => {
      unsubscribePoll()
      unsubscribeResults()
    }
  }, [pollId])

  const handleVote = async (selectedOptions: string[]) => {
    if (!poll) return
    
    const clientId = getClientId()
    try {
      await submitVote(poll.id, clientId, selectedOptions)
      setUserVote(selectedOptions)
    } catch (error) {
      console.error('Error submitting vote:', error)
      alert('Failed to submit vote. Please try again.')
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center">
        <div className="card max-w-md mx-auto">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Poll Not Found</h2>
          <p className="text-gray-600 mb-6">The poll you're looking for doesn't exist or has been deleted.</p>
          <a href="/create" className="btn-primary">
            Create a New Poll
          </a>
        </div>
      </div>
    )
  }

  if (!poll) return null

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="card">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">{poll.question}</h1>
        <p className="text-gray-600">
          {poll.type === 'single' ? 'Single choice poll' : 'Multiple choice poll'}
        </p>
      </div>

      <VoteForm 
        poll={poll} 
        userVote={userVote} 
        onVote={handleVote} 
      />

      <ResultsDisplay 
        results={results} 
        pollType={poll.type}
        totalVotes={results.reduce((sum, result) => sum + result.count, 0)}
        userVote={userVote}
      />
    </div>
  )
} 
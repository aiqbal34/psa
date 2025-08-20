'use client'

import { VoteResult } from '@/lib/firestore'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface ResultsDisplayProps {
  results: VoteResult[]
  pollType: 'single' | 'multi'
  totalVotes: number
  userVote?: string[]
}

export default function ResultsDisplay({ results, pollType, totalVotes, userVote = [] }: ResultsDisplayProps) {
  if (results.length === 0) {
    return (
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Results</h2>
        <p className="text-gray-600">No votes yet. Be the first to vote!</p>
      </div>
    )
  }

  const chartData = results.map(result => ({
    option: result.option,
    votes: result.count,
    percentage: result.percentage
  }))

  const isUserVote = (option: string) => userVote.includes(option)

  return (
    <div className="card">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Live Results</h2>
      
      <div className="mb-6">
        <p className="text-gray-600">
          Total votes: <span className="font-semibold text-gray-900">{totalVotes}</span>
        </p>
        {userVote.length > 0 && (
          <p className="text-sm text-primary-600 mt-1">
            Your vote: <span className="font-medium">{userVote.join(', ')}</span>
          </p>
        )}
      </div>

      {/* Bar Chart */}
      <div className="mb-8">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Vote Distribution</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="option" 
                angle={-45}
                textAnchor="end"
                height={80}
                interval={0}
                tick={{ fontSize: 12 }}
              />
              <YAxis />
              <Tooltip 
                formatter={(value: any, name: string) => [
                  `${value} votes (${chartData.find(d => d.votes === value)?.percentage}%)`,
                  'Votes'
                ]}
              />
              <Bar 
                dataKey="votes" 
                fill="#22c55e" 
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Results List */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Detailed Results</h3>
        <div className="space-y-3">
          {results.map((result, index) => (
            <div 
              key={index} 
              className={`flex items-center justify-between p-3 rounded-lg transition-colors ${
                isUserVote(result.option) 
                  ? 'bg-primary-50 border border-primary-200' 
                  : 'bg-gray-50'
              }`}
            >
              <div className="flex-1 flex items-center space-x-2">
                <span className="font-medium text-gray-900">{result.option}</span>
                {isUserVote(result.option) && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                    Your Vote
                  </span>
                )}
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <div className="font-semibold text-gray-900">{result.count}</div>
                  <div className="text-sm text-gray-600">votes</div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-primary-600">{result.percentage}%</div>
                  <div className="text-sm text-gray-600">of total</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 p-3 bg-primary-50 rounded-lg">
        <p className="text-sm text-primary-700">
          Results update in real-time as new votes come in.
          {userVote.length > 0 && ' You can change your vote at any time.'}
        </p>
      </div>
    </div>
  )
} 
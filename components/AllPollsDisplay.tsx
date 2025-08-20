'use client';

import { useState, useEffect } from 'react';
import { Poll, VoteResult, subscribeToAllPolls, getVoteResults, deletePoll, getUserVote } from '../lib/firestore';
import { getClientId } from '../lib/utils';
import Link from 'next/link';

export default function AllPollsDisplay() {
  const [polls, setPolls] = useState<Poll[]>([]);
  const [pollResults, setPollResults] = useState<{ [pollId: string]: VoteResult[] }>({});
  const [userVotes, setUserVotes] = useState<{ [pollId: string]: string[] }>({});
  const [loading, setLoading] = useState(true);
  const [deletingPollId, setDeletingPollId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    const clientId = getClientId();
    
    const unsubscribe = subscribeToAllPolls(async (pollsData) => {
      // Sort polls by creation date (newest first)
      const sortedPolls = pollsData.sort((a, b) => {
        const dateA = a.createdAt?.toDate?.() || a.createdAt || new Date(0);
        const dateB = b.createdAt?.toDate?.() || b.createdAt || new Date(0);
        return dateB.getTime() - dateA.getTime();
      });
      
      setPolls(sortedPolls);
      
      // Fetch results and user votes for all polls
      const results: { [pollId: string]: VoteResult[] } = {};
      const votes: { [pollId: string]: string[] } = {};
      
      for (const poll of sortedPolls) {
        try {
          results[poll.id] = await getVoteResults(poll.id);
          const userVote = await getUserVote(poll.id, clientId);
          if (userVote) {
            votes[poll.id] = userVote;
          }
        } catch (error) {
          console.error(`Error fetching data for poll ${poll.id}:`, error);
          results[poll.id] = [];
        }
      }
      
      setPollResults(results);
      setUserVotes(votes);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const formatDate = (timestamp: any) => {
    if (!timestamp) return '';
    
    try {
      const date = timestamp.toDate?.() || timestamp;
      return date.toLocaleDateString();
    } catch (error) {
      return '';
    }
  };

  const handleDeleteClick = (pollId: string) => {
    setShowDeleteConfirm(pollId);
  };

  const handleDeleteConfirm = async (pollId: string) => {
    setDeletingPollId(pollId);
    setShowDeleteConfirm(null);
    
    try {
      await deletePoll(pollId);
    } catch (error) {
      console.error('Error deleting poll:', error);
      alert('Failed to delete poll. Please try again.');
    } finally {
      setDeletingPollId(null);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteConfirm(null);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (polls.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 text-lg">No polls created yet. Be the first to create one!</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">All Polls</h2>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {polls.map((poll) => {
          const results = pollResults[poll.id] || [];
          const totalVotes = results.reduce((sum, result) => sum + result.count, 0);
          const userVote = userVotes[poll.id] || [];
          const isDeleting = deletingPollId === poll.id;
          const showConfirm = showDeleteConfirm === poll.id;
          
          return (
            <div key={poll.id} className="card relative">
              {/* Delete Button */}
              <button
                onClick={() => handleDeleteClick(poll.id)}
                disabled={isDeleting}
                className="absolute top-2 right-2 p-1 text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50"
                title="Delete poll"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>

              {/* Delete Confirmation Modal */}
              {showConfirm && (
                <div className="absolute inset-0 bg-white bg-opacity-95 rounded-lg flex items-center justify-center z-10">
                  <div className="text-center p-4">
                    <h4 className="font-semibold text-gray-900 mb-2">Delete Poll?</h4>
                    <p className="text-gray-600 mb-4 text-sm">
                      This will permanently delete "{poll.question}" and all its votes.
                    </p>
                    <div className="flex gap-2 justify-center">
                      <button
                        onClick={() => handleDeleteConfirm(poll.id)}
                        className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm transition-colors"
                      >
                        Delete
                      </button>
                      <button
                        onClick={handleDeleteCancel}
                        className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-3 py-1 rounded text-sm transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Loading Overlay */}
              {isDeleting && (
                <div className="absolute inset-0 bg-white bg-opacity-75 rounded-lg flex items-center justify-center z-10">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-red-600 mx-auto mb-2"></div>
                    <p className="text-sm text-gray-600">Deleting...</p>
                  </div>
                </div>
              )}

              <div className="mb-4">
                <h3 className="font-semibold text-gray-900 mb-2 pr-8">{poll.question}</h3>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <span>{poll.type === 'single' ? 'Single choice' : 'Multiple choice'}</span>
                  <span>•</span>
                  <span>{totalVotes} votes</span>
                  {poll.createdAt && (
                    <>
                      <span>•</span>
                      <span>{formatDate(poll.createdAt)}</span>
                    </>
                  )}
                </div>
                {userVote.length > 0 && (
                  <div className="mt-2 p-2 bg-primary-50 rounded text-xs text-primary-700">
                    <span className="font-medium">Your vote:</span> {userVote.join(', ')}
                  </div>
                )}
              </div>

              <div className="space-y-2 mb-4">
                {poll.options.map((option) => {
                  const result = results.find(r => r.option === option);
                  const percentage = result?.percentage || 0;
                  const isUserVote = userVote.includes(option);
                  
                  return (
                    <div key={option} className="flex items-center gap-2">
                      <div className="flex-1">
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-700 flex items-center gap-2">
                            {option}
                            {isUserVote && (
                              <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                                ✓
                              </span>
                            )}
                          </span>
                          <span className="text-gray-500">{percentage}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full transition-all duration-300 ${
                              isUserVote ? 'bg-primary-600' : 'bg-green-500'
                            }`}
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <Link 
                href={`/poll/${poll.id}`}
                className="btn-secondary w-full text-center"
              >
                {userVote.length > 0 ? 'View & Update Vote' : 'View Details & Vote'}
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
} 
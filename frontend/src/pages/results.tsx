import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import PollResults from '@/components/PollResults';
import LoadingSpinner from '@/components/LoadingSpinner';
import EmptyState from '@/components/EmptyState';
import { pollsApi, Poll } from '@/lib/api';
import { generateColors } from '@/lib/utils';
import { BarChart3, TrendingUp, Users, Clock, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ResultsPage() {
  const [polls, setPolls] = useState<Poll[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isClearing, setIsClearing] = useState(false);

  useEffect(() => {
    fetchPolls();
  }, []);

  const fetchPolls = async () => {
    try {
      setIsLoading(true);
      const fetchedPolls = await pollsApi.getPolls();
      setPolls(fetchedPolls);
    } catch (error) {
      console.error('Failed to fetch polls:', error);
      toast.error('Failed to load polls');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearDatabase = async () => {
    if (!confirm('Are you sure you want to clear all polls except one? This action cannot be undone.')) {
      return;
    }

    setIsClearing(true);
    try {
      await pollsApi.clearDatabase();
      toast.success('Database cleared successfully!');
      fetchPolls(); // Refresh the polls list
    } catch (error) {
      console.error('Failed to clear database:', error);
      toast.error('Failed to clear database');
    } finally {
      setIsClearing(false);
    }
  };

  if (isLoading) {
    return (
      <Layout title="Poll Results - UCDPakiPSA Polls">
        <div className="flex items-center justify-center min-h-[400px]">
          <LoadingSpinner size="lg" text="Loading results..." />
        </div>
      </Layout>
    );
  }

  return (
    <Layout
      title="Poll Results - UCDPakiPSA Polls"
      description="View results from all ongoing polls and their current standings."
    >
      {/* Page Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Poll Results
          </h1>
          <p className="text-gray-600">
            View current standings and results from all ongoing polls
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="text-right">
            <div className="text-2xl font-bold text-primary-600">
              {polls.length}
            </div>
            <div className="text-sm text-gray-500">
              Active Polls
            </div>
          </div>
          
          <button
            onClick={handleClearDatabase}
            disabled={isClearing}
            className="btn btn-danger btn-md"
            title="Clear database except for one poll"
          >
            {isClearing ? (
              <>
                <div className="loading-spinner w-4 h-4 mr-2" />
                Clearing...
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4 mr-2" />
                Clear DB
              </>
            )}
          </button>
        </div>
      </div>

      {polls.length === 0 ? (
        <EmptyState
          icon={BarChart3}
          title="No Polls Available"
          description="There are no polls to display results for."
          actionText="Create First Poll"
          actionHref="/"
        />
      ) : (
        <div className="space-y-8">
          {polls.map((poll) => {
            const colors = generateColors(poll.options.length);
            const totalVotes = poll.total_votes;
            
            return (
              <div key={poll.id} className="card hover-lift">
                {/* Poll Header */}
                <div className="flex items-start justify-between mb-6">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">
                      {poll.question}
                    </h3>
                    
                    <div className="flex items-center space-x-6 text-sm text-gray-500">
                      <div className="flex items-center space-x-1">
                        <Clock className="w-4 h-4" />
                        <span>
                          Created {new Date(poll.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-1">
                        <Users className="w-4 h-4" />
                        <span>
                          {totalVotes} vote{totalVotes !== 1 ? 's' : ''}
                        </span>
                      </div>

                      <div className="flex items-center space-x-1">
                        <BarChart3 className="w-4 h-4" />
                        <span>
                          {poll.options.length} option{poll.options.length !== 1 ? 's' : ''}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="ml-4">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      Active
                    </span>
                  </div>
                </div>

                {/* Poll Results */}
                {totalVotes > 0 ? (
                  <PollResults
                    options={poll.options}
                    totalVotes={totalVotes}
                    colors={colors}
                    showChart={false}
                  />
                ) : (
                  <div className="text-center py-8">
                    <div className="text-gray-400 mb-2">
                      <BarChart3 className="w-12 h-12 mx-auto" />
                    </div>
                    <p className="text-gray-500">No votes yet</p>
                    <p className="text-sm text-gray-400">Be the first to vote!</p>
                  </div>
                )}

                {/* Poll Actions */}
                <div className="mt-6 pt-4 border-t border-gray-100">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-500">
                      Poll ID: {poll.id}
                    </div>
                    <a
                      href={`/poll/${poll.id}`}
                      className="btn btn-secondary btn-sm"
                    >
                      View Poll
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Layout>
  );
}
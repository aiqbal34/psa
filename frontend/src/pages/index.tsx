import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import PollCard from '@/components/PollCard';
import CreatePollModal from '@/components/CreatePollModal';
import LoadingSpinner from '@/components/LoadingSpinner';
import EmptyState from '@/components/EmptyState';
import { pollsApi, Poll, CreatePollData } from '@/lib/api';
import { Plus, RefreshCw, TrendingUp } from 'lucide-react';
import toast from 'react-hot-toast';

export default function HomePage() {
  const [polls, setPolls] = useState<Poll[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [editingPoll, setEditingPoll] = useState<Poll | null>(null);

  // Fetch polls on component mount
  useEffect(() => {
    fetchPolls();
  }, []);

  const fetchPolls = async (showRefreshing = false) => {
    try {
      if (showRefreshing) setIsRefreshing(true);
      const fetchedPolls = await pollsApi.getPolls();
      setPolls(fetchedPolls);
    } catch (error) {
      console.error('Failed to fetch polls:', error);
      toast.error('Failed to load polls');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleCreatePoll = async (pollData: CreatePollData) => {
    setIsCreating(true);
    try {
      const newPoll = await pollsApi.createPoll(pollData);
      setPolls(prevPolls => [newPoll, ...prevPolls]);
      toast.success('Poll created successfully!');
    } catch (error) {
      console.error('Failed to create poll:', error);
      toast.error('Failed to create poll');
      throw error;
    } finally {
      setIsCreating(false);
    }
  };

  const handleEditPoll = async (pollData: CreatePollData) => {
    if (!editingPoll) return;
    
    setIsCreating(true);
    try {
      const updatedPoll = await pollsApi.updatePoll(editingPoll.id, pollData);
      setPolls(prevPolls => 
        prevPolls.map(poll => 
          poll.id === editingPoll.id ? updatedPoll : poll
        )
      );
      toast.success('Poll updated successfully!');
      setEditingPoll(null);
    } catch (error) {
      console.error('Failed to update poll:', error);
      toast.error('Failed to update poll');
      throw error;
    } finally {
      setIsCreating(false);
    }
  };

  const handleVote = async (pollId: number, optionId: number, voterName: string) => {
    try {
      const result = await pollsApi.vote(pollId, { optionId, voterName });
      
      // Update the poll in the list with new results
      setPolls(prevPolls => 
        prevPolls.map(poll => 
          poll.id === pollId 
            ? { 
                ...poll, 
                options: result.options,
                total_votes: result.total_votes 
              }
            : poll
        )
      );
    } catch (error) {
      console.error('Failed to vote:', error);
      throw error;
    }
  };

  const handleRefresh = () => {
    fetchPolls(true);
  };

  const openCreateModal = () => {
    setEditingPoll(null);
    setIsCreateModalOpen(true);
  };

  const openEditModal = (poll: Poll) => {
    setEditingPoll(poll);
    setIsCreateModalOpen(true);
  };

  const closeModal = () => {
    setIsCreateModalOpen(false);
    setEditingPoll(null);
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[400px]">
          <LoadingSpinner size="lg" text="Loading polls..." />
        </div>
      </Layout>
    );
  }

  return (
    <Layout
      title="UCDPakiPSA Polls - Anonymous Polling Platform"
      description="Create and participate in anonymous polls. No login required! Share your opinions on various topics."
    >
      {/* Header Section */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl shadow-lg mb-6">
          <TrendingUp className="w-8 h-8 text-white" />
        </div>
        
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Public Polls
        </h1>
        
        <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
          Create polls, share opinions, and discover what others think. 
          Completely anonymous - no signup required!
        </p>

        {/* Action Buttons */}
        <div className="flex items-center justify-center space-x-4">
          <button
            onClick={openCreateModal}
            className="btn btn-primary btn-lg"
          >
            <Plus className="w-5 h-5 mr-2" />
            Create Poll
          </button>
          
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="btn btn-secondary btn-lg"
          >
            <RefreshCw className={`w-5 h-5 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Stats */}
      {polls.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="card text-center">
            <div className="text-2xl font-bold text-primary-600 mb-1">
              {polls.length}
            </div>
            <div className="text-sm text-gray-600">
              Total Polls
            </div>
          </div>
          
          <div className="card text-center">
            <div className="text-2xl font-bold text-success-600 mb-1">
              {polls.reduce((sum, poll) => sum + poll.total_votes, 0)}
            </div>
            <div className="text-sm text-gray-600">
              Total Votes
            </div>
          </div>
          
          <div className="card text-center">
            <div className="text-2xl font-bold text-amber-600 mb-1">
              {polls.length > 0 ? Math.round(polls.reduce((sum, poll) => sum + poll.total_votes, 0) / polls.length) : 0}
            </div>
            <div className="text-sm text-gray-600">
              Avg. Votes per Poll
            </div>
          </div>
        </div>
      )}

      {/* Polls Grid */}
      {polls.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {polls.map((poll) => (
            <PollCard
              key={poll.id}
              poll={poll}
              onVote={handleVote}
              onEdit={openEditModal}
              showResults={poll.total_votes > 0}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          title="No polls yet"
          description="Be the first to create a poll and start gathering opinions from the community!"
          actionText="Create First Poll"
          onAction={openCreateModal}
        />
      )}

      {/* Create/Edit Poll Modal */}
      <CreatePollModal
        isOpen={isCreateModalOpen}
        onClose={closeModal}
        onSubmit={editingPoll ? handleEditPoll : handleCreatePoll}
        editingPoll={editingPoll}
        isSubmitting={isCreating}
      />

      {/* Floating Create Button (Mobile) */}
      <button
        onClick={openCreateModal}
        className="fixed bottom-6 right-6 lg:hidden w-14 h-14 bg-primary-600 hover:bg-primary-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center z-40"
        title="Create Poll"
      >
        <Plus className="w-6 h-6" />
      </button>
    </Layout>
  );
}
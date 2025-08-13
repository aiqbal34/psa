import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Layout from '@/components/Layout';
import PollCard from '@/components/PollCard';
import PollResults from '@/components/PollResults';
import LoadingSpinner from '@/components/LoadingSpinner';
import { pollsApi, Poll } from '@/lib/api';
import { generateColors, getShareUrl } from '@/lib/utils';
import { ArrowLeft, Share2, BarChart3, Eye, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';

export default function PollPage() {
  const router = useRouter();
  const { id } = router.query;
  
  const [poll, setPoll] = useState<Poll | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showChart, setShowChart] = useState(false);

  useEffect(() => {
    if (id && typeof id === 'string') {
      fetchPoll(parseInt(id));
    }
  }, [id]);

  const fetchPoll = async (pollId: number) => {
    try {
      setIsLoading(true);
      setError(null);
      const fetchedPoll = await pollsApi.getPoll(pollId);
      setPoll(fetchedPoll);
    } catch (error) {
      console.error('Failed to fetch poll:', error);
      setError('Poll not found or failed to load');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVote = async (pollId: number, optionId: number, voterName: string) => {
    try {
      const result = await pollsApi.vote(pollId, { optionId, voterName });
      
      if (poll) {
        setPoll({
          ...poll,
          options: result.options,
          total_votes: result.total_votes,
        });
      }
    } catch (error) {
      console.error('Failed to vote:', error);
      throw error;
    }
  };

  const handleShare = async () => {
    const shareUrl = getShareUrl(poll!.id);
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: poll!.question,
          text: 'Check out this poll and cast your vote!',
          url: shareUrl,
        });
      } catch (error) {
        // User cancelled or sharing failed, fallback to clipboard
        handleCopyLink(shareUrl);
      }
    } else {
      handleCopyLink(shareUrl);
    }
  };

  const handleCopyLink = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      toast.success('Poll link copied to clipboard!');
    } catch (error) {
      console.error('Failed to copy link:', error);
      toast.error('Failed to copy link');
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[400px]">
          <LoadingSpinner size="lg" text="Loading poll..." />
        </div>
      </Layout>
    );
  }

  if (error || !poll) {
    return (
      <Layout title="Poll Not Found">
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🗳️</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Poll Not Found
          </h1>
          <p className="text-gray-600 mb-6">
            {error || 'The poll you\'re looking for doesn\'t exist or has been removed.'}
          </p>
          <Link href="/" className="btn btn-primary btn-lg">
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Polls
          </Link>
        </div>
      </Layout>
    );
  }

  const colors = generateColors(poll.options.length);
  const hasVotes = poll.total_votes > 0;

  return (
    <Layout
      title={`${poll.question} - UCDPakiPSA Polls`}
      description={`Vote on this poll: ${poll.question}. ${poll.options.length} options available.`}
    >
      {/* Navigation */}
      <div className="flex items-center justify-between mb-6">
        <Link 
          href="/"
          className="btn btn-secondary btn-md"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Polls
        </Link>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleShare}
            className="btn btn-secondary btn-md"
          >
            <Share2 className="w-4 h-4 mr-2" />
            Share
          </button>
          
          {hasVotes && (
            <button
              onClick={() => setShowChart(!showChart)}
              className="btn btn-secondary btn-md"
            >
              {showChart ? <Eye className="w-4 h-4 mr-2" /> : <BarChart3 className="w-4 h-4 mr-2" />}
              {showChart ? 'Bar View' : 'Chart View'}
            </button>
          )}
        </div>
      </div>

      {/* Main Poll Content */}
      <div className="max-w-4xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Poll Voting/Results */}
          <div className="lg:col-span-2">
            <PollCard
              poll={poll}
              onVote={handleVote}
              showResults={hasVotes}
            />
          </div>

          {/* Sidebar with additional info */}
          <div className="space-y-6">
            {/* Poll Stats */}
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Poll Statistics
              </h3>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Total Votes</span>
                  <span className="font-semibold text-gray-900">
                    {poll.total_votes}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Options</span>
                  <span className="font-semibold text-gray-900">
                    {poll.options.length}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Created</span>
                  <span className="font-semibold text-gray-900">
                    {new Date(poll.created_at).toLocaleDateString()}
                  </span>
                </div>
                
                {poll.updated_at !== poll.created_at && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Updated</span>
                    <span className="font-semibold text-gray-900">
                      {new Date(poll.updated_at).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Share Card */}
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Share This Poll
              </h3>
              
              <p className="text-gray-600 text-sm mb-4">
                Help others discover this poll by sharing it with your network.
              </p>
              
              <button
                onClick={handleShare}
                className="btn btn-primary btn-md w-full"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Share Poll
              </button>
            </div>

            {/* Browse More */}
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Explore More
              </h3>
              
              <p className="text-gray-600 text-sm mb-4">
                Discover other polls and share your opinions on various topics.
              </p>
              
              <Link href="/" className="btn btn-secondary btn-md w-full">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Browse All Polls
              </Link>
            </div>
          </div>
        </div>

        {/* Detailed Results (Chart View) */}
        {hasVotes && showChart && (
          <div className="mt-8">
            <div className="card">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">
                Detailed Results
              </h3>
              
              <PollResults
                options={poll.options}
                totalVotes={poll.total_votes}
                colors={colors}
                showChart={true}
              />
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
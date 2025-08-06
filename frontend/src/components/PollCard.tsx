import React, { useState } from 'react';
import { Poll, PollOption } from '@/lib/api';
import { formatDate, calculatePercentage, generateColors } from '@/lib/utils';
import { Clock, Users, Edit, BarChart3, Share2 } from 'lucide-react';
import PollResults from './PollResults';
import toast from 'react-hot-toast';

interface PollCardProps {
  poll: Poll;
  onVote?: (pollId: number, optionId: number) => Promise<void>;
  onEdit?: (poll: Poll) => void;
  showResults?: boolean;
  isVoting?: boolean;
}

const PollCard: React.FC<PollCardProps> = ({ 
  poll, 
  onVote, 
  onEdit, 
  showResults = false,
  isVoting = false 
}) => {
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [hasVoted, setHasVoted] = useState(showResults);
  const [localResults, setLocalResults] = useState<PollOption[]>(poll.options);
  const [totalVotes, setTotalVotes] = useState(poll.total_votes);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleVote = async () => {
    if (!selectedOption || !onVote || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onVote(poll.id, selectedOption);
      setHasVoted(true);
      toast.success('Vote recorded successfully!');
    } catch (error) {
      console.error('Failed to vote:', error);
      toast.error('Failed to record vote. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/poll/${poll.id}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: poll.question,
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

  const colors = generateColors(poll.options.length);

  return (
    <div className="card hover-lift">
      {/* Poll Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-2 text-balance">
            {poll.question}
          </h3>
          
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <div className="flex items-center space-x-1">
              <Clock className="w-4 h-4" />
              <span>{formatDate(poll.created_at)}</span>
            </div>
            
            <div className="flex items-center space-x-1">
              <Users className="w-4 h-4" />
              <span>
                {totalVotes} vote{totalVotes !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2 ml-4">
          <button
            onClick={handleShare}
            className="btn btn-secondary btn-sm"
            title="Share poll"
          >
            <Share2 className="w-4 h-4" />
            <span className="hidden sm:inline ml-1">Share</span>
          </button>
          
          {onEdit && (
            <button
              onClick={() => onEdit(poll)}
              className="btn btn-secondary btn-sm"
              title="Edit poll"
            >
              <Edit className="w-4 h-4" />
              <span className="hidden sm:inline ml-1">Edit</span>
            </button>
          )}
        </div>
      </div>

      {/* Poll Content */}
      {hasVoted || showResults ? (
        <PollResults 
          options={localResults} 
          totalVotes={totalVotes}
          colors={colors}
        />
      ) : (
        <div className="space-y-3">
          {poll.options.map((option, index) => (
            <label
              key={option.id}
              className={`poll-option ${
                selectedOption === option.id ? 'selected' : ''
              }`}
            >
              <input
                type="radio"
                name={`poll-${poll.id}`}
                value={option.id}
                checked={selectedOption === option.id}
                onChange={() => setSelectedOption(option.id)}
                className="sr-only"
                disabled={isSubmitting}
              />
              
              <div className="flex items-center space-x-3">
                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                  selectedOption === option.id
                    ? 'border-primary-500 bg-primary-500'
                    : 'border-gray-300'
                }`}>
                  {selectedOption === option.id && (
                    <div className="w-2 h-2 bg-white rounded-full" />
                  )}
                </div>
                
                <span className="flex-1 text-gray-900 font-medium">
                  {option.text}
                </span>
              </div>
            </label>
          ))}

          {/* Vote Button */}
          {onVote && (
            <div className="pt-4 border-t border-gray-100">
              <button
                onClick={handleVote}
                disabled={!selectedOption || isSubmitting}
                className="btn btn-primary btn-md w-full"
              >
                {isSubmitting ? (
                  <>
                    <div className="loading-spinner w-4 h-4 mr-2" />
                    Recording Vote...
                  </>
                ) : (
                  <>
                    <BarChart3 className="w-4 h-4 mr-2" />
                    Cast Vote
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Poll Stats */}
      {(hasVoted || showResults) && totalVotes > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex items-center justify-between text-sm text-gray-500">
            <span>Total votes: {totalVotes}</span>
            <span>Updated {formatDate(poll.updated_at)}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default PollCard;
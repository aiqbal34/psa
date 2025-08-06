import React from 'react';
import { Vote, Plus } from 'lucide-react';

interface EmptyStateProps {
  title?: string;
  description?: string;
  actionText?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'No polls yet',
  description = 'Create the first poll to get started!',
  actionText = 'Create Poll',
  onAction,
  icon
}) => {
  return (
    <div className="text-center py-12">
      <div className="flex items-center justify-center w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-full">
        {icon || <Vote className="w-10 h-10 text-gray-400" />}
      </div>
      
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        {title}
      </h3>
      
      <p className="text-gray-600 mb-6 max-w-sm mx-auto">
        {description}
      </p>
      
      {onAction && (
        <button
          onClick={onAction}
          className="btn btn-primary btn-lg"
        >
          <Plus className="w-5 h-5 mr-2" />
          {actionText}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
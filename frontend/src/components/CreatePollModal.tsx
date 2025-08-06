import React, { useState, useEffect } from 'react';
import { Poll, CreatePollData } from '@/lib/api';
import { validatePollData } from '@/lib/utils';
import { X, Plus, Trash2, Save, Edit } from 'lucide-react';

interface CreatePollModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (pollData: CreatePollData) => Promise<void>;
  editingPoll?: Poll | null;
  isSubmitting?: boolean;
}

const CreatePollModal: React.FC<CreatePollModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  editingPoll,
  isSubmitting = false,
}) => {
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState<string[]>(['', '']);
  const [error, setError] = useState<string | null>(null);

  const isEditing = !!editingPoll;

  // Initialize form with editing data
  useEffect(() => {
    if (editingPoll) {
      setQuestion(editingPoll.question);
      setOptions(editingPoll.options.map(opt => opt.text));
    } else {
      setQuestion('');
      setOptions(['', '']);
    }
    setError(null);
  }, [editingPoll]);

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      if (!editingPoll) {
        setQuestion('');
        setOptions(['', '']);
      }
      setError(null);
    }
  }, [isOpen, editingPoll]);

  const handleAddOption = () => {
    if (options.length < 10) {
      setOptions([...options, '']);
    }
  };

  const handleRemoveOption = (index: number) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index));
    }
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const trimmedOptions = options.map(opt => opt.trim()).filter(opt => opt);
    const validationError = validatePollData(question, trimmedOptions);
    
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      await onSubmit({
        question: question.trim(),
        options: trimmedOptions.map(text => ({ text })),
      });
      
      if (!editingPoll) {
        // Reset form only for new polls
        setQuestion('');
        setOptions(['', '']);
      }
      setError(null);
      onClose();
    } catch (error) {
      console.error('Failed to submit poll:', error);
      setError('Failed to save poll. Please try again.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="relative w-full max-w-2xl bg-white rounded-xl shadow-2xl border border-gray-200 max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-10 h-10 bg-primary-100 rounded-lg">
                {isEditing ? (
                  <Edit className="w-5 h-5 text-primary-600" />
                ) : (
                  <Plus className="w-5 h-5 text-primary-600" />
                )}
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {isEditing ? 'Edit Poll' : 'Create New Poll'}
                </h2>
                <p className="text-sm text-gray-600">
                  {isEditing ? 'Update your poll question and options' : 'Ask a question and provide multiple choice options'}
                </p>
              </div>
            </div>
            
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              disabled={isSubmitting}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Error Message */}
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* Question Input */}
            <div>
              <label htmlFor="question" className="block text-sm font-medium text-gray-900 mb-2">
                Poll Question *
              </label>
              <textarea
                id="question"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="What would you like to ask?"
                className="textarea h-20"
                maxLength={500}
                disabled={isSubmitting}
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                {question.length}/500 characters
              </p>
            </div>

            {/* Options */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-medium text-gray-900">
                  Answer Options *
                </label>
                <span className="text-xs text-gray-500">
                  {options.length}/10 options
                </span>
              </div>
              
              <div className="space-y-3">
                {options.map((option, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <div className="flex-1">
                      <input
                        type="text"
                        value={option}
                        onChange={(e) => handleOptionChange(index, e.target.value)}
                        placeholder={`Option ${index + 1}`}
                        className="input"
                        maxLength={200}
                        disabled={isSubmitting}
                      />
                    </div>
                    
                    {options.length > 2 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveOption(index)}
                        className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        disabled={isSubmitting}
                        title="Remove option"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Add Option Button */}
              {options.length < 10 && (
                <button
                  type="button"
                  onClick={handleAddOption}
                  className="mt-3 flex items-center space-x-2 text-primary-600 hover:text-primary-700 hover:bg-primary-50 px-3 py-2 rounded-lg transition-colors"
                  disabled={isSubmitting}
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Option</span>
                </button>
              )}
            </div>

            {/* Form Actions */}
            <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="btn btn-secondary btn-md"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              
              <button
                type="submit"
                className="btn btn-primary btn-md"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <div className="loading-spinner w-4 h-4 mr-2" />
                    {isEditing ? 'Updating...' : 'Creating...'}
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    {isEditing ? 'Update Poll' : 'Create Poll'}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreatePollModal;
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return 'Just now';
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes === 1 ? '' : 's'} ago`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours === 1 ? '' : 's'} ago`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `${diffInDays} day${diffInDays === 1 ? '' : 's'} ago`;
  }

  // For older dates, show the actual date
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const calculatePercentage = (votes: number, totalVotes: number): number => {
  if (totalVotes === 0) return 0;
  return Math.round((votes / totalVotes) * 100);
};

export const validatePollData = (question: string, options: string[]): string | null => {
  if (!question.trim()) {
    return 'Question is required';
  }

  if (question.trim().length < 5) {
    return 'Question must be at least 5 characters long';
  }

  if (question.trim().length > 500) {
    return 'Question must be less than 500 characters';
  }

  if (options.length < 2) {
    return 'At least 2 options are required';
  }

  if (options.length > 10) {
    return 'Maximum 10 options allowed';
  }

  for (let i = 0; i < options.length; i++) {
    const option = options[i].trim();
    if (!option) {
      return `Option ${i + 1} cannot be empty`;
    }
    if (option.length > 200) {
      return `Option ${i + 1} must be less than 200 characters`;
    }
  }

  // Check for duplicate options
  const uniqueOptions = new Set(options.map(opt => opt.trim().toLowerCase()));
  if (uniqueOptions.size !== options.length) {
    return 'Options must be unique';
  }

  return null;
};

export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
};

export const generateColors = (count: number): string[] => {
  const colors = [
    '#3B82F6', // blue-500
    '#10B981', // emerald-500
    '#F59E0B', // amber-500
    '#EF4444', // red-500
    '#8B5CF6', // violet-500
    '#06B6D4', // cyan-500
    '#84CC16', // lime-500
    '#F97316', // orange-500
    '#EC4899', // pink-500
    '#6366F1', // indigo-500
  ];

  // Repeat colors if we need more than available
  const result: string[] = [];
  for (let i = 0; i < count; i++) {
    result.push(colors[i % colors.length]);
  }

  return result;
};

export const debounce = <T extends (...args: any[]) => void>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    return false;
  }
};

export const getShareUrl = (pollId: number): string => {
  if (typeof window !== 'undefined') {
    return `${window.location.origin}/poll/${pollId}`;
  }
  return `https://ucdpakipsa.io/poll/${pollId}`;
};
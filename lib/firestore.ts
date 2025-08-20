import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  onSnapshot, 
  serverTimestamp,
  query,
  where,
  getDocs,
  deleteDoc
} from 'firebase/firestore';
import { db } from './firebase';
import { generatePollId } from './utils';

// Types
export interface Poll {
  id: string;
  question: string;
  options: string[];
  type: 'single' | 'multi';
  createdAt: any;
}

export interface Vote {
  selectedOptions: string[];
  updatedAt: any;
}

export interface VoteResult {
  option: string;
  count: number;
  percentage: number;
}

// Create a new poll
export const createPoll = async (question: string, options: string[], type: 'single' | 'multi'): Promise<string> => {
  const pollId = generatePollId();
  const pollData: Omit<Poll, 'id'> = {
    question,
    options,
    type,
    createdAt: serverTimestamp()
  };

  await setDoc(doc(db, 'polls', pollId), pollData);
  return pollId;
};

// Get a poll by ID
export const getPoll = async (pollId: string): Promise<Poll | null> => {
  const pollDoc = await getDoc(doc(db, 'polls', pollId));
  if (pollDoc.exists()) {
    return { id: pollDoc.id, ...pollDoc.data() } as Poll;
  }
  return null;
};

// Subscribe to poll changes
export const subscribeToPoll = (pollId: string, callback: (poll: Poll | null) => void) => {
  return onSnapshot(doc(db, 'polls', pollId), (doc) => {
    if (doc.exists()) {
      callback({ id: doc.id, ...doc.data() } as Poll);
    } else {
      callback(null);
    }
  });
};

// Submit a vote
export const submitVote = async (pollId: string, clientId: string, selectedOptions: string[]): Promise<void> => {
  const voteData: Vote = {
    selectedOptions,
    updatedAt: serverTimestamp()
  };

  await setDoc(doc(db, 'votes', pollId, 'clients', clientId), voteData);
};

// Get vote results for a poll
export const getVoteResults = async (pollId: string): Promise<VoteResult[]> => {
  const votesSnapshot = await getDocs(collection(db, 'votes', pollId, 'clients'));
  const votes = votesSnapshot.docs.map(doc => doc.data() as Vote);
  
  // Get poll to know the options
  const poll = await getPoll(pollId);
  if (!poll) return [];

  // Count votes for each option
  const optionCounts: { [key: string]: number } = {};
  poll.options.forEach(option => {
    optionCounts[option] = 0;
  });

  votes.forEach(vote => {
    vote.selectedOptions.forEach(option => {
      if (optionCounts[option] !== undefined) {
        optionCounts[option]++;
      }
    });
  });

  const totalVotes = votes.length;
  
  return poll.options.map(option => ({
    option,
    count: optionCounts[option] || 0,
    percentage: totalVotes > 0 ? Math.round((optionCounts[option] || 0) / totalVotes * 100) : 0
  }));
};

// Subscribe to vote results
export const subscribeToVoteResults = (pollId: string, callback: (results: VoteResult[]) => void) => {
  return onSnapshot(collection(db, 'votes', pollId, 'clients'), async () => {
    const results = await getVoteResults(pollId);
    callback(results);
  });
};

// Get user's current vote
export const getUserVote = async (pollId: string, clientId: string): Promise<string[] | null> => {
  const voteDoc = await getDoc(doc(db, 'votes', pollId, 'clients', clientId));
  if (voteDoc.exists()) {
    return (voteDoc.data() as Vote).selectedOptions;
  }
  return null;
};

// Get all polls
export const getAllPolls = async (): Promise<Poll[]> => {
  const pollsSnapshot = await getDocs(collection(db, 'polls'));
  return pollsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Poll));
};

// Subscribe to all polls
export const subscribeToAllPolls = (callback: (polls: Poll[]) => void) => {
  return onSnapshot(collection(db, 'polls'), (snapshot) => {
    const polls = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Poll));
    callback(polls);
  });
};

// Delete a poll and all its votes
export const deletePoll = async (pollId: string): Promise<void> => {
  // Delete all votes for this poll first
  const votesSnapshot = await getDocs(collection(db, 'votes', pollId, 'clients'));
  const deleteVotePromises = votesSnapshot.docs.map(doc => deleteDoc(doc.ref));
  await Promise.all(deleteVotePromises);
  
  // Delete the poll document
  await deleteDoc(doc(db, 'polls', pollId));
}; 
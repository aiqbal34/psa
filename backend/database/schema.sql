-- UCDPakiPSA Polling Database Schema

-- Create polls table
CREATE TABLE IF NOT EXISTS polls (
    id SERIAL PRIMARY KEY,
    question TEXT NOT NULL,
    options JSONB NOT NULL, -- Array of option objects: [{"id": 1, "text": "Option 1"}, ...]
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create votes table
CREATE TABLE IF NOT EXISTS votes (
    id SERIAL PRIMARY KEY,
    poll_id INTEGER REFERENCES polls(id) ON DELETE CASCADE,
    option_id INTEGER NOT NULL,
    voter_name VARCHAR(100) NOT NULL,
    voted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_polls_created_at ON polls(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_votes_poll_id ON votes(poll_id);
CREATE INDEX IF NOT EXISTS idx_votes_option_id ON votes(option_id);
CREATE INDEX IF NOT EXISTS idx_votes_voter_name ON votes(voter_name);

-- Add unique constraint to prevent duplicate voting by same name on same poll
ALTER TABLE votes ADD CONSTRAINT unique_voter_per_poll UNIQUE (poll_id, voter_name);

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_polls_updated_at 
    BEFORE UPDATE ON polls 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data for testing
INSERT INTO polls (question, options) VALUES 
(
    'What is your favorite programming language?',
    '[
        {"id": 1, "text": "JavaScript"},
        {"id": 2, "text": "Python"},
        {"id": 3, "text": "Java"},
        {"id": 4, "text": "TypeScript"}
    ]'
),
(
    'Which meal do you prefer?',
    '[
        {"id": 1, "text": "Breakfast"},
        {"id": 2, "text": "Lunch"},
        {"id": 3, "text": "Dinner"},
        {"id": 4, "text": "Snacks"}
    ]'
);

-- Insert sample votes
INSERT INTO votes (poll_id, option_id, voter_name) VALUES 
(1, 1, 'Alice'), (1, 2, 'Bob'), (1, 1, 'Charlie'), (1, 3, 'David'), (1, 2, 'Eve'), (1, 1, 'Frank'),
(2, 3, 'Grace'), (2, 3, 'Henry'), (2, 2, 'Irene'), (2, 4, 'Jack'), (2, 3, 'Kate');
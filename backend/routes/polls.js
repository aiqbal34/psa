const express = require('express');
const { body, param, validationResult } = require('express-validator');
const { query } = require('../database/db');

const router = express.Router();

// Validation middleware
const validatePoll = [
  body('question')
    .trim()
    .isLength({ min: 5, max: 500 })
    .withMessage('Question must be between 5 and 500 characters'),
  body('options')
    .isArray({ min: 2, max: 10 })
    .withMessage('Must provide between 2 and 10 options'),
  body('options.*.text')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Each option must be between 1 and 200 characters'),
];

const validateVote = [
  param('id').isInt({ min: 1 }).withMessage('Invalid poll ID'),
  body('optionId').isInt({ min: 1 }).withMessage('Invalid option ID'),
  body('voterName')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Voter name must be between 1 and 100 characters'),
];

const validatePollId = [
  param('id').isInt({ min: 1 }).withMessage('Invalid poll ID'),
];

// Helper function to handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

// GET /api/polls - Get all polls with vote counts
router.get('/', async (req, res) => {
  try {
    // Get all polls with total vote counts using a single query
    const pollsResult = await query(`
      SELECT 
        p.*,
        COALESCE(vote_counts.total_votes, 0) as total_votes
      FROM polls p
      LEFT JOIN (
        SELECT 
          poll_id, 
          COUNT(*) as total_votes
        FROM votes 
        GROUP BY poll_id
      ) vote_counts ON p.id = vote_counts.poll_id
      ORDER BY p.created_at DESC
    `);

    // Get vote counts per option for all polls in one query
    const allVotesResult = await query(`
      SELECT 
        poll_id,
        option_id,
        COUNT(*) as vote_count
      FROM votes 
      GROUP BY poll_id, option_id
    `);

    // Create a map of vote counts by poll and option
    const voteMap = {};
    allVotesResult.rows.forEach(row => {
      if (!voteMap[row.poll_id]) {
        voteMap[row.poll_id] = {};
      }
      voteMap[row.poll_id][row.option_id] = parseInt(row.vote_count);
    });

    // Add vote counts to poll options
    const pollsWithVotes = pollsResult.rows.map(poll => {
      const pollVotes = voteMap[poll.id] || {};
      const optionsWithVotes = poll.options.map(option => ({
        ...option,
        votes: pollVotes[option.id] || 0
      }));

      return {
        ...poll,
        options: optionsWithVotes,
        total_votes: parseInt(poll.total_votes)
      };
    });

    res.json({
      success: true,
      data: pollsWithVotes
    });
  } catch (error) {
    console.error('Error fetching polls:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch polls'
    });
  }
});

// GET /api/polls/:id - Get specific poll with detailed results
router.get('/:id', validatePollId, handleValidationErrors, async (req, res) => {
  try {
    const pollId = req.params.id;

    // Get poll details
    const pollResult = await query('SELECT * FROM polls WHERE id = $1', [pollId]);
    
    if (pollResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Poll not found'
      });
    }

    const poll = pollResult.rows[0];

    // Get vote counts for each option
    const votesResult = await query(`
      SELECT 
        option_id,
        COUNT(*) as vote_count
      FROM votes 
      WHERE poll_id = $1 
      GROUP BY option_id
    `, [pollId]);

    // Create a map of option votes
    const voteMap = {};
    votesResult.rows.forEach(row => {
      voteMap[row.option_id] = parseInt(row.vote_count);
    });

    // Add vote counts to options
    const optionsWithVotes = poll.options.map(option => ({
      ...option,
      votes: voteMap[option.id] || 0
    }));

    const totalVotes = Object.values(voteMap).reduce((sum, count) => sum + count, 0);

    res.json({
      success: true,
      data: {
        ...poll,
        options: optionsWithVotes,
        total_votes: totalVotes
      }
    });
  } catch (error) {
    console.error('Error fetching poll:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch poll'
    });
  }
});

// POST /api/polls - Create a new poll
router.post('/', validatePoll, handleValidationErrors, async (req, res) => {
  try {
    const { question, options } = req.body;

    // Add IDs to options
    const optionsWithIds = options.map((option, index) => ({
      id: index + 1,
      text: option.text.trim()
    }));

    const result = await query(
      'INSERT INTO polls (question, options) VALUES ($1, $2) RETURNING *',
      [question.trim(), JSON.stringify(optionsWithIds)]
    );

    res.status(201).json({
      success: true,
      message: 'Poll created successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error creating poll:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create poll'
    });
  }
});

// PUT /api/polls/:id - Update a poll
router.put('/:id', validatePollId, validatePoll, handleValidationErrors, async (req, res) => {
  try {
    const pollId = req.params.id;
    const { question, options } = req.body;

    // Check if poll exists
    const existingPoll = await query('SELECT id FROM polls WHERE id = $1', [pollId]);
    if (existingPoll.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Poll not found'
      });
    }

    // Add IDs to options
    const optionsWithIds = options.map((option, index) => ({
      id: index + 1,
      text: option.text.trim()
    }));

    const result = await query(
      'UPDATE polls SET question = $1, options = $2 WHERE id = $3 RETURNING *',
      [question.trim(), JSON.stringify(optionsWithIds), pollId]
    );

    res.json({
      success: true,
      message: 'Poll updated successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating poll:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update poll'
    });
  }
});

// POST /api/polls/:id/vote - Vote on a poll
router.post('/:id/vote', validateVote, handleValidationErrors, async (req, res) => {
  try {
    const pollId = req.params.id;
    const { optionId, voterName } = req.body;

    // Check if poll exists and option is valid
    const pollResult = await query('SELECT options FROM polls WHERE id = $1', [pollId]);
    
    if (pollResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Poll not found'
      });
    }

    const poll = pollResult.rows[0];
    const validOptionIds = poll.options.map(opt => opt.id);
    
    if (!validOptionIds.includes(optionId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid option ID'
      });
    }

    // Check if this voter has already voted on this poll
    const existingVoteResult = await query(
      'SELECT id FROM votes WHERE poll_id = $1 AND voter_name = $2',
      [pollId, voterName.trim()]
    );

    if (existingVoteResult.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'You have already voted on this poll'
      });
    }

    // Record the vote
    await query(
      'INSERT INTO votes (poll_id, option_id, voter_name) VALUES ($1, $2, $3)',
      [pollId, optionId, voterName.trim()]
    );

    // Get updated poll results
    const votesResult = await query(`
      SELECT 
        option_id,
        COUNT(*) as vote_count
      FROM votes 
      WHERE poll_id = $1 
      GROUP BY option_id
    `, [pollId]);

    // Create vote map
    const voteMap = {};
    votesResult.rows.forEach(row => {
      voteMap[row.option_id] = parseInt(row.vote_count);
    });

    // Add vote counts to options
    const optionsWithVotes = poll.options.map(option => ({
      ...option,
      votes: voteMap[option.id] || 0
    }));

    const totalVotes = Object.values(voteMap).reduce((sum, count) => sum + count, 0);

    res.json({
      success: true,
      message: 'Vote recorded successfully',
      data: {
        options: optionsWithVotes,
        total_votes: totalVotes
      }
    });
  } catch (error) {
    console.error('Error recording vote:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to record vote'
    });
  }
});

// DELETE /api/polls/:id - Delete a poll (optional feature)
router.delete('/:id', validatePollId, handleValidationErrors, async (req, res) => {
  try {
    const pollId = req.params.id;

    const result = await query('DELETE FROM polls WHERE id = $1 RETURNING id', [pollId]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Poll not found'
      });
    }

    res.json({
      success: true,
      message: 'Poll deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting poll:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete poll'
    });
  }
});

// POST /api/polls/clear-database - Clear database except for the first poll
router.post('/clear-database', async (req, res) => {
  try {
    // Get the first poll (oldest one) to keep
    const firstPollResult = await query(
      'SELECT id FROM polls ORDER BY created_at ASC LIMIT 1'
    );

    if (firstPollResult.rows.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No polls found to preserve'
      });
    }

    const pollToKeep = firstPollResult.rows[0].id;

    // Delete all votes except for the poll we're keeping
    await query('DELETE FROM votes WHERE poll_id != $1', [pollToKeep]);

    // Delete all polls except the one we're keeping
    const deleteResult = await query('DELETE FROM polls WHERE id != $1', [pollToKeep]);

    res.json({
      success: true,
      message: `Database cleared successfully. Kept poll ID ${pollToKeep} and deleted ${deleteResult.rowCount} other polls.`
    });
  } catch (error) {
    console.error('Error clearing database:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to clear database'
    });
  }
});

module.exports = router;
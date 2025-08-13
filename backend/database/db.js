const { Pool } = require('pg');
require('dotenv').config();

// Validate DATABASE_URL
if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL environment variable is not set!');
  console.error('📝 Please set DATABASE_URL to your PostgreSQL connection string');
  console.error('🔗 Format: postgresql://username:password@hostname:port/database_name');
  process.exit(1);
}

console.log('🔗 Connecting to database:', process.env.DATABASE_URL.replace(/:[^:@]+@/, ':****@'));
console.log('🔒 Environment:', process.env.NODE_ENV);

// SSL configuration for Render PostgreSQL
const sslConfig = process.env.NODE_ENV === 'production' ? {
  rejectUnauthorized: false,
  require: true,
  ca: undefined // Let the system handle certificate validation
} : false;

console.log('🔒 SSL Config:', sslConfig ? 'Enabled with rejectUnauthorized: false' : 'Disabled');

// Create PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: sslConfig,
  // Additional connection options for Render
  connectionTimeoutMillis: 30000,
  idleTimeoutMillis: 30000,
  max: 20
});

// Test database connection
pool.on('connect', () => {
  console.log('✅ Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('❌ PostgreSQL connection error:', err);
});

// Helper function to execute queries
const query = async (text, params) => {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('📊 Query executed', { text, duration, rows: res.rowCount });
    return res;
  } catch (error) {
    console.error('❌ Database query error:', error);
    throw error;
  }
};

// Initialize database tables
const initializeDatabase = async () => {
  try {
    console.log('🔄 Initializing database...');
    
    // Create tables
    await query(`
      CREATE TABLE IF NOT EXISTS polls (
          id SERIAL PRIMARY KEY,
          question TEXT NOT NULL,
          options JSONB NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS votes (
          id SERIAL PRIMARY KEY,
          poll_id INTEGER REFERENCES polls(id) ON DELETE CASCADE,
          option_id INTEGER NOT NULL,
          voter_name VARCHAR(100) NOT NULL,
          voted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create indexes
    await query(`CREATE INDEX IF NOT EXISTS idx_polls_created_at ON polls(created_at DESC)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_votes_poll_id ON votes(poll_id)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_votes_option_id ON votes(option_id)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_votes_voter_name ON votes(voter_name)`);

    // Add voter_name column if it doesn't exist (migration for existing databases)
    await query(`
      DO $$ 
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'votes' AND column_name = 'voter_name'
        ) THEN
          ALTER TABLE votes ADD COLUMN voter_name VARCHAR(100);
          -- For existing votes, set a default name
          UPDATE votes SET voter_name = 'Anonymous_' || id WHERE voter_name IS NULL;
          -- Make the column NOT NULL
          ALTER TABLE votes ALTER COLUMN voter_name SET NOT NULL;
        END IF;
      END $$;
    `);

    // Add unique constraint to prevent duplicate voting by same name on same poll
    await query(`
      DO $$ 
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint 
          WHERE conname = 'unique_voter_per_poll'
        ) THEN
          ALTER TABLE votes ADD CONSTRAINT unique_voter_per_poll UNIQUE (poll_id, voter_name);
        END IF;
      END $$;
    `);

    // Create update trigger function
    await query(`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
          NEW.updated_at = CURRENT_TIMESTAMP;
          RETURN NEW;
      END;
      $$ language 'plpgsql'
    `);

    // Create trigger
    await query(`
      DROP TRIGGER IF EXISTS update_polls_updated_at ON polls;
      CREATE TRIGGER update_polls_updated_at 
          BEFORE UPDATE ON polls 
          FOR EACH ROW 
          EXECUTE FUNCTION update_updated_at_column()
    `);

    console.log('✅ Database initialized successfully');
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    throw error;
  }
};

module.exports = {
  query,
  pool,
  initializeDatabase
};
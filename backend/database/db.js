const { Pool } = require('pg');
require('dotenv').config();

const isProduction = process.env.NODE_ENV === 'production';
const hasCloudSql = Boolean(process.env.CLOUD_SQL_CONNECTION_NAME);
const hasDatabaseUrl = Boolean(process.env.DATABASE_URL);

// Build pool configuration supporting:
// 1) Cloud SQL Unix socket via CLOUD_SQL_CONNECTION_NAME
// 2) Full DATABASE_URL
// 3) Discrete host/user/password variables for local/dev
let poolConfig;

if (hasCloudSql) {
  const requiredVars = ['DB_USER', 'DB_PASSWORD', 'DB_NAME'];
  const missing = requiredVars.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    console.error('❌ Missing required env vars for Cloud SQL:', missing.join(', '));
    console.error('📝 Required when using CLOUD_SQL_CONNECTION_NAME: DB_USER, DB_PASSWORD, DB_NAME');
    process.exit(1);
  }

  poolConfig = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: `/cloudsql/${process.env.CLOUD_SQL_CONNECTION_NAME}`,
    port: Number(process.env.DB_PORT || 5432),
    ssl: false, // Unix sockets do not require SSL
    connectionTimeoutMillis: 30000,
    idleTimeoutMillis: 30000,
    max: 20
  };

  console.log('🔗 Connecting via Cloud SQL Unix socket:', poolConfig.host);
  console.log('🔒 Environment:', process.env.NODE_ENV);
} else if (hasDatabaseUrl) {
  const enableSsl = process.env.DB_SSL === 'true' || isProduction;
  const sslConfig = enableSsl ? { rejectUnauthorized: false, require: true, ca: undefined } : false;

  poolConfig = {
    connectionString: process.env.DATABASE_URL,
    ssl: sslConfig,
    connectionTimeoutMillis: 30000,
    idleTimeoutMillis: 30000,
    max: 20
  };

  const safeUrl = process.env.DATABASE_URL.replace(/:[^:@]+@/, ':****@');
  console.log('🔗 Connecting via DATABASE_URL:', safeUrl);
  console.log('🔒 SSL:', sslConfig ? 'enabled' : 'disabled');
  console.log('🔒 Environment:', process.env.NODE_ENV);
} else {
  // Fallback for local development with discrete variables
  const requiredVars = ['DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_NAME'];
  const missing = requiredVars.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    console.error('❌ Missing required database environment variables:', missing.join(', '));
    console.error('📝 Please set either:');
    console.error('   1) DATABASE_URL (full connection string), or');
    console.error('   2) CLOUD_SQL_CONNECTION_NAME + DB_USER + DB_PASSWORD + DB_NAME, or');
    console.error('   3) DB_HOST + DB_USER + DB_PASSWORD + DB_NAME');
    process.exit(1);
  }

  poolConfig = {
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 5432),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
    connectionTimeoutMillis: 30000,
    idleTimeoutMillis: 30000,
    max: 20
  };

  console.log('🔗 Connecting via discrete variables to:', process.env.DB_HOST);
  console.log('🔒 SSL:', poolConfig.ssl ? 'enabled' : 'disabled');
  console.log('🔒 Environment:', process.env.NODE_ENV);
}

// Create PostgreSQL connection pool
const pool = new Pool(poolConfig);

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
    try {
      await query(`CREATE INDEX IF NOT EXISTS idx_polls_created_at ON polls(created_at DESC)`);
      await query(`CREATE INDEX IF NOT EXISTS idx_votes_poll_id ON votes(poll_id)`);
      await query(`CREATE INDEX IF NOT EXISTS idx_votes_option_id ON votes(option_id)`);
      await query(`CREATE INDEX IF NOT EXISTS idx_votes_voter_name ON votes(voter_name)`);
    } catch (error) {
      console.log('⚠️ Some indexes may already exist:', error.message);
    }

    // Add voter_name column if it doesn't exist (migration for existing databases)
    try {
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
    } catch (error) {
      console.log('⚠️ Migration for voter_name column already applied or failed:', error.message);
    }

    // Add unique constraint to prevent duplicate voting by same name on same poll
    try {
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
    } catch (error) {
      console.log('⚠️ Unique constraint already exists or failed:', error.message);
    }

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
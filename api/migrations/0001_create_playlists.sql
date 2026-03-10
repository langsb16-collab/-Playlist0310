-- Create playlists table
CREATE TABLE IF NOT EXISTS playlists (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  theme TEXT NOT NULL,
  songs TEXT NOT NULL,  -- JSON string
  status TEXT NOT NULL DEFAULT 'draft',  -- draft, rendered, uploaded
  created_at TEXT NOT NULL,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Create index on created_at for faster queries
CREATE INDEX IF NOT EXISTS idx_playlists_created_at ON playlists(created_at DESC);

-- Create index on status
CREATE INDEX IF NOT EXISTS idx_playlists_status ON playlists(status);

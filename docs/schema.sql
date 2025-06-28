-- Schema for StoryRefiner database tables

-- Production tables
CREATE TABLE IF NOT EXISTS user_stories (
    id SERIAL PRIMARY KEY,
    original_story TEXT NOT NULL,
    original_criteria TEXT,
    country TEXT,
    state TEXT,
    city TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ai_responses (
    id SERIAL PRIMARY KEY,
    user_story_id INTEGER REFERENCES user_stories(id) ON DELETE CASCADE,
    action VARCHAR(20) NOT NULL,
    ratings JSONB,
    rewritten_story TEXT,
    rewritten_assumptions TEXT,
    rewritten_criteria TEXT,
    raw_response JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Test tables mirror the production structure
CREATE TABLE IF NOT EXISTS tt_user_stories (
    id SERIAL PRIMARY KEY,
    original_story TEXT NOT NULL,
    original_criteria TEXT,
    country TEXT,
    state TEXT,
    city TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS tt_ai_responses (
    id SERIAL PRIMARY KEY,
    user_story_id INTEGER REFERENCES tt_user_stories(id) ON DELETE CASCADE,
    action VARCHAR(20) NOT NULL,
    ratings JSONB,
    rewritten_story TEXT,
    rewritten_assumptions TEXT,
    rewritten_criteria TEXT,
    raw_response JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create vehicle_guides table
CREATE TABLE IF NOT EXISTS vehicle_guides (
    id TEXT PRIMARY KEY, -- e.g. 'honda-civic-2012-2015'
    make TEXT NOT NULL,
    model TEXT NOT NULL,
    year_start INTEGER,
    year_end INTEGER,
    content TEXT, -- Markdown content of the master guide
    references TEXT, -- JSON string of references (videos, urls)
    last_updated INTEGER DEFAULT (strftime('%s', 'now'))
);

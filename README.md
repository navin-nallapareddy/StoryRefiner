# StoryRefiner

This project provides a simple Express server with an interface to OpenAI. The
server now includes middleware that records the caller's approximate location, but it does **not** store the originating IP address. Each request creates a JSON entry appended
to `user_log.json`. You can download the accumulated log file by visiting
`/download-log`.

## Configuration

Set a few environment variables before starting the server:

- `DATABASE_URL` - PostgreSQL connection string. When the app runs in a
  container, use the internal service URL (e.g. `postgres://user:pass@db:5432/dbname`).
  Outside of a container, supply the external host address instead.
- `OPENAI_API_KEY` - OpenAI API key used for all AI interactions.
- `APP_ENV` - Optional. Defaults to `PROD`. Chooses between production tables
  (`user_stories` / `ai_responses`) and test tables (`tt_user_stories` /
  `tt_ai_responses`).

Add these variables to a `.env` file or export them in your shell, then start
the server with `npm start`.

The web UI offers three AI-powered actions:

- **Rate It** &ndash; scores the user story against multiple criteria.
- **Re-write** &ndash; rewrites the story, lists assumptions and acceptance
  criteria, and now includes a short test approach tailored to the story.
- **Test Summary** &ndash; generates a concise table of suggested test cases.

## API Endpoints

- `POST /user-story` - Persist a user story and associated AI data. The payload
  varies based on the `action` (`RATE`, `REWRITE` or `SUMMARY`) and always includes
  `raw_response` from ChatGPT.
- `GET /health` - Database connectivity check. Returns `200` when the database
  is reachable.
- `POST /seed-test` - Inserts a row into the table selected by `APP_ENV` using
  values from the request body and the caller's detected location.

### Environment Based Tables

Use the `APP_ENV` environment variable to route inserts:

- `APP_ENV=PROD` (default) &rarr; tables `user_stories` and `ai_responses`.
- `APP_ENV=TEST` &rarr; tables `tt_user_stories` and `tt_ai_responses`.

## Database Schema

The SQL definitions for all tables are located in [docs/schema.sql](docs/schema.sql). These statements can be used to reproduce the required database structure.

### Updating existing test tables

Older deployments of `tt_ai_responses` may be missing the `action` column. Apply the migration in `docs/migrations/tt_ai_responses_add_action.sql` or run the following SQL manually:

```sql
ALTER TABLE tt_ai_responses ADD COLUMN action VARCHAR(20) NOT NULL;
```

Without this column, `/user-story` requests will fail with a *column "action" does not exist* error.

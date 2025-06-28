# StoryRefiner

This project provides a simple Express server with an interface to OpenAI. The
server now includes a middleware that records incoming user information such as
IP address and approximate location. Each request creates a JSON entry appended
to `user_log.json`. You can download the accumulated log file by visiting
`/download-log`.

Run the server with `npm start`.

## API Endpoints

- `POST /user-story` - Persist a user story and associated AI data. The payload
  varies based on the `action` (`RATE` or `REWRITE`) and always includes
  `raw_response` from ChatGPT.
- `GET /health` - Database connectivity check. Returns `200` when the database
  is reachable.
- `POST /seed-test` - Inserts a row into the table selected by `APP_ENV` using
  values from the request body and the caller's detected location.

### Environment Based Tables

Use the `APP_ENV` environment variable to route inserts:

- `APP_ENV=PROD` (default) &rarr; tables `user_stories` and `ai_responses`.
- `APP_ENV=TEST` &rarr; tables `tt_user_stories` and `tt_ai_responses`.

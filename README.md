# StoryRefiner

This project provides a simple Express server with an interface to OpenAI. The
server now includes a middleware that records incoming user information such as
IP address and approximate location. Each request creates a JSON entry appended
to `user_log.json`. You can download the accumulated log file by visiting
`/download-log`.

Run the server with `npm start`.

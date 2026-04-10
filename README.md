# Contraction Timer

A lightweight mobile-friendly web app for tracking labor contractions.

## What it does
This app helps track:
- exact contraction start time
- exact contraction end time
- contraction duration
- interval since the previous contraction start
- running history of contractions
- average duration and average interval

It is designed to feel like a simple stopwatch / lap timer, but specialized for contractions.

## Tech stack
This project intentionally uses a very small stack:
- **HTML** for structure
- **CSS** for layout and mobile-friendly styling
- **Vanilla JavaScript** for logic and local persistence
- **Python standard library HTTP server** for simple local serving
- optional **systemd service** file for persistent hosting on Linux

No frontend framework is used.
No database is required.
Data is stored in the browser with `localStorage`.

## Project structure
- `index.html` — app structure and UI layout
- `styles.css` — mobile-first styling
- `app.js` — contraction timing logic, calculations, localStorage persistence, rendering
- `server.py` — tiny Python server for local hosting
- `contraction-timer.service` — example systemd unit for running the app persistently on Linux

## How the code works
### Core state
The app keeps two main pieces of state:
- `activeStart` — when the current contraction started, if one is active
- `contractions` — array of completed contractions

Each logged contraction stores:
- `start`
- `end`
- `durationMs`
- `intervalMs`

### Main flow
1. User taps **Start contraction**
2. App stores the current timestamp as `activeStart`
3. User taps **End contraction**
4. App calculates:
   - duration = `end - start`
   - interval = `start - previous.start`
5. App saves the result to `localStorage`
6. UI re-renders summary + history

### Persistence
The app uses browser `localStorage`, so refreshes do not immediately wipe the log.

## Running locally
### Option 1: open directly
You can open `index.html` directly in a browser.

### Option 2: serve locally with Python
```bash
python3 server.py
```

Then open:
```text
http://localhost:8787
```

## Linux service setup
If you want to keep it running on a Linux machine, you can install the included systemd unit:
- `contraction-timer.service`

Adjust paths/user if needed for your machine.

## Notes
- This is a practical timing tool, not medical advice.
- Any “pattern check” text in the app is only a lightweight heuristic.
- For real medical decisions, follow your provider’s instructions.

## License
MIT

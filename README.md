# Work Hour Logging Application

A lightweight, privacy-focused web tool for efficiently logging work hours, designed to be triggered automatically and store data in a simple, portable format.

## Overview

This application helps users log their work hours with minimal friction. It is initiated by a cron job every 30 minutes, prompting the user to record their recent work. Data is stored in weekly JSONL files for easy processing and review.

## Features

- **Automated Prompting:** A shell script, triggered by cron, opens the logging UI in your browser every 30 minutes.
- **Simple Web UI:** Log your work with a dropdown of recent tasks or enter a new one, plus a free-text description.
- **Local Data Storage:** Logs are saved in JSONL format, one file per week, for easy analysis and portability.
- **Auto-Termination:** The web app closes automatically after 10 minutes of inactivity or after submission.
- **Error Handling:** User-friendly error messages for file or write issues.
- **Privacy:** The app is only accessible from localhost; no authentication or external data transfer.

## Project Structure

```
worklogApp/
├── dictation.js            # (Optional) JS for voice input or dictation features
├── list.html               # (Optional) HTML for listing or reviewing logs
├── Specification.md        # Project specification and requirements
├── worklog.css             # Stylesheet for the web UI
├── worklog.html            # Main HTML page for logging work
├── worklog.sh              # Shell script to launch the app (used by cron)
├── worklogserver.js        # Node.js server for the web app
├── worklog/                # Directory for weekly log files
│   └── worklog_YYYY-WW.jsonl  # JSONL log files (one per week)
└── project-bin/            # Auxiliary scripts and tools
```

## How It Works

1. **Cron Job:**
   - The `worklog.sh` script is scheduled via cron to run every 30 minutes.
   - It launches the web app in your default browser and ensures the server is running.
   - If no input is received within 10 minutes, the script terminates the web app.

2. **Web Application:**
   - The user selects or enters a task and adds a description.
   - On submission, the entry is appended to the current week's JSONL file in `worklog/`.
   - The app exits after logging or if inactive for 10 minutes.

3. **Data Format:**
   - Each log entry is a JSON object with a timestamp, task, and description, stored as a line in the weekly file.

## Example Log Entry

```jsonl
{"timestamp": "2025-05-16T14:30:00Z", "task": "Email correspondence", "description": "Replied to project-related emails."}
```

## Setup & Usage

1. **Install Node.js** (for the server):
   - [Download Node.js](https://nodejs.org/)

2. **Configure Cron:**
   - Edit your crontab (`crontab -e`) to run `worklog.sh` every 30 minutes:
     ```
     */30 * * * * /path/to/worklogApp/worklog.sh /path/to/worklogdirectory
     ```

3. **Run Manually (for testing):**
   - Execute `./worklog.sh` from the project directory.

4. **Access the App:**
   - The web UI will open automatically in your default browser.

## Contributing

Contributions are welcome! Please open issues or pull requests for improvements, bug fixes, or new features.

## License

This project is licensed under the MIT License.


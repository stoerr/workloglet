**Work Hour Logging Application - Specification**

## Overview

The Work Hour Logging Application is a lightweight web-based tool designed to help users log their work hours
efficiently. It is initiated by a cron job every 30 minutes, prompting the user to log their recent work. The data is
stored in JSONL format, with a separate log file for each week.

## Components

1. **Shell Script**
    - Started via cron every 30 minutes.
    - Specifies a directory where the worklogs are stored.
    - Launches the web application in the default browser.
    - Terminates the web application if no input is received within 10 minutes using a `kill` command.

2. **Web Application**
    - Provides a simple UI for logging work.
    - Offers a dropdown list with the last 20 tasks, retrieved from the last 3 worklog files.
    - Allows entry of a new task if not in the list.
    - Includes a free-text field for additional details.
    - Sends the logged data to a JSONL file and exits upon submission.
    - Displays errors if issues occur (e.g., file permission issues, failed writes).
    - Accessible only from localhost, with no authentication required.

3. **Data Storage**
    - Logs are stored in JSONL files, one per week.
    - Files are named using the format: `worklog_YYYY-WW.jsonl` (ISO week format).
    - Each line in the file is a JSON object containing:
        - Timestamp
        - Task
        - Description (free text)

## Workflow

1. **Trigger**
    - The shell script is executed via a cron job every 30 minutes.
    - It launches the web application in the default browser.
2. **User Input**
    - The user selects or enters a task.
    - The user adds a free-text description.
    - Upon submission, data is appended to the weekly log file.
3. **Auto-Termination**
    - If no input is received within 10 minutes, the shell script forcibly terminates the web application.
    - Upon submission, the application terminates itself.

## JSONL Format

Example entry in a weekly log file:

```json
{
  "timestamp": "2025-03-18T14:00:00Z",
  "task": "Code Review",
  "description": "Reviewed pull requests and provided feedback."
}
```

## User Interface (UI)

### Entry page - logging the work

A simple web page with:

- A dropdown menu listing the last 20 tasks, based on the last 3 worklog files. The entries in the dropdown are
  sorted by the most recent date, but should be unique.
- A text input field for new task entry. It should only be shown if the 'Other' entry is selected in the dropdown.
- A text area for description.
- A submit button and a skip button, and a "List" button.
- Error messages for any issues encountered.
- If the submission was successful, the application closes itself and also the browser tab. No alert or anything.
- If the skip button is pressed, the application closes itself and also the browser tab. No alert or anything.
- The "List" button goes to the list page.

### List page - listing the work

A simple web page with:

- A table listing all entries from the last 3 worklog files.
- The entries should be grouped by day, with the date and weekday as a header.
- For each day the entries should be grouped by task. For each task, the time and descriptions should be listed.
- A quit button that terminates the application and closes the browser tab. The quit button should be sticky at the bottom of the page.

## Cron Job Example

An example cron job entry to run every 30 minutes:

```
*/30 * * * * /path/to/script.sh
```

## Exit Conditions

- The application exits when the user submits the log entry.
- The application auto-closes after 10 minutes of inactivity, enforced by the shell script.

## Architecture

It should consist of a script `worklog.sh` that starts the application, a Javascript file `worklog.js` that is
started with node.js and a HTML file `worklog.html` that is served by `worklog.js`. It must not rely on any external
libraries. The directory should be given as argument to worklog.sh (but with a default value of `./worklog`)
and passed as argument to worklog.js. Use bootstrap for the UI, loaded from CDN.
The list page is a HTML file `list.html` that is also served by `worklog.js`.

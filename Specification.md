# Work Hour Logging Application - Specification

## Overview

The Work Hour Logging Application is a lightweight web-based tool designed to help users log their work hours efficiently. It is initiated by a cron job every 30 minutes, prompting the user to log their recent work. The data is stored in JSONL format, with a separate log file for each week.

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

- The date and time the dialog was opened, in the same format as in the list.
- A dropdown menu listing the last 20 tasks, based on the last 3 worklog files. The entries in the dropdown are sorted by the most recent date, but should be unique.
- A text input field for new task entry. A drop down change should fill that field with the selected task, "other" 
  clears it. That's what will be saved to the worklog - the drop down is just filling it.
  If the text field is filled, then the drop down should be set to "other".
- A text area for description with a minimum height of 10 lines that automatically expands if the content exceeds this height.
- A button group for description controls containing:
  - A "Dictate" button that enables speech-to-text input (press and hold to dictate)
  - An "Undo" button to revert the last dictation
  - A "Fixup" button to correct transcription errors and improve formatting
- A "Submit" button and a "Skip" button, "Copy from last" button and a "List" button.
- Error messages for any issues encountered.
- If the submission was successful, the application closes itself and also the browser tab. No alert or anything.
- If the skip button is pressed, the application closes itself and also the browser tab. No alert or anything.
- If the "Copy from last" button is pressed, the drop down and text area should be filled from the last entry in the 
  last worklog file.
- The "List" button goes to the list page. The list page is loaded via fetch and replaces the whole document, so that
  the window can still be script closed when the Quit button on that page is pressed, without violating browser
  security restrictions.

### List page - listing the work

A simple web page with:

- A table listing all entries from the last 3 worklog files (or alternatively, a grouped layout using divs).
- The entries should be grouped by day, with the date and weekday as a header.
- For each day, the entries should be grouped by task. For each task, the time and descriptions should be listed.
  If several consecutive entries have the same task and description they should be grouped together - first all 
  times are listed and then the description.
- A quit button that terminates the application and closes the browser tab. The quit button should be sticky at the bottom of the page.

*Note:* Although the specification mentions a table, using a grouped layout with divs (as implemented) is acceptable if it meets the grouping requirements and provides a responsive, MacOS-inspired UI.

## Cron Job Example

An example cron job entry to run every 30 minutes:

```
*/30 * * * * /path/to/script.sh
```

## Exit Conditions

- The application exits when the user submits the log entry.
- The application auto-closes after 10 minutes of inactivity, enforced by the shell script.

## Architecture

It should consist of a script `worklog.sh` that starts the application, a JavaScript file `worklog.js` that is started with Node.js and an HTML file `worklog.html` that is served by `worklog.js`. It must not rely on any external libraries. The directory should be given as argument to worklog.sh (but with a default value of `./worklog`) and passed as argument to worklog.js. The list page is an HTML file `list.html` that is also served by `worklog.js`. Use Bootstrap for the UI, loaded from CDN.

The UI should be nicely, friendly and professional looking, with a MacOS-like silvery touch and rounded edges.

## Notes on Specification and Code Integration

- The current implementation of the web application (files: worklog.html, list.html, worklog.js) closely follows the specification.
- The UI has been adapted to have a clean, MacOS-style look with rounded elements and subtle shadows.
- One point to note in the specification is that it mentions a shell script (`worklog.sh`) to launch and terminate the application, but this file is not present in the current repository. If needed, this script should be provided to manage the application lifecycle (especially for enforcing the 10-minute inactivity timeout).
- Take care to open all parts of the application (worklog and list view) in the same browser tab and make sure it 
  can be closed by the script (use window.open to make sure window.close works or something).

Overall, aside from the missing `worklog.sh` (which may be intentional or provided separately), there are no critical errors in the code relative to the specification.

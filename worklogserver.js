// worklogserver.js: Node.js server for the Work Hour Logging Application (Updated)
// Usage: node worklogserver.js [log_directory]

const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');
const querystring = require('querystring');

// Get the log directory from command line argument, or default
const logDir = process.argv[2] ? path.resolve(process.argv[2]) : path.resolve('worklog');

// Ensure the log directory exists
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

const PORT = 3000;

// Helper: Get ISO week number and year (robust implementation)
function getISOWeek(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  return { year: d.getUTCFullYear(), week: weekNo < 10 ? '0' + weekNo : weekNo };
}

// Helper: Get unique list of tasks from last 3 worklog files, sorted by most recent first
function getRecentTasks() {
  let tasks = [];
  try {
    const files = fs.readdirSync(logDir);
    // Filter JSONL files with pattern worklog_YYYY-WW.jsonl
    const logFiles = files.filter(file => /^worklog_\d{4}-W\d{2}\.jsonl$/.test(file));
    // Sort files in descending order (most recent first) based on filename using regex extraction
    logFiles.sort((a, b) => {
      const aPart = a.match(/worklog_(\d{4}-W\d{2})\.jsonl/)[1];
      const bPart = b.match(/worklog_(\d{4}-W\d{2})\.jsonl/)[1];
      return bPart.localeCompare(aPart);
    });
    const recentFiles = logFiles.slice(0, 3);
    recentFiles.forEach(file => {
      const content = fs.readFileSync(path.join(logDir, file), 'utf8');
      const lines = content.split(/\r?\n/);
      lines.forEach(line => {
        if (line.trim()) {
          try {
            const entry = JSON.parse(line);
            if (entry.task) {
              tasks.push({ task: entry.task, timestamp: entry.timestamp });
            }
          } catch (err) {
            // Skip malformed JSON line
          }
        }
      });
    });
    // Sort tasks by timestamp descending
    tasks.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    // Build unique list preserving order
    const uniqueTasks = [];
    const seen = new Set();
    for (const entry of tasks) {
      if (!seen.has(entry.task)) {
        seen.add(entry.task);
        uniqueTasks.push(entry.task);
      }
      if (uniqueTasks.length >= 20) break;
    }
    return uniqueTasks;
  } catch (err) {
    console.error('Error fetching tasks:', err);
    return [];
  }
}

// Helper: Get all log entries from last 3 worklog files
function getRecentEntries() {
  let entries = [];
  try {
    const files = fs.readdirSync(logDir);
    const logFiles = files.filter(file => /^worklog_\d{4}-W\d{2}\.jsonl$/.test(file));
    // Sort files using regex extraction, consistent with getRecentTasks
    logFiles.sort((a, b) => {
      const aMatch = a.match(/worklog_(\d{4}-W\d{2})\.jsonl/);
      const bMatch = b.match(/worklog_(\d{4}-W\d{2})\.jsonl/);
      return bMatch[1].localeCompare(aMatch[1]);
    });
    const recentFiles = logFiles.slice(0, 3);
    recentFiles.forEach(file => {
      const content = fs.readFileSync(path.join(logDir, file), 'utf8');
      const lines = content.split(/\r?\n/);
      lines.forEach(line => {
        if (line.trim()) {
          try {
            entries.push(JSON.parse(line));
          } catch (e) {
            // skip malformed JSON
          }
        }
      });
    });
    // Sort entries by timestamp descending
    entries.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    return entries;
  } catch (err) {
    console.error('Error fetching log entries:', err);
    return [];
  }
}

// Create HTTP server
const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  
  if (req.method === 'GET' && pathname === '/') {
    // Serve worklog.html
    const filePath = path.join(__dirname, 'worklog.html');
    fs.readFile(filePath, (err, data) => {
      if (err) {
        res.writeHead(500, {'Content-Type': 'text/plain'});
        res.end('Error loading page');
      } else {
        res.writeHead(200, {'Content-Type': 'text/html'});
        res.end(data);
      }
    });
  } else if (req.method === 'GET' && pathname === '/worklog.css') {
    // Serve worklog.css
    const filePath = path.join(__dirname, 'worklog.css');
    fs.readFile(filePath, (err, data) => {
      if (err) {
        res.writeHead(500, {'Content-Type': 'text/plain'});
        res.end('Error loading CSS file');
      } else {
        res.writeHead(200, {'Content-Type': 'text/css'});
        res.end(data);
      }
    });
  } else if (req.method === 'GET' && pathname === '/tasks') {
    // Endpoint to return recent unique tasks in JSON format
    const tasks = getRecentTasks();
    res.writeHead(200, {'Content-Type': 'application/json'});
    res.end(JSON.stringify(tasks));
  } else if (req.method === 'POST' && pathname === '/submit') {
    let body = '';
    req.on('data', chunk => {
      body += chunk;
    });
    req.on('end', () => {
      const postData = querystring.parse(body);
      // Use the task from the text input; the dropdown just fills the input.
      const task = postData.task || '';
      const description = postData.description || '';
      const timestamp = new Date().toISOString();
      
      const logEntry = { timestamp, task, description };
      const logLine = JSON.stringify(logEntry) + "\n";

      const { year, week } = getISOWeek(new Date());
      const logFileName = `worklog_${year}-W${week}.jsonl`;
      const logFilePath = path.join(logDir, logFileName);
      
      fs.appendFile(logFilePath, logLine, (err) => {
        if (err) {
          res.writeHead(500, {'Content-Type': 'text/plain'});
          res.end('Error writing log entry');
        } else {
          res.writeHead(200, {'Content-Type': 'text/plain'});
          res.end('');
          // Give the response a moment then exit the process
          setTimeout(() => {
            process.exit(0);
          }, 1000);
        }
      });
    });
  } else if (req.method === 'GET' && pathname === '/skip') {
    // Endpoint to skip logging: simply terminate the server
    res.writeHead(200, {'Content-Type': 'text/plain'});
    res.end('');
    setTimeout(() => {
      process.exit(0);
    }, 1000);
  } else if (req.method === 'GET' && pathname === '/list') {
    // Serve list.html for log listing page
    const filePath = path.join(__dirname, 'list.html');
    fs.readFile(filePath, (err, data) => {
      if (err) {
        res.writeHead(500, {'Content-Type': 'text/plain'});
        res.end('Error loading list page');
      } else {
        res.writeHead(200, {'Content-Type': 'text/html'});
        res.end(data);
      }
    });
  } else if (req.method === 'GET' && pathname === '/logs') {
    // Endpoint to return log entries from the last 3 worklog files
    const entries = getRecentEntries();
    res.writeHead(200, {'Content-Type': 'application/json'});
    res.end(JSON.stringify(entries));
  } else if (req.method === 'GET' && pathname === '/quit') {
    // Endpoint to quit from list page
    res.writeHead(200, {'Content-Type': 'text/plain'});
    res.end('');
    setTimeout(() => {
      process.exit(0);
    }, 1000);
  } else {
    res.writeHead(404, {'Content-Type': 'text/plain'});
    res.end('Not Found');
  }
});

// Bind server to localhost as per specification
server.listen(PORT, '127.0.0.1', () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

/*
Note: The specification mentions a shell script (worklog.sh) to launch the application, but it is not present in the current repository.
*/

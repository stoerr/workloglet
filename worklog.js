// worklog.js: Node.js server for the Work Hour Logging Application
// Usage: node worklog.js [log_directory]

const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');
const querystring = require('querystring');

// Get the log directory from command line argument, or default
const logDir = process.argv[2] ? path.resolve(process.argv[2]) : path.resolve(process.env.HOME || process.env.USERPROFILE, 'worklog');

// Ensure the log directory exists
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

const PORT = 3000;

// Helper: Get ISO week number and year
function getISOWeek(date) {
  const target = new Date(date.valueOf());
  const dayNr = (date.getDay() + 6) % 7;
  target.setDate(target.getDate() - dayNr + 3);
  const firstThursday = target.valueOf();
  target.setMonth(0, 1);
  if (target.getDay() !== 4) {
    target.setMonth(0, 1 + ((4 - target.getDay()) + 7) % 7);
  }
  const weekNumber = 1 + Math.ceil((firstThursday - target) / 604800000);
  return { year: date.getFullYear(), week: (weekNumber < 10 ? '0' + weekNumber : weekNumber) };
}

// Helper: Get list of tasks from last 3 worklog files
function getRecentTasks() {
  let tasks = [];
  try {
    const files = fs.readdirSync(logDir);
    // Filter JSONL files with pattern worklog_YYYY-WW.jsonl
    const logFiles = files.filter(file => /^worklog_\d{4}-W\d{2}\.jsonl$/.test(file));
    // Sort files in descending order (most recent first) based on filename
    logFiles.sort((a, b) => {
      // extract the YYYY-WW part
      const aPart = a.match(/worklog_(\d{4}-W\d{2})\.jsonl/)[1];
      const bPart = b.match(/worklog_(\d{4}-W\d{2})\.jsonl/)[1];
      return bPart.localeCompare(aPart);
    });
    const recentFiles = logFiles.slice(0, 3);
    // For each file, read lines and parse tasks
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
            // skip malformed JSON line
          }
        }
      });
    });
    // Sort tasks by timestamp descending
    tasks.sort((a, b) => {
      return new Date(b.timestamp) - new Date(a.timestamp);
    });
    // Return only the task names in order, up to 20 tasks
    return tasks.slice(0, 20).map(e => e.task);
  } catch (err) {
    console.error('Error fetching tasks:', err);
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
  } else if (req.method === 'GET' && pathname === '/tasks') {
    // Endpoint to return recent tasks in JSON format
    const tasks = getRecentTasks();
    res.writeHead(200, {'Content-Type': 'application/json'});
    res.end(JSON.stringify(tasks));
  } else if (req.method === 'POST' && pathname === '/submit') {
    let body = '';
    req.on('data', chunk => {
      body += chunk;
    });
    req.on('end', () => {
      // Assume content-type is application/x-www-form-urlencoded
      const postData = querystring.parse(body);
      // Determine the task: if task is 'Other', then use newtask
      let task = postData.task;
      if (task === 'Other') {
        task = postData.newtask || '';
      }
      const description = postData.description || '';
      const timestamp = new Date().toISOString();
      
      // Prepare log entry
      const logEntry = { timestamp, task, description };
      const logLine = JSON.stringify(logEntry) + "\n";

      // Determine log file name based on current ISO week
      const { year, week } = getISOWeek(new Date());
      const logFileName = `worklog_${year}-W${week}.jsonl`;
      const logFilePath = path.join(logDir, logFileName);
      
      // Append log entry to file
      fs.appendFile(logFilePath, logLine, (err) => {
        if (err) {
          res.writeHead(500, {'Content-Type': 'text/plain'});
          res.end('Error writing log entry');
        } else {
          res.writeHead(200, {'Content-Type': 'text/plain'});
          res.end('Log entry recorded. Closing application.');
          // Give the response a moment and then exit the process
          setTimeout(() => {
            process.exit(0);
          }, 1000);
        }
      });
    });
  } else {
    res.writeHead(404, {'Content-Type': 'text/plain'});
    res.end('Not Found');
  }
});

server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

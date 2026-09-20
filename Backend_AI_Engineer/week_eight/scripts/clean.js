const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const reportsDir = path.join(root, 'reports');
const dbFiles = ['reports.db', 'reports.db-shm', 'reports.db-wal'];

for (const file of fs.readdirSync(reportsDir)) {
  if (file.endsWith('.pdf')) {
    fs.unlinkSync(path.join(reportsDir, file));
  }
}

for (const file of dbFiles) {
  const filePath = path.join(root, file);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
}

console.log('Cleaned generated reports and local database.');

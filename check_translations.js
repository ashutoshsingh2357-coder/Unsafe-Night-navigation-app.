const fs = require('fs');
const path = require('path');

const filePath = path.join('c:', 'Users', 'HP', 'OneDrive', 'Desktop', 'final-project', 'index.html');
const content = fs.readFileSync(filePath, 'utf8');

const match = content.match(/<script type="text\/babel">([\s\S]*?)<\/script>/);
const scriptContent = match[1];

const tCalls = scriptContent.match(/\bt\(['"].*?['"]\)/g);
console.log("Found real t(...) calls:", tCalls);

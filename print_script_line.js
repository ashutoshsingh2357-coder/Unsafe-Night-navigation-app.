const fs = require('fs');
const path = require('path');

const filePath = path.join('c:', 'Users', 'HP', 'OneDrive', 'Desktop', 'final-project', 'index.html');
const content = fs.readFileSync(filePath, 'utf8');

const match = content.match(/<script type="text\/babel">([\s\S]*?)<\/script>/);
const scriptContent = match[1];
const scriptLines = scriptContent.split(/\r?\n/);

console.log("Script lines count:", scriptLines.length);
console.log("Line 2663 (0-indexed):", JSON.stringify(scriptLines[2663]));
console.log("Line 2664 (0-indexed):", JSON.stringify(scriptLines[2664]));
console.log("Line 2665 (0-indexed):", JSON.stringify(scriptLines[2665]));

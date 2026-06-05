const fs = require('fs');
const path = require('path');

const filePath = path.join('c:', 'Users', 'HP', 'OneDrive', 'Desktop', 'final-project', 'index.html');
const content = fs.readFileSync(filePath, 'utf8');
const lines = content.split(/\r?\n/);

console.log("Line 2810 string:", JSON.stringify(lines[2809]));
console.log("Line 2811 string:", JSON.stringify(lines[2810]));
console.log("Line 2812 string:", JSON.stringify(lines[2811]));

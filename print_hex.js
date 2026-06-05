const fs = require('fs');
const path = require('path');

const filePath = path.join('c:', 'Users', 'HP', 'OneDrive', 'Desktop', 'final-project', 'index.html');
const content = fs.readFileSync(filePath, 'utf8');
const lines = content.split('\n');

for (let i = 2588; i <= 2597; i++) {
    console.log(`Line ${i+1}: ${JSON.stringify(lines[i])}`);
}

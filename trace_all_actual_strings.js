const fs = require('fs');
const path = require('path');

const filePath = path.join('c:', 'Users', 'HP', 'OneDrive', 'Desktop', 'final-project', 'index.html');
const content = fs.readFileSync(filePath, 'utf8');

const match = content.match(/<script type="text\/babel">([\s\S]*?)<\/script>/);
const scriptContent = match[1];

function traceStrings(code) {
    let inString = false;
    let stringChar = '';
    let stringStartLine = 0;
    let stringStartIndex = 0;
    
    let inComment = false;
    let commentType = '';
    
    const list = [];
    
    for (let i = 0; i < code.length; i++) {
        const char = code[i];
        const nextChar = code[i+1];
        const prevChar = code[i-1];
        
        if (inComment) {
            if (commentType === 'single' && (char === '\n' || char === '\r')) {
                inComment = false;
            } else if (commentType === 'multi' && char === '*' && nextChar === '/') {
                inComment = false;
                i++;
            }
            continue;
        }
        
        if (inString) {
            let isEscaped = false;
            if (prevChar === '\\') {
                let backslashCount = 0;
                for (let j = i - 1; j >= 0; j--) {
                    if (code[j] === '\\') backslashCount++;
                    else break;
                }
                if (backslashCount % 2 !== 0) isEscaped = true;
            }
            
            if (char === stringChar && !isEscaped) {
                inString = false;
                list.push({ type: 'close', char: stringChar, line: code.substring(0, i).split('\n').length });
            }
            continue;
        }
        
        if (char === '/' && nextChar === '/') {
            inComment = true;
            commentType = 'single';
            i++;
            continue;
        }
        if (char === '/' && nextChar === '*') {
            inComment = true;
            commentType = 'multi';
            i++;
            continue;
        }
        
        if (char === "'" || char === '"' || char === '`') {
            inString = true;
            stringChar = char;
            stringStartLine = code.substring(0, i).split('\n').length;
            stringStartIndex = i;
            list.push({ type: 'open', char: stringChar, line: stringStartLine, snippet: code.substring(i, i + 40).replace(/\r?\n/g, ' ') });
        }
    }
    
    console.log(`Total transitions: ${list.length}`);
    // Print the last 40 transitions
    console.log("Last 40 transitions:");
    list.slice(-40).forEach(item => {
        if (item.type === 'open') {
            console.log(`  OPEN  '${item.char}' at line ${item.line + 147}: "${item.snippet}"`);
        } else {
            console.log(`  CLOSE '${item.char}' at line ${item.line + 147}`);
        }
    });
}

traceStrings(scriptContent);

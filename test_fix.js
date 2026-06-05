const fs = require('fs');
const parser = require('@babel/parser');

const htmlContent = fs.readFileSync('index.html', 'utf8');
const match = htmlContent.match(/<script type="text\/babel">([\s\S]*?)<\/script>/);
const code = match[1];

function tryParse(testCode, label) {
    try {
        parser.parse(testCode, {
            sourceType: "module",
            plugins: ["jsx"]
        });
        console.log(`SUCCESS with: ${label}`);
        return true;
    } catch (e) {
        console.log(`FAILED with: ${label} - ${e.message} at line ${e.loc.line}`);
        return false;
    }
}

// Test 1: Remove line 2973 (</div> {/* End scroll-area */})
const lines = code.split('\n');
const test1Lines = [...lines];
// Let's find "End scroll-area" in script lines
const scrollAreaIdx = test1Lines.findIndex(l => l.includes("End scroll-area"));
console.log("Found scroll-area at index:", scrollAreaIdx);
if (scrollAreaIdx !== -1) {
    test1Lines.splice(scrollAreaIdx, 1);
    tryParse(test1Lines.join('\n'), "Removing scroll-area close div");
}

// Test 2: Keep scroll-area close div but remove one of the trailing divs
const test2Lines = [...lines];
const lastDivIdx = test2Lines.map((l, i) => ({l, i})).filter(x => x.l.trim() === '</div>').pop()?.i;
console.log("Last div index:", lastDivIdx);
if (lastDivIdx !== undefined) {
    test2Lines.splice(lastDivIdx, 1);
    tryParse(test2Lines.join('\n'), "Removing last trailing div");
}

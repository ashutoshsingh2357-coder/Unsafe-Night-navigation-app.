const fs = require('fs');
const parser = require('@babel/parser');

try {
    const htmlContent = fs.readFileSync('index.html', 'utf8');
    const match = htmlContent.match(/<script type="text\/babel">([\s\S]*?)<\/script>/);
    if (!match) {
        console.error("No babel script tag found!");
        process.exit(1);
    }
    const code = match[1];
    
    // Parse the code using babel parser with JSX plugin
    parser.parse(code, {
        sourceType: "module",
        plugins: ["jsx"]
    });
    console.log("SUCCESS: Babel script compiled correctly without syntax errors!");
} catch (e) {
    console.error("SYNTAX ERROR in babel script:");
    console.error(e.message);
    if (e.loc) {
        console.error(`Line in script: ${e.loc.line}, Column: ${e.loc.column}`);
        // Find corresponding line in index.html
        const htmlContent = fs.readFileSync('index.html', 'utf8');
        const scriptStartIndex = htmlContent.indexOf('<script type="text/babel">');
        const linesBeforeScript = htmlContent.substring(0, scriptStartIndex).split('\n').length;
        console.error(`Estimated Line in index.html: ${e.loc.line + linesBeforeScript}`);
    }
    process.exit(1);
}

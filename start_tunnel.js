const { execSync } = require('child_process');

console.log("Installing localtunnel programmatically...");
try {
    execSync('npm install --no-save localtunnel', { stdio: 'inherit' });
    console.log("Installation successful!");
} catch (e) {
    console.error("Failed to install localtunnel:", e.message);
    process.exit(1);
}

const localtunnel = require('localtunnel');

(async () => {
    try {
        const tunnel = await localtunnel({ port: 3000 });
        console.log("your url is: " + tunnel.url);
        
        tunnel.on('close', () => {
            console.log("Tunnel closed. Reconnecting...");
        });
        
        // Keep the process alive indefinitely
        setInterval(() => {}, 1000 * 60 * 60);
    } catch (err) {
        console.error("Error creating tunnel:", err.message);
    }
})();

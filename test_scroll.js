const fs = require('fs');
const parser = require('@babel/parser');

const htmlContent = fs.readFileSync('index.html', 'utf8');

// Perform the double replacement
let modified = htmlContent;

// 1. Insert opening scroll-area div
const targetOpen = `                {batteryLevel !== null && batteryLevel <= 0.20 && (
                    <div style={{background: '#ef4444', color: 'white', padding: '0.5rem', textAlign: 'center', fontSize: '0.75rem', fontWeight: 'bold'}}>
                        ⚠️ Low Battery ({(batteryLevel*100).toFixed(0)}%). Share your route tracking link before battery dies!
                    </div>
                )}
                {view !== 'navigation' && (`;

const replaceOpen = `                {batteryLevel !== null && batteryLevel <= 0.20 && (
                    <div style={{background: '#ef4444', color: 'white', padding: '0.5rem', textAlign: 'center', fontSize: '0.75rem', fontWeight: 'bold'}}>
                        ⚠️ Low Battery ({(batteryLevel*100).toFixed(0)}%). Share your route tracking link before battery dies!
                    </div>
                )}
                
                <div className="scroll-area">
                    {view !== 'navigation' && (`;

modified = modified.replace(targetOpen, replaceOpen);

// 2. Add back closing div at the end
const targetClose = `                {fakeCallStatus !== 'idle' && (
                    <div className="fake-call-screen">
                        <div style={{fontSize: '5rem', marginTop: '4rem'}}>👨‍🦳</div>
                        <div className="caller-info">
                            <div className="caller-name">{lang === 'hi' ? 'पापा' : 'Dad'}</div>
                            <div className="caller-status">{fakeCallStatus === 'incoming' ? 'Incoming Call...' : '00:12'}</div>
                        </div>
                        <div className="call-actions">
                            <button className="call-btn decline" onClick={declineFakeCall}>☎</button>
                            {fakeCallStatus === 'incoming' && (
                                <button className="call-btn accept" onClick={acceptFakeCall}>📞</button>
                            )}
                        </div>
                    </div>
                )}
            </div>
    );`;

const replaceClose = `                {fakeCallStatus !== 'idle' && (
                    <div className="fake-call-screen">
                        <div style={{fontSize: '5rem', marginTop: '4rem'}}>👨‍🦳</div>
                        <div className="caller-info">
                            <div className="caller-name">{lang === 'hi' ? 'पापा' : 'Dad'}</div>
                            <div className="caller-status">{fakeCallStatus === 'incoming' ? 'Incoming Call...' : '00:12'}</div>
                        </div>
                        <div className="call-actions">
                            <button className="call-btn decline" onClick={declineFakeCall}>☎</button>
                            {fakeCallStatus === 'incoming' && (
                                <button className="call-btn accept" onClick={acceptFakeCall}>📞</button>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );`;

modified = modified.replace(targetClose, replaceClose);

const match = modified.match(/<script type="text\/babel">([\s\S]*?)<\/script>/);
const code = match[1];

try {
    parser.parse(code, {
        sourceType: "module",
        plugins: ["jsx"]
    });
    console.log("SUCCESS! Scroll area fix compiles perfectly!");
} catch (e) {
    console.error("FAILED scroll area fix compile:", e.message, "at line", e.loc.line);
}

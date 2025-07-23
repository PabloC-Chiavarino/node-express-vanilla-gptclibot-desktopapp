const { app, BrowserWindow, screen } = require('electron');

function createWindow() {
    const display = screen.getPrimaryDisplay();
    const screenWidth = display.workArea.width;
    const screenHeight = display.workArea.height;

    const windowWidth = 420;
    const windowHeight = 365;
    const margin = 5;

    const win = new BrowserWindow({
        width: windowWidth,
        height: windowHeight,
        x: screenWidth - windowWidth - margin,
        y: screenHeight - windowHeight - margin,
        frame: false,
        resizable: false,
        hasShadow: false, 
        transparent: true,
        alwaysOnTop: true,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
        },
    });

    win.loadURL('http://localhost:3000');
}

app.whenReady().then(createWindow);
app.on('window-all-closed', () => {
        app.quit();
})
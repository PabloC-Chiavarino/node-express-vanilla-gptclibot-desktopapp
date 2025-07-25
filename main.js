const { app, BrowserWindow, screen } = require('electron');
const path = require('path');
const mouseEvents = require('global-mouse-events');

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
            preload: path.join(__dirname, 'preload.js'),
        },
    });

    win.loadURL('http://localhost:3000');

    mouseEvents.on('mouseup', (event) => {
        const mouseX = event.x;
        const mouseY = event.y;

        const bounds = win.getBounds();

        const isClickedOutside = (
            mouseX < bounds.x ||
            mouseX > bounds.x + bounds.width ||
            mouseY < bounds.y ||
            mouseY > bounds.y + bounds.height
        );

        if (isClickedOutside) {
            win.webContents.send('mouse-up-outside');
        }
    });
}

app.whenReady().then(createWindow);
app.on('window-all-closed', () => {
        app.quit();
})
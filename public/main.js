const { app, BrowserWindow, ipcMain, globalShortcut, dialog } = require('electron');
const path = require('path');

require('./server'); // Assuming you have a server.js file for backend operations

let win;

function createWindow() {
  const { screen } = require('electron');
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width, height } = primaryDisplay.workAreaSize;

  win = new BrowserWindow({
    width: Math.floor(width), // Adjusted for realistic scaling
    height: Math.floor(height),
    autoHideMenuBar: true,
    frame: true,
    resizable: true,
    icon: path.join('C:', 'Users', 'Joyel', 'Downloads', 'cyber-criminal.ico'),
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  win.loadFile('index.html');

  win.once('ready-to-show', () => {
    win.show();
    win.focus();
  });

  let hasReloaded = false;

win.on('maximize', () => {
  win.setFullScreen(true);

  if (!hasReloaded) {
    hasReloaded = true;
    win.webContents.reload();
  }
});


  
  win.on('unmaximize', () => {
    win.setFullScreen(false);
  });

  ipcMain.on('close-window', () => {
    win.close();
  });

  ipcMain.on('minimize-window', () => {
    win.minimize();
  });

  



globalShortcut.register('Escape', () => {
  const currentHour = new Date().getHours();

  const messages = [
    "🖐️⚠️ HEY..!! DO YOU WANT TO CLOSE ME..?? ⚠️🖐️",
    "ARE YOU SURE YOU WANT TO EXIT THE APPLICATION?",
    "PLEASE CONFIRM IF YOU'D LIKE TO CLOSE THE SYSTEM.",
    "DO YOU REALLY INTEND TO TERMINATE THE PROGRAM?",
    "CLOSING NOW MAY RESULT IN UNSAVED CHANGES. CONTINUE?",
    "PLEASE CONFIRM YOUR ACTION TO EXIT.",
    "EXITING NOW WILL END YOUR CURRENT SESSION. PROCEED?",
    "ARE YOU CERTAIN YOU WANT TO QUIT?",
    "THIS ACTION WILL CLOSE THE APPLICATION. CONFIRM?",
    "WOULD YOU LIKE TO EXIT THE PLATFORM NOW?",
    "EXITING WILL STOP ALL ACTIVE PROCESSES. ARE YOU SURE?",
    "DO YOU WANT TO CLOSE THE CURRENCY MANAGEMENT SYSTEM?",
    "KINDLY CONFIRM BEFORE EXITING THE APP.",
    "WOULD YOU LIKE TO PROCEED WITH SHUTTING DOWN?",
    "ALL WORK WILL BE LOST UPON EXIT. CONFIRM TO PROCEED.",
    "YOU'RE ABOUT TO CLOSE THE APPLICATION. CONTINUE?",
    "DO YOU WANT TO END YOUR CURRENT SESSION?",
    "THIS WILL TERMINATE THE CURRENT OPERATION. PROCEED?",
    "CONFIRM IF YOU WISH TO EXIT THE TOOL.",
    "ARE YOU SURE YOU WANT TO LOG OUT AND EXIT?",
    "EXITING NOW WILL CLOSE ALL OPEN MODULES. CONFIRM?",
    "WOULD YOU LIKE TO SAFELY EXIT THE SYSTEM?",
    "PLEASE CONFIRM CLOSURE OF THE CURRENT APPLICATION.",
    "THIS ACTION WILL LOG YOU OUT. DO YOU WANT TO CONTINUE?",
    "ALL UNSAVED DATA WILL BE LOST. ARE YOU SURE?",
    "CLICK 'YES' TO CONFIRM EXIT, 'NO' TO STAY.",
    "YOU'RE ABOUT TO END YOUR SESSION. CONFIRM TO PROCEED.",
    "ARE YOU CLOSING THE APP INTENTIONALLY?",
    "EXITING WILL DISCONNECT FROM CURRENT OPERATIONS. CONTINUE?",
    "DO YOU REALLY WISH TO SHUT DOWN THE SOFTWARE?",
    "PLEASE CONFIRM EXIT FROM OEC CURRENCY MANAGEMENT.",
    "THIS WILL STOP ALL BACKGROUND TASKS. ARE YOU SURE?",
    "CONFIRM CLOSURE OF THE TOOL BEFORE CONTINUING.",
    "ARE YOU SURE YOU’VE COMPLETED ALL TASKS BEFORE EXIT?",
    "DO YOU WISH TO SAFELY CLOSE THE SYSTEM?",
    "CONFIRM TO PROCEED WITH SYSTEM SHUTDOWN.",
    "WOULD YOU LIKE TO END YOUR WORKING SESSION NOW?",
    "THIS WILL EXIT THE PROGRAM AND RETURN TO DESKTOP. PROCEED?",
    "ARE YOU SURE YOU WANT TO FINISH AND CLOSE?",
    "THIS WILL RESULT IN APPLICATION TERMINATION. CONFIRM?",
    "EXIT REQUESTED. PLEASE CONFIRM YOUR DECISION."
  ];

  const randomMessage = messages[Math.floor(Math.random() * messages.length)];

  if (currentHour >= 7) { // After 7 PM
    dialog.showMessageBox({
      type: 'question',
      buttons: ['Yes', 'No'],
      defaultId: 1, // 'No' is selected by default
      cancelId: 1,
      title: 'OEC CURRENCY MANAGEMENT..!!',
      message: randomMessage,
    }).then(result => {
      if (result.response === 0) {
        app.quit(); // User said "Yes"
      }
      // If "No", do nothing
    });
  } else {
    app.quit(); // Before 7 PM, quit without asking
  }
});



  ipcMain.handle('send-data-to-server', async (event, data) => {
    try {
      console.log('Sending data to server:', data);
      return { success: true, message: 'Data sent successfully!' };
    } catch (error) {
      console.error('Error sending data:', error);
      return { success: false, error: 'Something went wrong while sending data. Please try again later.' };
    }
  });
}

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  console.error('An uncaught error occurred:', error);
  dialog.showErrorBox(
    'OOPS!! LOOKS LIKE I AM ALREADY RUNNING',
    'CURRENCY RATE SHEET APPLICATION IS ALREADY RUNNING...\n\n ❌ PLEASE CLOSE IT & RESTART THE APPLICATION...!!!🚨🚨🚨🚨'
  );
  app.quit();
});

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});

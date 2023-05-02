const {
  app,
  BrowserWindow,
  contextBridge,
  ipcMain,
  shell,
} = require("electron");
const path = require("path");
const gotTheLock = app.requestSingleInstanceLock();

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require("electron-squirrel-startup")) {
  app.quit();
}

let mainWindow;
const createWindow = () => {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 1600,
    height: 1000,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: true,
      enableRemoteModule: true,
      icon: path.join(__dirname, "src/icon", "icon.ico"),
      devTools: false,
    },
  });

  mainWindow.setMenu(null);

  // and load the index.html of the app.
  mainWindow.loadFile(path.join(__dirname, "src", "index.html"));

  // Open the DevTools.
  // mainWindow.webContents.openDevTools();
};

// IMPORTANT: This should be done BEFORE doing any app.something(...)
ipcMain.handle("quit-app", async (event, _) => {
  app.quit();
});
ipcMain.handle("open-dev-console", async (event, _) => {
  mainWindow.webContents.openDevTools();
});

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
// app.on("ready", createWindow);

// Request a single instance lock for the app
if (!gotTheLock) {
  // If another instance of the app is already running, quit this instance
  app.quit();
} else {
  // If this is the first instance of the app, create the main window
  app.on("ready", createWindow);
}

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.whenReady().then(() => {
  app.on("activate", () => {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

/* Allow only one instance of the app to be opened
 * this function listens to the second instance to close it and re-open the first instance instead
 */
app.on("second-instance", function (event, commandLine, workingDirectory) {
  // If the app is already running, focus the existing instance
  if (mainWindow) {
    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.focus();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.

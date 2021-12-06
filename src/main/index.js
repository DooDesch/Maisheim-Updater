import { app, ipcMain, dialog } from "electron";

// Quit when all windows are closed.
app.on("window-all-closed", function () {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== "darwin") app.quit();
});

app.whenReady().then(() => {
  ipcMain.handle("dialog.showOpenDialog", async (ev, opts) => {
    return await dialog.showOpenDialog(opts);
  });

  ipcMain.handle("dialog.showSaveDialog", async (ev, opts) => {
    return await dialog.showSaveDialog(opts);
  });

  ipcMain.handle("dialog.showMessageBox", async (ev, opts) => {
    return await dialog.showMessageBox(opts);
  });
});

// Load here all startup windows
require("./mainWindow");

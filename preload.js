const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  onOutsideClick: (callback) => {
    ipcRenderer.on('mouse-up-outside', callback);
  }
});

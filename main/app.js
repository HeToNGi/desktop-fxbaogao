// 主进程文件
const { app, ipcMain, BrowserWindow, Menu, globalShortcut } = require('electron');
// 判断是否是mac
const isMac = process.platform === 'darwin';
// 隐藏菜单栏
Menu.setApplicationMenu(null);
function createWindow () {
  const mainWindow = new BrowserWindow({
    width: 1000,
    height: 800,
    title: '发现报告',
    titleBarStyle: 'hiddenInset',
    webPreferences: {
      nodeIntegration: true,
      webviewTag: true,
    }
  });
  // 打开控制台
  // mainWindow.webContents.openDevTools();
  mainWindow.loadURL('file://' + __dirname + '/index.html');
  mainWindow.on('ready-to-show', function () {
    mainWindow.show();
    mainWindow.focus();
  });
  // 在窗口获得焦点的时候 为应用添加快捷键
  mainWindow.on('focus', function () {
    globalShortcut.register(isMac ? 'Cmd+W' : 'ctrl+W', () => {
      mainWindow.webContents.send('close');
    })
    globalShortcut.register(isMac ? 'Cmd+R' : 'ctrl+R', () => {
      mainWindow.webContents.send('refresh');
    })
  })
  // 窗口失去焦点的时候，注销所有快捷键
  mainWindow.on('blur', function () {
    globalShortcut.unregisterAll();
  });
  // 当窗口进入全屏模式时
  mainWindow.on('enter-full-screen', function () {
    mainWindow.webContents.send('enter-full-screen');
  });
  // 当窗口退出全屏模式时
  mainWindow.on('leave-full-screen', function () {
    mainWindow.webContents.send('leave-full-screen');
  });
  ipcMain.on('dbclick-title-app', () => {
    // 如果当前是全屏模式，则不作任何操作
    if (mainWindow.isSimpleFullScreen()) {
      return null;
    }
    // 窗口如果当前是最大化，则恢复到原来的大小，否则最大化窗口
    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize();
    } else {
      mainWindow.maximize();
    }
  });
}
app.whenReady().then(() => {
  createWindow();
});

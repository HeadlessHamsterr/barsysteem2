const { app, BrowserWindow, ipcMain, ipcRenderer } = require('electron');
const path = require('path');
const VirtualKeyboard = require('electron-virtual-keyboard');
let XMLHttpRequest = require('xmlhttprequest').XMLHttpRequest

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
// eslint-disable-next-line global-require
if (require('electron-squirrel-startup')) {
  app.quit();
}


ipcMain.on("klaarErmee", () =>{
  app.relaunch()
  app.quit()
})

let vkb;
var mainWindow

const createWindow = () => {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 1024,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true,
      contextIsolation: false
      
    },
    autoHideMenuBar: true,
    frame:true,
    show: false,
    fullscreen: false,
    resizable: false
  });

  // and load the index.html of the app.
  mainWindow.loadFile(path.join(__dirname, 'index.html'))
  vkb = new VirtualKeyboard(mainWindow.webContents)

  mainWindow.on('ready-to-show', () => {

    //Block dev-tools from being opened when the shortcut is pressed
    /*globalShortcut.register('Control+Shift+I', () => {
      return false;
    });*/

    mainWindow.show()
    //mainWindow.webContents.openDevTools()
    checkUpdate()
    ipcMain.on("checkUpdate", () => {
      checkUpdate()
    })
  })
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

function checkUpdate(){
  console.log("Checking for update")
  let request = new XMLHttpRequest();

  var updateAvailable = false
  var updateUrl;
  request.onreadystatechange = function() {
      if(this.readyState == 4 && this.status == 200){
          let response = JSON.parse(this.responseText)

          //Get latest version of the app from the GitHub API
          latestVersion = response["tag_name"].toString().replace('V', '');
          //Convert the version string to a list for easier comparing
          latestVersionList = latestVersion.split('.');

          //Get current app version and converting to list
          currentVersion = app.getVersion().toString();
          currentVersionList = currentVersion.split('.')

          console.log(latestVersionList);
          console.log(currentVersionList);

          //Check if a new version is available
          if(parseInt(latestVersionList[0]) > parseInt(currentVersionList[0])){
            updateAvailable = true;
          }else if(parseInt(latestVersionList[1]) > parseInt(currentVersionList[1]) && parseInt(latestVersionList[0]) >= parseInt(currentVersionList[0])){
            updateAvailable = true;
          }else if(parseInt(latestVersionList[2]) > parseInt(currentVersionList[2]) && parseInt(latestVersionList[1]) >= parseInt(currentVersionList[1]) && parseInt(latestVersionList[0]) >= parseInt(currentVersionList[0])){
            updateAvailable = true;
          }

          if(updateAvailable){
              console.log("New update!")
              for(asset in response["assets"]){
                  if(response["assets"][asset]["name"].includes('AppImage')){
                      updateUrl = response["assets"][asset]["browser_download_url"]
                      break
                  }
              }
              console.log(updateUrl)
              mainWindow.webContents.send("updateAvailable", updateUrl)
          }else{
              console.log("No new update")
          }
      }
  }

  request.open("GET", "https://api.github.com/repos/HeadlessHamsterr/barsysteem2/releases/latest")
  request.send()
}

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.

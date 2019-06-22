const { app, BrowserWindow, ipcMain, Menu, MenuItem } = require('electron')
const fs = require('fs')
const path = require('path')
const compiler = require('./compiler')
let win

function createWindow () {
  win = new BrowserWindow({
    height: 720,
    width: 1280,
    webPreferences: {
      nodeIntegration: true
    }
  })
  const menu = new Menu()
  const fileMenu = new Menu()
  const viewMenu = new Menu()

  // submenus
  fileMenu.append(new MenuItem({ label: 'Exit', click () {app.quit()} }))

  viewMenu.append(new MenuItem({ label: 'Reload', role: 'reload' }))
  viewMenu.append(new MenuItem({ label: 'Force Reload', role: 'forcereload' }))
  viewMenu.append(new MenuItem({ label: 'Toggle Developer Tools', role: 'toggledevtools' }))
  viewMenu.append(new MenuItem({ type: 'separator' }))
  viewMenu.append(new MenuItem({ label: 'Actual Size', role: 'resetzoom' }))
  viewMenu.append(new MenuItem({ label: 'Zoom In', role: 'zoomin' }))
  viewMenu.append(new MenuItem({ label: 'Zoom Out', role: 'zoomout' }))
  viewMenu.append(new MenuItem({ type: 'separator' }))
  viewMenu.append(new MenuItem({ label: 'Toggle Full Screen', role: 'togglefullscreen' }))

  // main menu
  menu.append(new MenuItem({ label: 'File', type: 'submenu', submenu: fileMenu }))
  menu.append(new MenuItem({ label: 'View', type: 'submenu', submenu: viewMenu }))
  win.setMenu(menu)

  win.loadURL(`file://${__dirname}/index.html`)
}

app.on('ready', createWindow)
// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') app.quit()
})

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (win === null) createWindow()
})

ipcMain.on('add-path', (event, arg) => {
  let content = []
  if (fs.existsSync('paths.json')) content = JSON.parse(fs.readFileSync('paths.json').toString())
  content.push(arg)
  fs.writeFile('paths.json', JSON.stringify(content), (err) => {
    if (err) console.error(err)
  })
})

ipcMain.on('save', (event, arg) => {
  fs.writeFile(path.join(arg['path'], 'save.json'), JSON.stringify(arg['result']), err => {
    if (err) console.error(err)
  })
})

ipcMain.on('get-saved-content', (event, arg) => {
  const saveFile = path.join(arg, 'save.json')
  if (!fs.existsSync(saveFile)) {
    event.returnValue = {
      tracks: {},
      'auto-save': true,
      'time-signature': '4'
    }
    return
  }
  const savedContent = fs.readFileSync(path.join(arg, 'save.json')).toString()
  event.returnValue = savedContent !== '' ? JSON.parse(savedContent) : {
    tracks: {},
    'auto-save': true,
    'time-signature': '4'
  }
})

ipcMain.on('compile', (event, arg) => {
  event.returnValue = compiler(arg['path'], arg['result'])
})
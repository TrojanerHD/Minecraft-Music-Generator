import { app, BrowserWindow, Menu, MenuItem, ipcMain } from 'electron';
import * as path from 'path';
import IpcMessageHandler from './IpcMessageHandler';

type InstrumentType =
  | 'bass'
  | 'snare'
  | 'hat'
  | 'basedrum'
  | 'bell'
  | 'flute'
  | 'chime'
  | 'guitar'
  | 'xylophone'
  | 'iron_xylophone'
  | 'cow_bell'
  | 'didgeridoo'
  | 'bit'
  | 'banjo'
  | 'pling'
  | 'harp'
  | 'break';
type NoteType =
  | '1+1/2'
  | '1'
  | '3/4'
  | '1/2'
  | '3/8'
  | '1/4'
  | '3/16'
  | '1/8'
  | '3/64'
  | '1/16'
  | '3/64'
  | '1/32';
export type PitchType =
  | 'f♯'
  | 'g'
  | 'g♯'
  | 'a'
  | 'a♯'
  | 'b'
  | 'c'
  | 'c♯'
  | 'd'
  | 'd♯'
  | 'e'
  | 'f'
  | 'f♯+1';
export interface Note {
  instrument: InstrumentType;
  note: NoteType;
  octave: '1' | '2';
  pitch: PitchType;
  'same-beat': boolean;
};
export interface Result {
  'auto-save': boolean;
  speed: number;
  'time-signature': string;
  'track-names': {};
  tracks: Note[][];
  'music-folder': string
}

export default class Electron {
  private _win: BrowserWindow;

  constructor() {
    app.on('ready', this.createWindow.bind(this));
    app.on('window-all-closed', Electron.windowAllClosed);
    app.on('activate', this.activate.bind(this));
    new IpcMessageHandler(ipcMain);
  }

  private static windowAllClosed(): void {
    // On macOS it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') app.quit();
  }

  private createWindow(): void {
    this._win = new BrowserWindow({
      height: 720,
      width: 1280,
      webPreferences: {
        nodeIntegration: true
      }
    });
    this.addMenu();
    this._win
      .loadFile(path.join(__dirname, '..', 'client', 'index.html'))
      .catch(console.error);
  }

  private addMenu(): void {
    const menu = new Menu();
    const fileMenu = new Menu();
    const viewMenu = new Menu();

    // submenus
    fileMenu.append(
      new MenuItem({
        label: 'Exit',
        click() {
          app.quit();
        }
      })
    );

    viewMenu.append(new MenuItem({ label: 'Reload', role: 'reload' }));
    viewMenu.append(
      new MenuItem({ label: 'Force Reload', role: 'forcereload' })
    );
    viewMenu.append(
      new MenuItem({ label: 'Toggle Developer Tools', role: 'toggledevtools' })
    );
    viewMenu.append(new MenuItem({ type: 'separator' }));
    viewMenu.append(new MenuItem({ label: 'Actual Size', role: 'resetzoom' }));
    viewMenu.append(new MenuItem({ label: 'Zoom In', role: 'zoomin' }));
    viewMenu.append(new MenuItem({ label: 'Zoom Out', role: 'zoomout' }));
    viewMenu.append(new MenuItem({ type: 'separator' }));
    viewMenu.append(
      new MenuItem({ label: 'Toggle Full Sreen', role: 'togglefullscreen' })
    );

    // main menu
    menu.append(
      new MenuItem({ label: 'File', type: 'submenu', submenu: fileMenu })
    );
    menu.append(
      new MenuItem({ label: 'View', type: 'submenu', submenu: viewMenu })
    );
    this._win.setMenu(menu);
  }

  private activate(): void {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (this._win === null) this.createWindow();
  }
}

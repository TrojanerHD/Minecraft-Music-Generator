import * as fs from 'fs';
import {EventEmitter} from 'electron'
import * as path from 'path';
import Compiler from './Compiler';
import {Result} from './Electron';


export default class IpcMessageHandler {
    private _compiler: Compiler;
    constructor(ipcMain: EventEmitter) {
        ipcMain.on('add-path', IpcMessageHandler.addPath);
        ipcMain.on('save', IpcMessageHandler.save);
        ipcMain.on('get-saved-content', IpcMessageHandler.getSavedContent);
        ipcMain.on('compile', this.compile.bind(this))
    }

    private static addPath(arg: string): void {
        let content: string[] = [];
        if (fs.existsSync('paths.json')) content = JSON.parse(fs.readFileSync('paths.json').toString());
        content.push(arg);
        fs.writeFileSync('paths.json', JSON.stringify(content));
    }

    private static save(event: any, savePath: string, result: string): void {
        fs.writeFile(path.join(savePath, 'save.json'), JSON.stringify(result), err => {
            if (err) console.error(err);
        });
    }

    private static getSavedContent(event: any, arg: string, oldResult: Result): void {
        const saveFile = path.join(arg, 'save.json');
        if (!fs.existsSync(saveFile)) {
            event.returnValue = oldResult;
            return;
        }
        const savedContent = fs.readFileSync(saveFile).toString();
        event.returnValue = savedContent !== '' ? JSON.parse(savedContent) : oldResult;
    }

    private compile(event: any, path: string, result: Result): void {
        if(!this._compiler) this._compiler = new Compiler(result, path);
        else this._compiler.compile(result);
        event.returnValue = this._compiler._result;
    }
}
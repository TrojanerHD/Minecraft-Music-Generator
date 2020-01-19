import { Result, Note, PitchType } from './Electron';
import * as _ from 'lodash';
import * as fs from 'fs';
import * as path from 'path';
export default class Compiler {
  _result: Result;
  private _directory: string;

  constructor(result: Result, directory: string) {
    this._result = result;
    this._directory = directory;
    this.defaultResult();
    this.compile(result);
  }

  private static countFileUp(directory: string, count: number): string {
    const countPath: string = path.join(directory, count.toString());
    if (fs.existsSync(countPath))
      return Compiler.countFileUp(directory, ++count);
    fs.mkdirSync(countPath);
    return countPath;
  }

  private static pitchToDecimal(pitch: PitchType, octave: '1' | '2'): number {
    const fractionTop: 0 | -12 = octave === '2' ? 0 : -12;
    switch (pitch) {
      case 'f♯':
        return Math.pow(2, fractionTop / 12);
      case 'g':
        return Math.pow(2, (fractionTop + 1) / 12);
      case 'g♯':
        return Math.pow(2, (fractionTop + 2) / 12);
      case 'a':
        return Math.pow(2, (fractionTop + 3) / 12);
      case 'a♯':
        return Math.pow(2, (fractionTop + 4) / 12);
      case 'b':
        return Math.pow(2, (fractionTop + 5) / 12);
      case 'c':
        return Math.pow(2, (fractionTop + 6) / 12);
      case 'c♯':
        return Math.pow(2, (fractionTop + 7) / 12);
      case 'd':
        return Math.pow(2, (fractionTop + 8) / 12);
      case 'd♯':
        return Math.pow(2, (fractionTop + 9) / 12);
      case 'e':
        return Math.pow(2, (fractionTop + 10) / 12);
      case 'f':
        return Math.pow(2, (fractionTop + 11) / 12);
      case 'f♯+1':
        return Math.pow(2, (fractionTop + 12) / 12);
    }
  }

  private static generateNote(note: Note): string {
    return `execute as @a at @s run playsound minecraft:block.note_block.${
      note.instrument
    } block @s ~ ~ ~ 1.0 ${Compiler.pitchToDecimal(note.pitch, note.octave)}`;
  }

  private static save(functionPath: string, command: string): void {
    if (command !== '') {
      fs.writeFile(functionPath, command, (err: NodeJS.ErrnoException) => {
        if (err) console.error(err);
      });
    }
  }

  compile(result: Result): void {
    this._result = result;
    for (let i: number = 0; i < this._result.tracks.length; i++) {
      let noteCount: number = 0;
      let command: string = '';
      let functionPath: string;
      let totalNoteCount: number = this._result.tracks[i].length - 1;
      this._result.tracks[i].forEach((note: Note) => {
        if (note['same-beat']) totalNoteCount--;
      });
      this._result.tracks[i].forEach((note: Note) => {
        if (note['same-beat']) {
          command += `\n${Compiler.generateNote(note)}`;
          return;
        }
        Compiler.save(functionPath, command);
        command = '';
        const trackPath: string = path.join(this._directory, i.toString());
        if (!fs.existsSync(trackPath)) fs.mkdirSync(trackPath);
        if (note.instrument !== 'break') command += Compiler.generateNote(note);
        if (noteCount === 0 && i < this._result.tracks.length - 1)
          command += this.getNextTrack(trackPath);
        if (noteCount < totalNoteCount)
          command += this.getNextNote(note, noteCount, trackPath);
        functionPath = path.join(
          trackPath,
          `music${noteCount === 0 ? '' : noteCount}.mcfunction`
        );

        noteCount++;
      });
      Compiler.save(functionPath, command);
    }
  }

  private defaultResult(): void {
    if ('music-folder' in this._result && this._result['music-folder'] === '')
      delete this._result['music-folder'];
    _.defaultsDeep(this._result, {
      'music-folder': Compiler.countFileUp(this._directory, 0)
    });
    this._directory = this._result['music-folder'];
  }

  private getNextTrack(trackPath: string): string {
    return `\nfunction ${path.basename(
      path.join(this._directory, '..', '..')
    )}:${path.basename(this._directory)}/${path.basename(
      path.join(
        trackPath,
        '..',
        (parseInt(path.basename(trackPath)) + 1).toString()
      )
    )}/music`;
  }

  private getNextNote(
    note: Note,
    noteCount: number,
    trackPath: string
  ): string {
    const bps: number =
      (60 / this._result.speed) *
      parseInt(this._result['time-signature']) *
      eval(note.note);
    return `\nschedule function ${path.basename(
      path.join(this._directory, '..', '..')
    )}:${path.basename(this._directory)}/${path.basename(trackPath)}/music${
      noteCount + 1 === 0 ? '' : noteCount + 1
    } ${bps}s`;
  }
}

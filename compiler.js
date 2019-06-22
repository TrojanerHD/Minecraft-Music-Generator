const fs = require('fs')
const path = require('path')

module.exports = (mainDirectory, result) => {
  if (!('musicFolder' in result) || result['musicFolder'] === '') result['musicFolder'] = countFileUp(mainDirectory, 0)
  let directory = result['musicFolder']
  if (!('tracks' in result)) return result
  // track: last note
  const max = {}
  let lastTrack = 0
  Object.keys(result['tracks']).forEach(count => {
    max[count] = result['tracks'][count].length
    lastTrack++
  })
  let trackCount = 1
  Object.keys(result['tracks']).forEach(count => {
    let noteCount = 0
    let command = ''
    let functionPath = ''
    result['tracks'][count].forEach(note => {
      if (!note['same-beat'] && command !== '') {
        fs.writeFile(functionPath, command, err => {
          if (err) console.error(err)
        })
        command = ''
      }
      if (note['same-beat']) {
        command += `\nexecute as @a at @s run playsound minecraft:block.note_block.${note['instrument']} block @s ~ ~ ~ 1.0 ${pitchToDecimal(note['pitch'], note['octave'])}`
        return
      }
      const trackPath = path.join(directory, trackCount.toString())
      if (!fs.existsSync(trackPath)) fs.mkdirSync(trackPath)
      const bps = 60 / result['speed'] * parseInt(result['time-signature']) * eval(note['note'])
      if (note['instrument'] !== 'break')
        command += `execute as @a at @s run playsound minecraft:block.note_block.${note['instrument']} block @s ~ ~ ~ 1.0 ${pitchToDecimal(note['pitch'], note['octave'])}`
      if (noteCount === 0 && trackCount < lastTrack) command += `\nfunction ${path.basename(path.join(directory, '..', '..'))}:${path.basename(directory)}/${path.basename(path.join(trackPath, '..', (parseInt(path.basename(trackPath)) + 1).toString()))}/${'music'}`
      if (noteCount < max[count]) command += `\nschedule function ${path.basename(path.join(directory, '..', '..'))}:${path.basename(directory)}/${path.basename(trackPath)}/music${noteCount + 1 === 0 ? '' : noteCount + 1} ${bps}s`
      functionPath = path.join(trackPath, `music${noteCount === 0 ? '' : noteCount}.mcfunction`)

      noteCount++
    })
    if (command !== '') {
      fs.writeFile(functionPath, command, err => {
        if (err) console.error(err)
      })
      command = ''
    }
    trackCount++
  })
  return result
}

function countFileUp (directory, count) {
  const countPath = path.join(directory, count.toString())
  if (fs.existsSync(countPath)) return countFileUp(directory, ++count)
  fs.mkdirSync(countPath)
  return countPath
}

function pitchToDecimal (pitch, octave) {
  const fractionTop = parseInt(octave) === 2 ? 0 : -12
  switch (pitch) {
    case 'f#':
      return Math.pow(2, (fractionTop / 12))
    case 'g':
      return Math.pow(2, ((fractionTop + 1) / 12))
    case 'g#':
      return Math.pow(2, ((fractionTop + 2) / 12))
    case 'a':
      return Math.pow(2, ((fractionTop + 3) / 12))
    case 'a#':
      return Math.pow(2, ((fractionTop + 4) / 12))
    case 'b':
      return Math.pow(2, ((fractionTop + 5) / 12))
    case 'c':
      return Math.pow(2, ((fractionTop + 6) / 12))
    case 'c♯':
      return Math.pow(2, ((fractionTop + 7) / 12))
    case 'd':
      return Math.pow(2, ((fractionTop + 8) / 12))
    case 'd♯':
      return Math.pow(2, ((fractionTop + 9) / 12))
    case 'e':
      return Math.pow(2, ((fractionTop + 10) / 12))
    case 'f':
      return Math.pow(2, ((fractionTop + 11) / 12))
    case 'f♯+1':
      return Math.pow(2, ((fractionTop + 12) / 12))
  }
}
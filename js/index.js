const { ipcRenderer } = require('electron')
const $ = require('jquery')
let result = { tracks: {}, 'auto-save': true, 'time-signature': '4' }
let currentTrack = 1
let changes = false
let currentPath

$(() => {
  $('button#submit').on('click', () => {
    // result['tracks']['track']['note']
    // {[[[{note: 1},{note: 2}]]]}
    if (!(currentTrack in result['tracks'])) result['tracks'][currentTrack] = []
    result['tracks'][currentTrack].push({
      pitch: $('select#pitch').val(),
      instrument: $('select#instrument').val(),
      octave: $('select#octave').val(),
      note: $('select#note').val(),
      'same-beat': $('input#same-beat')[0].checked
    })
    updateResult()
  })

  const trackInput = $('input#track')
  autoGrowWidth(trackInput)
  trackInput.on({
    'change': () => {
      if (trackInput.val() < 1) trackInput.val(1)
      currentTrack = trackInput.val()
      updateTrack(trackInput)
    }, 'keyup': () => {
      if (trackInput.val() < 1) return
      currentTrack = trackInput.val()
      autoGrowWidth(trackInput)
      updateTrack(trackInput)
    }
  })
  $('button#next-track').on('click', () => {
    currentTrack++
    updateTrack(trackInput)
  })

  $('button#previous-track').on('click', () => {
    if (currentTrack > 1) {
      currentTrack--
      updateTrack(trackInput)
    }
  })

  const speedInput = $('input#speed')
  autoGrowWidth(speedInput)
  speedInput.on({
    'change': () => {
      if (speedInput.val() < 1) speedInput.val(1)
      updateSpeed(speedInput)
    }, 'keyup': () => {
      if (trackInput.val() < 1) return
      autoGrowWidth(speedInput)
      updateSpeed(speedInput)
    }
  })
  $('button#next-speed').on('click', () => {
    speedInput.val(parseInt(speedInput.val()) + 1)
    updateSpeed(speedInput)
  })

  $('button#previous-speed').on('click', () => {
    if (speedInput.val() > 1) {
      speedInput.val(parseInt(speedInput.val()) - 1)
      updateSpeed(speedInput)
    }
  })
  updateSpeed(speedInput)
  const directorySelection = $('input#directory-selection')
  directorySelection.on('change', () => {
    currentPath = directorySelection[0].files[0].path
    const oldResult = result
    result = ipcRenderer.sendSync('get-saved-content', currentPath)
    if (oldResult !== result) {
      updateResult()
      $('input#speed').val(result['speed'])
      autoSaveInput[0].checked = result['auto-save']
      autoSaveInput.change()
      return
    }
    save()
  })
  $('button#save-directory').on('click', () => ipcRenderer.send('add-path', directorySelection[0].files[0].path))
  const autoSaveInput = $('input#auto-save')
  const saveButton = $('button#save')

  autoSaveInput.on('change', () => {
    result['auto-save'] = autoSaveInput[0].checked
    if (result['auto-save'])
      saveButton.css('visibility', 'hidden')
    else
      saveButton.css('visibility', 'unset')
    updateResult()
  })
  saveButton.on('click', () => {
    saveButton.prop('disabled', 'disabled')
    save(true)
  })
  const timeSignature = $('input#time-signature')
  autoGrowWidth(timeSignature)
  timeSignature.val(result['time-signature'])
  timeSignature.on({
    'change': () => {
      if (parseInt(timeSignature.val()) > 1) timeSignature.val(1)
      updateResult()
    }, 'keyup': () => {
      autoGrowWidth(timeSignature)
    }
  })
  const copyToTrack = $('input#copy-to-track')
  autoGrowWidth(copyToTrack)
  copyToTrack.on({
    'change': () => {
      if (parseInt(copyToTrack.val()) > 1) timeSignature.val(1)
    }, 'keyup': () => {
      autoGrowWidth(copyToTrack)
    }
  })
  const copyFromTrack = $('input#copy-from-track')
  autoGrowWidth(copyFromTrack)
  copyFromTrack.on({
    'change': () => {
      if (parseInt(copyFromTrack.val()) > 1) timeSignature.val(1)
    }, 'keyup': () => {
      autoGrowWidth(copyFromTrack)
    }
  })
  const copyTrackButton = $('button#submit-copy-track')
  copyTrackButton.on('click', () => {
    const newTrack = JSON.parse(JSON.stringify(result['tracks'][copyFromTrack.val()]))
    newTrack.forEach(note => note['instrument'] = 'pause')
    result['tracks'][copyToTrack.val()] = newTrack

    updateResult()
  })
})

/*
function autoGrow (element) {
  element.css('height', '5px')
  element.css('height', `${element.prop('scrollHeight')}px`)
}
*/

function autoGrowWidth (element) {
  element.css('width', `${(element.val().length + 2) * 8}px`)
}

function updateResult (itShouldSave = true) {
  const resultDiv = $('div#result')
  let resultText = ''
  Object.keys(result['tracks']).forEach(trackArray => {
      let count = 0
      result['tracks'][trackArray].forEach(note => {
        resultText += `<div>${note['instrument'] === 'break' ? `Break, Note: ${note['note']}, Track: ${parseInt(trackArray)}` : `Track: ${[parseInt(trackArray)]}, Instrument: ${note['instrument']}, Octave: ${note['octave']}, Pitch: ${note['pitch'].toUpperCase()}, Note: ${note['note']}${note['same-beat'] ? ', Same Beat' : ''}`}</div> <i class="fas fa-trash-alt" onclick="deleteEntry(${count}, parseInt(${trackArray}))"></i><br/>`
        count++
      })
    }
  )

  result['time-signature'] = $('input#time-signature').val()

  resultDiv.html(`${resultText}`)
  changes = true
  $('button#save').prop('disabled', '')
  if (itShouldSave) save()
}

function updateTrack (trackInput) {
  trackInput.val(currentTrack)
  trackInput.css('width', `${(trackInput.val().length + 2) * 8}px`)
}

function updateSpeed (speedInput) {
  result['speed'] = speedInput.val()
  updateResult()
}

function save (manually) {
  if (!currentPath || (!result['auto-save'] && !manually)) {
    $('button#save').prop('disabled', '')
    return
  }
  ipcRenderer.send('save', {
    path: currentPath,
    result
  })
  compile()
}

function compile () {
  result = ipcRenderer.sendSync('compile', {
    path: currentPath,
    result
  })
  updateResult(false)
}

// noinspection JSUnusedLocalSymbols
function deleteEntry (count, track) {
  console.log(track)
  let noteCount = 0
  result['tracks'][track].forEach(() => {
    noteCount++
    if (noteCount === count + 1) {
      result['tracks'][track].splice(count, 1)
      if (result['tracks'][track].length === 0) delete result['tracks'][track]
    }
  })
  updateResult()
}
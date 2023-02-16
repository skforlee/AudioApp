

function onUploadSFXInputChange(evt) {
    const input = evt.target
    if (input.value == '') return

    const files = arrayFromObjectWithNumberKeys(input.files)    // The "input.files" object is NOT an array; it's just a dumb object with keys as 0, 1, 2, etc

    NodeCB.saveAudioFilesToLibrary(files, () => {
        for (const file of files) {
            const fileName = file.name
            if (doesSoundExistInLibraryDiv(fileName) == false) {
                createLibraryItemDom({ name: fileName })
            }
        }
    })

}

function onUploadSFXClick(evt) {

}

function onBigButtonClick(evt) {
    const button = evt.target
    const audioName = button.querySelector('h2').innerText
    if (audioName == '[Empty]')
        return
    playAudioFromLibrary(audioName)
}

function onNewSetClick(evt) {
    const newSetName = NodeCB.getFirstAvailableSetName()
    createSavedSetDom({ name: newSetName })
    NodeCB.createSavedSetFolder(newSetName)
}

function onSearchChange(newValue) {
    newValue = newValue.trim()
    const inputs = queryAll('#libraryItems li input')

    // If search is clear
    if (newValue.length == 0) {
        for (const input of inputs) {
            const li = input.parentNode
            li.classList.remove('hidden')
        }
        return
    }

    // Otherwise
    for (const input of inputs) {
        const li = input.parentNode
        // Hide all
        if (li.classList.contains('hidden') == false) {
            li.classList.add('hidden')
        }
        // Show only what's necessary
        if (input.value.includes(newValue)) {
            li.classList.remove('hidden')
        }
    }
}







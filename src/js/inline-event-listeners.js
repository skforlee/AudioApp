

function onUploadSFXInputChange(evt) {
    const input = evt.target
    if (input.value == '') return

    const files = arrayFromObjectWithNumberKeys(input.files)    // The "input.files" object is NOT an array; it's just a dumb object with keys as 0, 1, 2, etc
    console.log(files)

    NodeCB.saveAudioFilesToLibrary(files, () => {
        for (const file of files) {
            const fileName = file.name
            if (doesSoundExistInLibraryDiv(fileName) == false) {
                createLibraryItem({ name: fileName })
            }
        }
    })

}

function onUploadSFXClick(evt) {

}

function onBigButtonClick(evt) {
    const button = evt.target
    const audioName = button.querySelector('h2').innerText
    NodeCB.playAudioFromLibrary(audioName)
}

function onNewSetClick(evt) {
    const newSetName = NodeCB.getFirstAvailableSetName()
    createSavedSet({ name: newSetName })
}
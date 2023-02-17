

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


function showHideSortLib() {
    var lib = document.getElementById("sort-sfx").nextElementSibling;
    lib.classList.toggle("showHideSort");
}
function showHideSortSets() {
    var sets = document.getElementById("sort-sets").nextElementSibling;
    sets.classList.toggle("showHideSort");
}




const getLibraryLiInputValue = (li) => li.children[1].value
function sortLibraryAZ() {
    const ul = query('#libraryItems')
    sortChildren(ul, (a, b) => {
        return getLibraryLiInputValue(a) > getLibraryLiInputValue(b) ? 1 : -1
    })
}
function sortLibraryZA() {
    const ul = query('#libraryItems')
    sortChildren(ul, (a, b) => {
        return getLibraryLiInputValue(a) < getLibraryLiInputValue(b) ? 1 : -1
    })
}
function sortLibraryNewest() {
    const ul = query('#libraryItems')
    const audioAges = NodeCB.getAllFilesInFolderNameKeyTimestampValue('library')
    sortChildren(ul, (a, b) => {
        return audioAges[getLibraryLiInputValue(a)] < audioAges[getLibraryLiInputValue(b)] ? 1 : -1
    })
}
function sortLibraryOldest() {
    console.log('Go?')
    const ul = query('#libraryItems')
    const audioAges = NodeCB.getAllFilesInFolderNameKeyTimestampValue('library')
    console.log(audioAges)
    sortChildren(ul, (a, b) => {
        return audioAges[getLibraryLiInputValue(a)] > audioAges[getLibraryLiInputValue(b)] ? 1 : -1
    })
}


const getSetLiName = li => li.children[0].children[0].children[1].innerText
function sortSetsAZ() {
    const ul = query('#setsList')
    sortChildren(ul, (a, b) => {
        return getSetLiName(a) > getSetLiName(b) ? 1 : -1
    })
}
function sortSetsZA() {
    const ul = query('#setsList')
    sortChildren(ul, (a, b) => {
        return getSetLiName(a) < getSetLiName(b) ? 1 : -1
    })
}
function sortSetsNewest() {
    const ul = query('#setsList')
    const setAges = NodeCB.getAllFilesInFolderNameKeyTimestampValue('sets')
    sortChildren(ul, (a, b) => {
        return setAges[getSetLiName(a)] < setAges[getSetLiName(b)] ? 1 : -1
    })
}
function sortSetsOldest() {
    const ul = query('#setsList')
    const setAges = NodeCB.getAllFilesInFolderNameKeyTimestampValue('sets')
    sortChildren(ul, (a, b) => {
        return setAges[getSetLiName(a)] > setAges[getSetLiName(b)] ? 1 : -1
    })
}



/* sort a to z */
function sortAtoZ() {
    var list, i, switching, b, shouldSwitch;
    list = document.getElementById("libraryItems");
    switching = true;
    while (switching) {
        switching = false;
        b = list.getElementsByTagName("li");
        for (i = 0; i < (b.length - 1); i++) {
            shouldSwitch = false;
            if (b[i].innerHTML.toLowerCase() > b[i + 1].innerHTML.toLowerCase()) {
                shouldSwitch = true;
                break;
            }
        }
        if (shouldSwitch) {
            b[i].parentNode.insertBefore(b[i + 1], b[i]);
            switching = true;
        }
    }
}

/* sort z to a */
function sortZtoA() {
    var list, i, switching, b, shouldSwitch;
    list = document.getElementById("libraryItems");
    switching = true;
    while (switching) {
        switching = false;
        b = list.getElementsByTagName("li");
        for (i = 0; i < (b.length - 1); i++) {
            shouldSwitch = false;
            if (b[i].innerHTML.toLowerCase() < b[i + 1].innerHTML.toLowerCase()) {
                shouldSwitch = true;
                break;
            }
        }
        if (shouldSwitch) {
            b[i].parentNode.insertBefore(b[i + 1], b[i]);
            switching = true;
        }
    }
}
/* show-hide sort options */








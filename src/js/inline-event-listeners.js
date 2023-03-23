
function onSetNameInputClick(evt) {
    const input = evt.target
    input.setAttribute('data-old-value', input.value)
    input.select()
}
function onSetNameInputChange(evt) {
    const input = evt.target
    if (input.value.trim().length == 0) {
        input.value = input.getAttribute('data-old-value')
        return
    }
    renameSet(input.value)
}

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

function getBigButonParent(eventTarget) {
    console.log(eventTarget)
    while (eventTarget.classList.contains('deviceButton') == false) {
        eventTarget = eventTarget.parentNode
    }
    return eventTarget
}
// Also, take note that there is another event listener on buttons that removes deviceButton--active when dragging the name!
function onBigButtonMouseDown(evt) {
    if (evt.buttons != 1) return                       // Left click only
    const button = getBigButonParent(evt.target)       // Click event might trigger on a child; we play the animation on the big button, not on the h2 or some other element
    console.log({button})
    console.log('A')
    button.classList.add('deviceButton--active')
}
function onBigButtonMouseUp(evt) {
    console.log('O')
    const button = getBigButonParent(evt.target)
    button.classList.remove('deviceButton--active')
}
function onBigButtonMouseOut(evt) {
    if (evt.target.classList.contains('deviceButton') == false) return  // Only allow on exiting the real big button
    evt.target.classList.remove('deviceButton--active')
}
function onBigButtonClick(evt) {
    const button = getBigButonParent(evt.target)
    const audioName = button.querySelector('h2').innerText
    if (audioName == '[Empty]')
        return
    stopAudio(audioName)
    playAudioFromLibrary(audioName)
}

function onNewSetClick(evt) {
    const newSetName = NodeCB.getFirstAvailableSetName()
    createSavedSetDom({ name: newSetName })
    NodeCB.createSavedSetFolder(newSetName)
}

function onSetsSearchChange(newValue) {
    newValue = newValue.trim()
    const h2s = queryAll('#setsList .setTitle h2')
    const getSetDomByH2 = h2 => h2.parentNode.parentNode.parentNode

    maybeToggleClearSearchButtons()

    // If search is clear
    if (newValue.length == 0) {
        for (const h2 of h2s) {
            const li = getSetDomByH2(h2)
            li.classList.remove('hidden')
        }
        return
    }

    // Otherwise
    for (const h2 of h2s) {
        const li = getSetDomByH2(h2)
        // Hide all
        if (li.classList.contains('hidden') == false) {
            li.classList.add('hidden')
        }
        // Show only what's necessary
        if (h2.innerText.includes(newValue)) {
            li.classList.remove('hidden')
        }
    }
    
}
function onLibrarySearchChange(newValue) {
    newValue = newValue.trim()
    const inputs = queryAll('#libraryItems li input')

    maybeToggleClearSearchButtons()

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


function showHideSortLib(evt) {    
    evt.stopPropagation()   // Stop propagation to window.click = close all menus
    const lib = document.getElementById("sort-sfx").nextElementSibling;
    const isOpen = lib.classList.contains('showHideSort')
    hideAllMenus()
    if (isOpen == false) {
        lib.classList.add("showHideSort")
    }
}
function showHideSortSets(evt) {
    evt.stopPropagation()   // Stop propagation to window.click = close all menus
    const sets = document.getElementById("sort-sets").nextElementSibling
    const isOpen = sets.classList.contains('showHideSort')
    hideAllMenus()
    if (isOpen == false) {
        sets.classList.add("showHideSort")
    }
}
function toggleFileMenu(evt) {
    evt.stopPropagation()
    const dropdown = query('#menuBarFileDropdown')
    const isVisible = dropdown.classList.contains('visible')
    hideAllMenus()
    if (isVisible) {
        dropdown.classList.remove('visible')
    } else {
        dropdown.classList.add('visible')
    }
}
function toggleHelpMenu(evt) {
    evt.stopPropagation()
    const dropdown = query('#menuBarHelpDropdown')
    const isVisible = dropdown.classList.contains('visible')
    hideAllMenus()
    if (isVisible) {
        dropdown.classList.remove('visible')
    } else {
        dropdown.classList.add('visible')
    }
}
function hideAllMenus() {
    function hideAllSortMenus() {
        var lib = document.getElementById("sort-sfx").nextElementSibling;
        var sets = document.getElementById("sort-sets").nextElementSibling
        lib.classList.remove('showHideSort')
        sets.classList.remove('showHideSort')
    }
    function hideAllBarMenus() {
        queryAll('.menuItemContent').forEach(ul => {
            ul.classList.remove('visible')
        })
    }
    hideAllBarMenus()
    hideAllSortMenus()
    hideAllContextMenus()
}
function openDialog(dialogId, evt) {
    const dialog = query('#' + dialogId)
    dialog.style.display = 'flex'
    hideAllMenus()
    if (evt != null)
        evt.stopPropagation()
}
function closeAllDialogs() {
    queryAll('dialog').forEach(dialog => {
        dialog.style.display = 'none'
    })
}



const getLibraryLiInputValue = (li) => li.children[1].value.toLowerCase()
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
    const ul = query('#libraryItems')
    const audioAges = NodeCB.getAllFilesInFolderNameKeyTimestampValue('library')
    sortChildren(ul, (a, b) => {
        return audioAges[getLibraryLiInputValue(a)] > audioAges[getLibraryLiInputValue(b)] ? 1 : -1
    })
}


const getSetLiName = li => li.children[0].children[0].children[1].innerText.toLowerCase()
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

function maybeToggleClearSearchButtons() {
    function maybeToggleCSB(button) {
        const input = button.parentNode.querySelector('input')
        if (input.value.length == 0) {
            button.classList.add('hidden')
        } else {
            button.classList.remove('hidden')
        }
    }
    maybeToggleCSB(query('#sfxLibrary .clearSearchButton'))
    maybeToggleCSB(query('#savedSets .clearSearchButton'))
}
function clearAfferentSearchInput(evt) {
    const input = evt.target.parentNode.querySelector('input')
    input.value = ''
    input.oninput()
}


let thingToDeleteType = null
function onDeleteSetClick(evt) {
    evt.stopPropagation()
    hideAllMenus()
    const thingName = elementJustRightClicked.querySelector('.setTitle h2').innerText
    openConfirmDeleteDialog(thingName, 'set')
}
function onDeleteLibraryItemClick(evt) {
    evt.stopPropagation()
    hideAllMenus()
    const thingName = elementJustRightClicked.querySelector('input').value
    openConfirmDeleteDialog(thingName, 'audio')
}
function onDeleteFavoriteClick(evt) {
    evt.stopPropagation()
    hideAllMenus()
    const thingName = elementJustRightClicked.querySelector('h2').innerText
    openConfirmDeleteDialog(thingName, 'favorite')
}
function openConfirmDeleteDialog(thingName, thingType) {
    thingToDeleteType = thingType
    query('#deleteName').innerText = thingToDeleteType + ' ' + thingName
    query('#confirmDeleteButton').innerText = thingToDeleteType == 'favorite'?
        'Remove' : 'Delete'
    openDialog('deleteAreYouSure')
}
function confirmDelete(evt) {
    evt.stopPropagation()
    switch (thingToDeleteType) {
        case 'set': deleteSetByLi(elementJustRightClicked); break
        case 'audio': deleteLibraryAudioByLi(elementJustRightClicked); break
        case 'favorite': deleteFavoriteSetByLi(elementJustRightClicked); break
    }
    thingToDeleteType = null
    closeAllDialogs()
}
function cancelDelete(evt) {
    evt.stopPropagation()
    thingToDeleteType = null
    closeAllDialogs()
}






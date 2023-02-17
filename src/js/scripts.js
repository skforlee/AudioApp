
function loadLibraryAudios() {
    removeAllChildren(query('#libraryItems'))
    const allAudioNames = NodeCB.getAllLibraryAudioNames()
    for (const audioName of allAudioNames) {
        createLibraryItemDom({ name: audioName })
    }
}
function loadSavedSets() {
    removeAllChildren(query('#setsList'))
    const allSavedSetsData = NodeCB.getAllSavedSetsWithAudiosData()
    for (const setData of allSavedSetsData) {
        createSavedSetDom({
            name: setData.setName,
            items: setData.audioNames,
            isFavorited: NodeCB.isSetFavorite(setData.setName)
        })
    }
}
function loadFavoriteSets() {
    removeAllChildren(query('#favoritesListSets'))
    const allFavoriteSetNames = NodeCB.getAllFavoriteSetNamesNullIfEmpty()
    fillArrayUntilLength(allFavoriteSetNames, null, 6)
    for (const setName of allFavoriteSetNames) {
        if (setName != null) {
            createFavoriteSetItem({ name: setName, isEmpty: false })
        } else {
            createFavoriteSetItem({ isEmpty: true })
        }
    }
}



function setupButtonSwapping() {
    const the6Buttons = Array.from(document.querySelectorAll('.buttonInfo'))
    the6Buttons.forEach(smallButton => {
        onElementDraggedToQueryAll(smallButton, '.deviceButton', (deviceButton) => {
            swapButtons(smallButton, deviceButton.querySelector('.buttonInfo'))
        })
    })
}
function setupButtonContextMenus() {
    const the6Buttons = Array.from(document.querySelectorAll('.deviceButton'))
    the6Buttons.forEach(button => {
        onRightClickContextMenu(button, 'buttonContextMenu')
    })
}
function setupClosingContextMenus() {
    window.addEventListener('click', () => {
        hideAllContextMenus()
    })
}


document.addEventListener('DOMContentLoaded', () => {
    loadLibraryAudios()
    loadSavedSets()
    loadFavoriteSets()

    setupButtonSwapping()
    setupButtonContextMenus()

    setupClosingContextMenus()

    if (getAnySetName() == null) {
        onNewSetClick()
    }

    makeSetActive(getAnySetName())
})












// window.onclick = function(event) {
//     if (!event.target.matches('.sortButton')) {
//         var dropdowns = document.getElementsByClassName("sortOptions");
//         var i;
//         for (i = 0; i < dropdowns.length; i++) {
//             var openDropdown = dropdowns[i];
//             if (openDropdown.classList.contains('showHideSort')) {
//                 openDropdown.classList.remove('showHideSort');
//             }
//         }
//     }
// }

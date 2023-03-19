
// This script contains code for setting up the page
// E.g. window listeners, on-load, loading items, etc

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
    const the6ButtonTitles = queryAll('.buttonInfo')
    the6ButtonTitles.forEach(smallButton => {
        
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
    window.addEventListener('click', () => { hideAllContextMenus() })
    onEscapeKeyPress(hideAllContextMenus)
}
function setupClosingMenuBarMenus() {
    function _closeMenuBars() {
        console.log('asdasdad')
        hideAllMenus()
    }
    window.addEventListener('click', _closeMenuBars)
    onEscapeKeyPress(_closeMenuBars)
}
function setupClosingDialogs() {
    window.addEventListener('click', closeAllDialogs)
    onEscapeKeyPress(closeAllDialogs)
}
function setupButtonsDropOverAnimation() {
    function isElementBeingDraggedALibraryItemOrButton() {
        return dragState.elementBeingDragged.classList.contains('libraryItem') || dragState.elementBeingDragged.classList.contains('buttonInfo')
    }
    const the6DeviceButtons = queryAll('.deviceButton')
    the6DeviceButtons.forEach(button => {
        const smallButton = button.querySelector('.buttonInfo')
        markAsCustomDragDropReceiver(button, {
            onDragEnter: function(evt) {
                console.log(dragState.elementBeingDragged)
                console.log(dragState.elementBeingDragged.classList.contains('buttonInfo'))
                if (isElementBeingDraggedALibraryItemOrButton()) {
                    console.log('Yashur')
                    smallButton.classList.add('placeholder-marked-blue')
                }
            },
            onDragLeave: function(evt) {
                smallButton.classList.remove('placeholder-marked-blue')
            },
            onDrop: function(evt) {
                smallButton.classList.remove('placeholder-marked-blue')
            }
        })
    })
}

function _resetFavoriteDragDropAnimation() {
    queryAll('#favoritesListSets li').forEach(li => {
        _resetFavoriteDragDropAnimationForLi(li)
    })
}
function setupEachFavoriteDropOverAnimation() {
    const favoriteLis = queryAll('#favoritesListSets li')
    console.log({favoriteLis})
    for (const favoriteLi of favoriteLis) {
        console.log('At dis')
        
    }
}
function setupFavoritesDropOverAnimation() {
    
    markAsCustomDragDropReceiver(query('#favoritesListSets'), {
        onDragEnter: function() {
            if (_isElementBeingDraggedASavedSet() == false)
                return
            if (isThereAnEmptySlotInFavorites() == false)
                return
            const currentSetName = dragState.elementBeingDragged.querySelector('.setTitle h2').innerText
            const emptyFav = getAnyEmptyFavoriteSet()
            emptyFav.querySelector('.fileFolder').classList.add('placeholder-marked-blue')
            emptyFav.querySelector('h2').innerText = currentSetName
        },
        onDragLeave: function() {
            console.log('Lefto')
            _resetFavoriteDragDropAnimation()
        },
        onDrop: function() {
            console.log('Lefta')
            _resetFavoriteDragDropAnimation()
        }
    })
}


// Order is important
document.addEventListener('DOMContentLoaded', () => {

    NodeCB.initFolders()            // Creates 'sets', 'library', etc if they don't exist

    setupButtonSwapping()
    setupButtonContextMenus()

    setupClosingContextMenus()
    setupClosingMenuBarMenus()

    setupClosingDialogs()

    loadLibraryAudios()
    loadSavedSets()
    loadFavoriteSets()

    // setupFavoritesDropOverAnimation()
    setupEachFavoriteDropOverAnimation()
    setupButtonsDropOverAnimation()

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

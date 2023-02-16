
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
    const allFavoriteSetNames = NodeCB.getAllFavoriteSetNames()
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
            const thisName = smallButton.querySelector('h2').innerText
            const thatName = deviceButton.querySelector('h2').innerText
            deviceButton.querySelector('h2').innerText = thisName
            smallButton.querySelector('h2').innerText = thatName
            console.log(getButtonsAudioNamesNullIfEmpty())
            updateSavedSetItemsInDomAndFiles(getCurrentlyActiveSetName(), getButtonsAudioNamesNullIfEmpty())
        })
    })
}


document.addEventListener('DOMContentLoaded', () => {
    loadLibraryAudios()
    loadSavedSets()
    loadFavoriteSets()

    setupButtonSwapping()

    if (getAnySetName() == null) {
        onNewSetClick()
    }

    makeSetActive(getAnySetName())
})















/* show/hide set sfx */
// var acc = document.getElementsByClassName("dropdown-icon");
// var i;

// for (i = 0; i < acc.length; i++) {
//     acc[i].addEventListener("click", function() {
//         this.parentElement.parentElement.parentElement.classList.toggle("shown");
        
//     });
// }

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
function showHideSortLib() {
    var lib = document.getElementById("sort-sfx").nextElementSibling;
    lib.classList.toggle("showHideSort");
}
function showHideSortSets() {
    var sets = document.getElementById("sort-sets").nextElementSibling;
    sets.classList.toggle("showHideSort");
}
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

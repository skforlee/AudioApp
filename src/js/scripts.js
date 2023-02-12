
function setupButtonSwapping() {
    const the6Buttons = Array.from(document.querySelectorAll('.buttonInfo'))
    the6Buttons.forEach(smallButton => {
        onElementDraggedToAllQuery(smallButton, '.deviceButton', (deviceButton) => {
            const thisName = smallButton.querySelector('h2').innerText
            const thatName = deviceButton.querySelector('h2').innerText
            deviceButton.querySelector('h2').innerText = thisName
            smallButton.querySelector('h2').innerText = thatName
        })
    })
}


document.addEventListener('DOMContentLoaded', () => {
    createLibraryItem({ name: 'SFX-1' })
    createLibraryItem({ name: 'SFX-2' })
    createLibraryItem({ name: 'SFX-3' })
    createLibraryItem({ name: 'SFX-4' })

    createSavedSet({ name: "Audio Set 1", items: ["[Empty]", "[Empty]", "[Empty]", "[Empty]", "[Empty]", "[Empty]"] })
    createSavedSet({ name: "Audio Set 2", isActive: true, isFavorited: true, items: ["[Empty]", "[Empty]", "[Empty]", "[Empty]", "[Empty]", "[Empty]"] })
    createSavedSet({ name: "Audio Set 7", isFavorited: true, items: ["[Empty]", "[Empty]", "[Empty]", "[Empty]", "[Empty]", "[Empty]"] })
    createSavedSet({ name: "Audio Set 4", items: ["[Empty]", "[Empty]", "[Empty]", "[Empty]", "[Empty]", "[Empty]"] })

    createFavoriteSetItem({ name: 'Audio Set 1' })
    createFavoriteSetItem({ isEmpty: true })
    createFavoriteSetItem({ isEmpty: true })
    createFavoriteSetItem({ name: 'Audio Set 4' })
    createFavoriteSetItem({ isEmpty: true })
    createFavoriteSetItem({ isEmpty: true })

    setupButtonSwapping()
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

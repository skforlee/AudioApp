// Library
function doesSoundExistInLibraryDiv(audioName) {
    return getLibraryAudioLi(audioName) != null
}
function getLibraryAudioLi(audioName) {
    const items = queryAll('#libraryItems li')
    const foundItems = items.filter(item => item.querySelector('input').value == audioName)
    if (foundItems.length > 0)
        return foundItems[0]
    return null
}


// Favorites
function isThereAnEmptySlotInFavorites() {
    const ul = document.querySelector('#favoritesListSets')
    const lis = Array.from(ul.children)
    const emptyExists = lis.some(li => li.querySelector('h2').classList.contains('empty'))
    return emptyExists
}
function doesFavoriteSetExist(name) {
    const ul = document.querySelector('#favoritesListSets')
    const lis = Array.from(ul.children)
    const setExists = lis.some(li => li.querySelector('h2').innerHTML == name)
    return setExists
}
function getAnyEmptyFavoriteSet() {
    if (isThereAnEmptySlotInFavorites() == false)
        return null
    const ul = document.querySelector('#favoritesListSets')
    const lis = Array.from(ul.children)
    const emptyLis = lis.filter(li => li.querySelector('h2').classList.contains('empty'))
    return emptyLis[0]
}
function removeAnyEmptyFavoriteSet() {
    if (isThereAnEmptySlotInFavorites() == false)
        return false
    const emptyLi = getAnyEmptyFavoriteSet()
    emptyLi.remove()
    return true
}
function getFavoriteSetWithNameLi(setName) {
    const lis = queryAll('#favoritesListSets li')
    console.log({lis})
    for (const li of lis) {
        console.log(li.querySelector('h2').innerText)
        if (li.querySelector('h2').innerText == setName) {
            return li
        }
    }
    return null
}
function getAnySetName() {
    const h2s = queryAll('#setsList li .setTitle h2')
    if (h2s.length == 0) return null
    return h2s[0].innerText
}
function tryMakeSetFavorite(setName) {
    if (doesFavoriteSetExist(setName))
        return
    if (isThereAnEmptySlotInFavorites() == false)
        return
    const anyEmptySlot = getAnyEmptyFavoriteSet()
    const newFavoriteSet = createFavoriteSetItem({ name: setName })
    anyEmptySlot.replaceWith(newFavoriteSet)
    markSavedSetAsFavorite(setName)
    NodeCB.createFavoriteSetFolderAsShortcut(setName)
}


// Saved Sets
function updateSlotInSavedSet(savedSetName, slotName, audioName) {
    const li = getSavedSetAudioDom(savedSetName, slotName)
    li.querySelector('h2').innerText = audioName
}
function replaceEmptySlotInSavedSetWithAudio(savedSetName, audioName) {
    updateSlotInSavedSet(savedSetName, '[Empty]', audioName)
}
function markSavedSetAsFavorite(setName) {
    const savedSet = getSavedSetWithNameDom(setName)
    savedSet.classList.toggle('favorited')
}
function doesSavedSetHaveAudio(savedSetName, audioName) {
    return getSavedSetAudioDom(savedSetName, audioName) != null
}
function doesSavedSetHaveEmptySlot(savedSetName) {
    if (doesSavedSetHaveAudio(savedSetName, '[Empty]')) return true
    return false
}
function doesSavedSetDOMHaveEmptySlot(savedSetDom) {
    const h2s = Array.from(savedSetDom.querySelectorAll('.setListSfxs li h2'))
    return h2s.some(h2 => h2.innerText == '[Empty]')
}
function updateSavedSetItemsInDomAndFiles(savedSetName, newItems) {
    const savedSetLi = getSavedSetWithNameDom(savedSetName)
    const audioH2s = savedSetLi.querySelectorAll('.setListSfxs h2')
    for (let i = 0; i <= 5; i++) {
        if (newItems[i] == null) {
            audioH2s[i].innerText = '[Empty]'
            audioH2s[i].classList.add('empty')
        } else {
            audioH2s[i].innerText = newItems[i]
            audioH2s[i].classList.remove('empty')
        }
    }
    console.log(`Updating set ${savedSetName} with items ${newItems.join(', ')}`)
    NodeCB.updateSavedSetAudioShortcuts(savedSetName, newItems)
}
function makeSetActive(setName) {
    // Make it look pink
    const savedSetsLis = queryAll('#setsList .savedSetsSet')
    const favoriteSetsLis = queryAll('#favoritesListSets li')
    for (const li of savedSetsLis)    li.classList.remove('active')
    for (const li of favoriteSetsLis) li.classList.remove('active')

    const savedSetLi = savedSetsLis.filter(li => li.querySelector('.setTitle h2').innerText == setName)[0]
    savedSetLi.classList.add('active')

    // Update buttons
    const audioNames = NodeCB.getSavedSetAudioNames(setName)
    console.log(`For set ${setName}`)
    console.log({audioNames})
    for (let i = 0; i <= 5; i++) {
        const thisButton = query(`#button${i + 1}`)
        if (audioNames[i] != null) {
            thisButton.querySelector('h2').innerText = audioNames[i]
        } else {
            thisButton.querySelector('h2').innerText = '[Empty]'
        }
    }

    // Update name in the big panel
    query('#setNameInput').value = setName

}
function renameSet(newSetName) {
    const activeSetLi = getCurrentlyActiveSetLi()
    const oldSetName = activeSetLi.querySelector('.setTitle h2').innerText

    // Update name in saved sets UI
    activeSetLi.querySelector('.setTitle h2').innerText = newSetName

    // Rename set in folder
    NodeCB.renameSavedSetFolder(oldSetName, newSetName)

    // Update name in favorites UI
    const favoriteLi = getFavoriteSetWithNameLi(oldSetName)
    if (favoriteLi != null) {
        favoriteLi.querySelector('h2').innerText = newSetName

        // Rename favorite shortcut in folder
        NodeCB.renameFavoriteSetShortcutFolder(oldSetName, newSetName)
    }
}
function tryAddSoundFromLibraryToSet(audioName, savedSetName) {
    if (doesSavedSetHaveAudio(savedSetName, audioName))
        return
    if (doesSavedSetHaveEmptySlot(savedSetName) == false)
        return
    replaceEmptySlotInSavedSetWithAudio(savedSetName, audioName)
    const audioIndex = getAudioIndexInSet(savedSetName, audioName)
    console.log({audioIndex})
    NodeCB.createAudioShortcutInSetFolder(savedSetName, audioName, audioIndex)
}
function getAudioIndexInSet(savedSetName, audioName) {
    const audioLis = getSavedSetWithNameDom(savedSetName).querySelectorAll('.setListSfxs li')
    for (let i = 0; i < audioLis.length; i++) {
        if (audioLis[i].querySelector('h2').innerText == audioName)
            return i
    }
    return null
}
function getSavedSetWithNameDom(savedSetName) {
    const savedSets = Array.from(document.querySelectorAll('.savedSetsSet'))
    for (const savedSet of savedSets) {
        if (savedSet.querySelector('.setTitle h2').innerText == savedSetName)
            return savedSet
    }
    return null
}
function getSavedSetAudioDom(savedSetName, audioName) {
    const savedSetLi = getSavedSetWithNameDom(savedSetName)
    if (savedSetLi == null) throw `No saved set found with name ${savedSetName}`

    const soundsInThisSet = Array.from(savedSetLi.querySelectorAll('.setListSfxs li'))
    for (const sound of soundsInThisSet) {
        if (sound.querySelector('h2').innerText == audioName) {
            return sound
        }
    }
    return null
}
function getCurrentlyActiveSetLi() {
    const savedSetsLis = queryAll('#setsList .savedSetsSet.active')
    if (savedSetsLis.length == 0)
        return null
    return savedSetsLis[0]
}
function getCurrentlyActiveSetName() {
    const activeSetLi = getCurrentlyActiveSetLi()
    if (activeSetLi == null) return null
    return activeSetLi.querySelector('.setTitle h2').innerText
}
function getButtonsAudioNamesNullIfEmpty() {
    return queryAll('.buttonInfo h2').map(h2 => h2.innerText == '[Empty]'? null: h2.innerText)
}


// Other
function showFullSetIndicators() {
    const setLis = queryAll('#setsList > li')
    for (const li of setLis) {
        if (doesSavedSetDOMHaveEmptySlot(li) == false) {
            li.querySelector('.setTitle h2').classList.add('set-h2-full')
        }
    }
}
function hideFullSetIndicators() {
    const setLis = queryAll('#setsList > li')
    for (const li of setLis) {
        li.querySelector('.setTitle h2').classList.remove('set-h2-full')
    }
}
function tryShowFullFavoritesIndicator() {
    console.log('asdadadasd')
    if (isThereAnEmptySlotInFavorites() == false)
        query('#favoritesNotAllowedOverlay').style.display = ''
}
function tryHideFullFavoritesIndicator() {
    console.log('$$$$$$$$$$$')
    query('#favoritesNotAllowedOverlay').style.display = 'none'
}

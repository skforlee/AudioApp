// Library
function doesSoundExistInLibraryDiv(audioName) {
    const items = queryAll('#libraryItems li')
    const itemExists = items.some(item => item.querySelector('input').value == audioName)
    return itemExists
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
function removeAnyEmptyFavoriteSet() {
    function getAnyEmptyFavoriteSet() {
        if (isThereAnEmptySlotInFavorites() == false)
            return null
        const ul = document.querySelector('#favoritesListSets')
        const lis = Array.from(ul.children)
        const emptyLis = lis.filter(li => li.querySelector('h2').classList.contains('empty'))
        return emptyLis[0]
    }
    if (isThereAnEmptySlotInFavorites() == false)
        return false
    const emptyLi = getAnyEmptyFavoriteSet()
    emptyLi.remove()
    return true
}


// Saved Sets
function getSavedSetWithNameDom(savedSetName) {
    const savedSets = Array.from(document.querySelectorAll('.savedSetsSet'))
    for (const savedSet of savedSets) {
        if (savedSet.querySelector('.setTitle h2').innerText == savedSetName)
            return savedSet
    }
    return null
}
function getSavedSetAudio(savedSetName, audioName) {
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
function doesSavedSetHaveAudio(savedSetName, audioName) {
    return getSavedSetAudio(savedSetName, audioName)
}
function doesSavedSetHaveEmptySlot(savedSetName) {
    if (doesSavedSetHaveAudio(savedSetName, '[Empty]')) return true
    return false
}
function updateSlotInSavedSet(savedSetName, slotName, audioName) {
    const li = getSavedSetAudio(savedSetName, slotName)
    li.querySelector('h2').innerText = audioName
}
function replaceEmptySlotInSavedSetWithAudio(savedSetName, audioName) {
    updateSlotInSavedSet(savedSetName, '[Empty]', audioName)
    
}
function markSavedSetAsFavorite(setName) {
    const savedSet = getSavedSetWithNameDom(setName)
    savedSet.classList.toggle('favorited')
}

function makeSetActive(setName) {
    const savedSetsLis = queryAll('#setsList .savedSetsSet')
    const favoriteSetsLis = queryAll('#favoritesListSets li')
    for (const li of savedSetsLis)    li.classList.remove('active')
    for (const li of favoriteSetsLis) li.classList.remove('active')

    const savedSetLi = savedSetsLis.filter(li => li.querySelector('.setTitle h2').innerText == setName)[0]
    savedSetLi.classList.add('active')

    const audioNames = NodeCB.getSavedSetAudioNames(setName)
    for (let i = 0; i <= 5; i++) {
        const thisButton = query(`#button${i + 1}`)
        if (i < audioNames.length) {
            thisButton.querySelector('h2').innerText = audioNames[i]
        } else {
            thisButton.querySelector('h2').innerText = '[Empty]'
        }
    }
}


function tryAddSoundFromLibraryToSet(audioName, savedSetName) {
    if (doesSavedSetHaveAudio(savedSetName, audioName))
        return
    if (doesSavedSetHaveEmptySlot(savedSetName) == false)
        return
    replaceEmptySlotInSavedSetWithAudio(savedSetName, audioName)
    NodeCB.createAudioShortcutInSetFolder(audioName, savedSetName)
}
function tryMakeSetFavorite(setName) {
    if (doesFavoriteSetExist(setName))
        return
    if (isThereAnEmptySlotInFavorites() == false)
        return
    removeAnyEmptyFavoriteSet()
    createFavoriteSetItem({ name: setName })
    markSavedSetAsFavorite(setName)
    NodeCB.createFavoriteSetFolderAsShortcut(setName)
}
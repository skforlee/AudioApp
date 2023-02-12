
function createLibraryItem({ name }) {
    const element = dom(`
        <li draggable="true" class="libraryItem">
            <button class="sfxPlay"></button>
            <input type="text" value="${name}">
            <div class="dragArea"></div>
        </li>
    `, {
        '.sfxPlay': function(element) {
            const soundName = element.querySelector('input').value
            NodeCB.playAudioFromLibrary(soundName)
        }
    })

    onElementDraggedToAllQuery(element, '.deviceButton', (buttonDiv) => {
        const audioName = element.querySelector('input').value
        buttonDiv.querySelector('h2').innerText = audioName
    })
    onElementDraggedToAllQuery(element, '.savedSetsSet', (savedSetLi) => {
        const audioName = element.querySelector('input').value
        const savedSetName = savedSetLi.querySelector('.setTitle h2').innerText
        tryAddSoundFromLibraryToSet(audioName, savedSetName)
    })

    document.querySelector('#libraryItems').appendChild(element)
    return element
}
function createSavedSet({ name, items, isFavorited, isActive }) {
    if (name == null) throw `You must provide a name to createSavedSet`

    let elementExtraClasses = ""
    if (isFavorited === true) elementExtraClasses += " favorited"
    if (isActive === true) elementExtraClasses += " active"

    if (items == null) {
        items = repeatToArray('[Empty]', 6)
    }

    const element = dom(`
        <li draggable="true" class="savedSetsSet ${elementExtraClasses}">
            <div class="fileFolder">


                <div class="setTitle">
                    <div class="dropdown-icon"></div>
                    <h2>${name}</h2>
                    <button class="dragArea"></button>
                </div>


                <div class="setList">
                    <ul class="listIndex">
                        <li><img src="img/number--small--1.svg"></li>
                        <li><img src="img/number--small--2.svg"></li>
                        <li><img src="img/number--small--3.svg"></li>
                        <li><img src="img/number--small--4.svg"></li>
                        <li><img src="img/number--small--5.svg"></li>
                        <li><img src="img/number--small--6.svg"></li>
                    </ul>
                    <ul class="setListSfxs">
                        ${
                            items.map(itemName => `
                                <li id="">
                                    <button class="sfxPlay"></button>
                                    <h2>${itemName}</h2>
                                </li>
                            `).join('')
                        }
                    </ul>
                </div>

            </div>
        </li>
    `, {
        '.dropdown-icon': function(elem) {  // On click on the ".dropdown-icon", toggle "shown" class
            elem.classList.toggle("shown")
        }
    })
    element.addEventListener('click', (evt) => {
        const setName = element.querySelector('.setTitle h2').innerText
        makeSetActive(setName)
    })

    markAsCustomDragDropReceiver(element) // Responds to 'drop' events

    onElementDraggedToAllQuery(element, '#favoritesListSets', () => {
        const setName = element.querySelector('.setTitle h2').innerText
        tryMakeSetFavorite(setName)
    })
    

    document.querySelector('#setsList').appendChild(element)

    NodeCB.createSavedSetFolder(name)

    return element
}
function createFavoriteSetItem({ name, isEmpty }) {

    const nFavoriteSets = document.querySelector('#favoritesListSets').children.length
    if (nFavoriteSets > 6) throw 'Can not add a favorite set; favorite sets is full!'

    const h2Class = isEmpty === true? `empty` : ""
    const displayName = isEmpty === true? '[Empty]' : name

    const element = dom(`
        <li draggable="true">
            <div class="fileFolder">
                <h2 class="${h2Class}">${displayName}</h2>
                <div class="dragArea"></div>
            </div>
        </li>
    `)
    document.querySelector('#favoritesListSets').appendChild(element)
    return element
}


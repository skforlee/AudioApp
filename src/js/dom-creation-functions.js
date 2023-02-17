
function createLibraryItemDom({ name }) {
    const element = dom(`
        <li draggable="true" class="libraryItem">
            <button class="sfxPlay"></button>
            <input type="text" value="${name}">
            <div class="dragArea"></div>
        </li>
    `, {
        '.sfxPlay': function(element) {
            const audioName = element.querySelector('input').value
            const button = element.querySelector('button')

            onClickOnPlayButtonForAudio(button, audioName)
        }
    })

    element.querySelector('input').addEventListener('focus', (evt) => {
        element.setAttribute('data-old-input-value', element.querySelector('input').value)
    })
    element.querySelector('input').addEventListener('change', (evt) => {
        const oldName = element.getAttribute('data-old-input-value')
        const newName = element.querySelector('input').value
        renameLibraryAudioFromLi(element, oldName, newName)
    })

    onElementDraggedToQueryAll(element, '.deviceButton', (buttonDiv) => {
        const audioName = element.querySelector('input').value
        buttonDiv.querySelector('h2').innerText = audioName
        updateSavedSetItemsInDomAndFiles(getCurrentlyActiveSetName(), getButtonsAudioNamesNullIfEmpty())
    })
    onElementDraggedToQueryAll(element, '.savedSetsSet', (savedSetLi) => {
        const audioName = element.querySelector('input').value
        const savedSetName = savedSetLi.querySelector('.setTitle h2').innerText
        tryAddSoundFromLibraryToSet(audioName, savedSetName)
        makeSetActive(getCurrentlyActiveSetName())
    }, {
        onDragStart: () => {
            showFullSetIndicators()
        },
        onDragEnd: () => {
            hideFullSetIndicators()
        }
    })

    onRightClickContextMenu(element, 'audioContextMenu')

    document.querySelector('#libraryItems').appendChild(element)
    return element
}
function createSavedSetDom({ name, items, isFavorited, isActive }) {
    if (name == null) throw `You must provide a name to createSavedSetDom`

    let elementExtraClasses = ""
    if (isFavorited === true) elementExtraClasses += " favorited"
    if (isActive === true) elementExtraClasses += " active"

    if (items == null) {
        items = repeatToArray('[Empty]', 6)
    }
    items = items.map(item => item == null? '[Empty]': item)

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
                                    <h2 class="${itemName == '[Empty]'? 'empty': ''}">${itemName}</h2>
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
        },
        '.setListSfxs li button': function(elem, button) {
            const audioName = button.parentNode.querySelector('h2').innerText
            if (audioName == '[Empty]')
                return
            onClickOnPlayButtonForAudio(button, audioName)
        }
    })
    element.addEventListener('click', (evt) => {
        const setName = element.querySelector('.setTitle h2').innerText
        makeSetActive(setName)
    })

     // Responds to 'drop' events (dragging/dropping library items)
    markAsCustomDragDropReceiver(element)

    // Drag events
    onElementDraggedToQueryAll(element, '#favoritesListSets', () => {
        const setName = element.querySelector('.setTitle h2').innerText
        tryMakeSetFavorite(setName)
    }, {
        onDragStart: () => {
            tryShowFullFavoritesIndicator()
        },
        onDragEnd: () => {
            tryHideFullFavoritesIndicator()
        }
    })
    
    onRightClickContextMenu(element, 'setContextMenu')

    document.querySelector('#setsList').appendChild(element)

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

    element.addEventListener('click', (evt) => {
        const setName = element.querySelector('h2').innerText
        makeSetActive(setName)
    })

    onRightClickContextMenu(element, 'favoriteContextMenu')

    document.querySelector('#favoritesListSets').appendChild(element)
    return element
}



// Utils
function onClickOnPlayButtonForAudio(button, audioName) {
    if (button.classList.contains('sfxPlay--pause') == false) {
        button.classList.add('sfxPlay--pause')
        playAudioFromLibrary(audioName, () => {
            button.classList.remove('sfxPlay--pause')
        })
    } else {
        stopAudio(audioName)
        button.classList.remove('sfxPlay--pause')
    }
}

let elementJustRightClicked = null
function onRightClickContextMenu(element, contextMenuId, condition) {
    element.addEventListener('contextmenu', evt => {
        if (condition != null && condition() == false)
            return
        hideAllContextMenus()
        elementJustRightClicked = element
        showContextMenu(contextMenuId, evt)
    })
}


function showContextMenu(id, evt) {
    if (evt == null) throw `Provide the event to showContextMenu`
    const contextMenu = query('#' + id)
    contextMenu.classList.add('visible')
    contextMenu.style.left = evt.clientX + 'px'
    contextMenu.style.top = evt.clientY + 'px'
}
function hideAllContextMenus() {
    queryAll('.contextMenu').forEach(elem => elem.classList.remove('visible'))
}
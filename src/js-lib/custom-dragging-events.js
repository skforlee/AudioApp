
const dragState = {
    elementBeingDragged: null,
    divJustDroppedInto: null
}

// Use to make the element respond to DROP ON functions by onElementDraggedToAllQuery
// This is called automatically by onElementDraggedToAllQuery for all elements in the query
// Use this when you create a new element that should match the query
function markAsCustomDragDropReceiver(elem) {
    if (elem.getAttribute('data-has-drop-event') != null) {
        return
    }
    elem.setAttribute('data-has-drop-event', true)
    elem.addEventListener('dragover', (evt) => {              // Required for 'drop'; otherwise, 'drop' does not trigger
        evt.preventDefault()
    })
    elem.addEventListener('drop', (evt) => {
        if (dragState.elementBeingDragged == null) return     // To prevent other drop behavior affecting this
        dragState.divJustDroppedInto = elem
        console.log(('Dropped onto:'))
        console.log(dragState.divJustDroppedInto)
    })
}

// When element is dragged onto any element matching query, it triggers func(that element matching query)
function onElementDraggedToAllQuery(element, query, func) {
    // Setup drag end listeners for all elements matching the query
    const allElementsMatchingQuery = Array.from(document.querySelectorAll(query))
    for (const queryElem of allElementsMatchingQuery) {
        if (queryElem.getAttribute('data-has-drop-event') == null)
            markAsCustomDragDropReceiver(queryElem)
    }

    // Setup drag events for the element if it doesn't have already
    if (element.getAttribute('data-has-drag-event') == null) {
        element.setAttribute('data-has-drag-event', true)
        element.addEventListener('dragstart', () => {
            dragState.elementBeingDragged = element
        })
        element.addEventListener('dragend', (evt) => {
            dragState.elementBeingDragged = null
            if (dragState.divJustDroppedInto != null) {
                for (const eventFunc of element.customDragEvents) {
                    console.log('Triggering func')
                    eventFunc(dragState.divJustDroppedInto)
                }
            } else {
                console.log('Dropped on nothing')
            }
            dragState.divJustDroppedInto = null
        })
    }

    // Add custom drag events for element if it doesn't have
    if (element.customDragEvents == null) {
        element.customDragEvents = []
    }
    element.customDragEvents.push((elementDraggedOn) => {
        if (elementDraggedOn.matches(query)) {
            func(elementDraggedOn)
        }
    })
}


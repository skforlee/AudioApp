
const dragState = {
    elementBeingDragged: null,

    divBeingDroppedInto: null,
    divJustDroppedInto: null
}

// Use to make the element respond to DROP ON functions by onElementDraggedToQueryAll
// This is called automatically by onElementDraggedToQueryAll for all elements in the query
// Use this when you create a new element that should match the query
function markAsCustomDragDropReceiver(elem, options) {
    if (options == null) options = {}
    if (elem.getAttribute('data-has-drop-event') != null) {
        return
    }
    elem.setAttribute('data-has-drop-event', true)
    elem.addEventListener('dragover', (evt) => {              // Required for 'drop'; otherwise, 'drop' does not trigger
        if (options.onDragOver != null) {
            options.onDragOver(evt)
        }
        dragState.divBeingDroppedInto = elem
        evt.preventDefault()
    })
    elem.addEventListener('drop', (evt) => {
        if (options.onDrop != null) options.onDrop(evt)
        if (dragState.elementBeingDragged == null) return     // To prevent other drop behavior affecting this
        dragState.divJustDroppedInto = elem
        dragState.divBeingDroppedInto = null
    })
}

// When element is dragged onto any element matching query, it triggers func(that element matching query)
function onElementDraggedToQueryAll(element, query, func, extraCallbacks) {
    if (extraCallbacks == null) extraCallbacks = {}

    const {
        allowDropOnlyIf,
        onDragStart,
        onDragEnd
    } = extraCallbacks

    console.log({extraCallbacks})

    // Setup drag end listeners for all elements matching the query
    const allElementsMatchingQuery = Array.from(document.querySelectorAll(query))
    for (const queryElem of allElementsMatchingQuery) {
        if (queryElem.getAttribute('data-has-drop-event') == null)
            markAsCustomDragDropReceiver(queryElem, {
                allowDropOnlyIf: allowDropOnlyIf
            })
    }

    // Setup drag events for the element if it doesn't have already
    if (element.getAttribute('data-has-drag-event') == null) {
        element.setAttribute('data-has-drag-event', true)
        element.addEventListener('dragstart', (evt) => {
            dragState.elementBeingDragged = element
        })
        element.addEventListener('dragend', (evt) => {
            dragState.elementBeingDragged = null
            if (dragState.divJustDroppedInto != null) {
                for (const eventFunc of element.customDragEvents) {
                    eventFunc(dragState.divJustDroppedInto)
                }
            } else {
                console.log('Dropped on nothing')
            }
            dragState.divJustDroppedInto = null
            dragState.divBeingDroppedInto = null
        })
    }

    // Add custom drag events for element if it doesn't have
    if (element.customDragEvents == null) {
        element.customDragEvents = []
    }

    // Add custom drag event
    element.customDragEvents.push((elementDraggedOn) => {
        if (elementDraggedOn.matches(query)) {
            func(elementDraggedOn)
        }
    })

    // Setup extra callbacks custom events
    if (onDragStart != null) {
        element.addEventListener('dragstart', () => {
            onDragStart()
        })
    }
    if (onDragEnd != null) {
        element.addEventListener('dragend', () => {
            onDragEnd()
        })
    }
}


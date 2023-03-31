

{
    function setupStandardDragAndDropSortingFor(ul, groupName) {
        new Sortable(ul, {
            group: {
                name: groupName,
            },
            animation: 150,
            ghostClass: 'dragBackgroundColor',
            onUpdate: function(evt) {   // When sorting favorites...
                NodeCB.rewriteFavoriteSetsShortcuts(getFavoriteSetsFromUINullIfEmpty()) // Rewrite shortcuts 
            }
        })
    }

    // setupStandardDragAndDropSortingFor(document.querySelector('#setsList'), 'sets')
    setupStandardDragAndDropSortingFor(document.querySelector('#favoritesListSets'), 'favorites')
    // setupStandardDragAndDropSortingFor(document.querySelector('#libraryItems'), 'library')
}
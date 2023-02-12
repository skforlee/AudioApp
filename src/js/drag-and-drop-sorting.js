

{
    function setupStandardDragAndDropSortingFor(ul, groupName) {
        new Sortable(ul, {
            group: {
                name: groupName,
            },
            animation: 150,
            ghostClass: 'dragBackgroundColor'
        })
    }

    setupStandardDragAndDropSortingFor(document.querySelector('#setsList'), 'sets')
    setupStandardDragAndDropSortingFor(document.querySelector('#favoritesListSets'), 'favorites')
    setupStandardDragAndDropSortingFor(document.querySelector('#libraryItems'), 'library')
}
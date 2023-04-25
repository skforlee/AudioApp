// This script contains code for setting up the page
// E.g. window listeners, on-load, loading items, etc

function loadLibraryAudios() {
  removeAllChildren(query("#libraryItems"));
  const allAudioNames = NodeCB.getAllLibraryAudioNames();
  for (const audioName of allAudioNames) {
    createLibraryItemDom({ name: audioName });
  }
}
function loadSavedSets() {
  removeAllChildren(query("#setsList"));
  const allSavedSetsData = NodeCB.getAllSavedSetsWithAudiosData();
  const allAudioNames = NodeCB.getAllLibraryAudioNames();
  console.log(allSavedSetsData);
  console.log(allAudioNames);
  for (const setData of allSavedSetsData) {
    createSavedSetDom({
      name: setData.setName,
      items: setData.audioNames,
      isFavorited: NodeCB.isSetFavorite(setData.setName),
      libAudios: allAudioNames,
    });
  }
}
function loadFavoriteSets() {
  removeAllChildren(query("#favoritesListSets"));
  const allFavoriteSetNames = NodeCB.getAllFavoriteSetNamesNullIfEmpty();
  fillArrayUntilLength(allFavoriteSetNames, null, 5);
  for (const setName of allFavoriteSetNames) {
    if (setName != null) {
      createFavoriteSetItem({ name: setName, isEmpty: false });
    } else {
      createFavoriteSetItem({ isEmpty: true });
    }
  }
}

function setupButtonSwapping() {
  const the6ButtonTitles = queryAll(".buttonInfo");
  the6ButtonTitles.forEach((smallButton) => {
    onElementDraggedToQueryAll(
      smallButton,
      ".deviceButton",
      (deviceButton) => {
        swapButtons(smallButton, deviceButton.querySelector(".buttonInfo"));
      },
      {
        onDragStart: function (evt) {
          const bigButton = getBigButonParent(evt.target);
          bigButton.classList.remove("deviceButton--active");
        },
      }
    );
  });
}
function setupButtonContextMenus() {
  const the6Buttons = Array.from(document.querySelectorAll(".deviceButton"));
  the6Buttons.forEach((button) => {
    onRightClickContextMenu(button, "buttonContextMenu");
  });
}
function setupClosingContextMenus() {
  window.addEventListener("click", () => {
    hideAllContextMenus();
  });
  onEscapeKeyPress(hideAllContextMenus);
}
function setupClosingMenuBarMenus() {
  function _closeMenuBars() {
    console.log("asdasdad");
    hideAllMenus();
  }
  window.addEventListener("click", _closeMenuBars);
  onEscapeKeyPress(_closeMenuBars);
}
function setupClosingDialogs() {
  window.addEventListener("click", closeAllDialogs);
  onEscapeKeyPress(closeAllDialogs);
}
function setupButtonsDropOverAnimation() {
  function isElementBeingDraggedALibraryItemOrButton() {
    return (
      dragState.elementBeingDragged.classList.contains("libraryItem") ||
      dragState.elementBeingDragged.classList.contains("buttonInfo")
    );
  }
  const the6DeviceButtons = queryAll(".deviceButton");
  the6DeviceButtons.forEach((button) => {
    const smallButton = button.querySelector(".buttonInfo");
    markAsCustomDragDropReceiver(button, {
      onDragEnter: function (evt) {
        console.log(dragState.elementBeingDragged);
        console.log(
          dragState.elementBeingDragged.classList.contains("buttonInfo")
        );
        if (isElementBeingDraggedALibraryItemOrButton()) {
          console.log("Yashur");
          smallButton.classList.add("placeholder-marked-blue");
        }
      },
      onDragLeave: function (evt) {
        smallButton.classList.remove("placeholder-marked-blue");
      },
      onDrop: function (evt) {
        smallButton.classList.remove("placeholder-marked-blue");
      },
    });
  });
}

function _resetFavoriteDragDropAnimation() {
  queryAll("#favoritesListSets li").forEach((li) => {
    _resetFavoriteDragDropAnimationForLi(li);
  });
}
function setupEachFavoriteDropOverAnimation() {
  const favoriteLis = queryAll("#favoritesListSets li");
  for (const favoriteLi of favoriteLis) {
    // I don't remember what the point of this function was, unfortunately
    // Perhaps a task I already completed.
    // I will leave the code here, just in case
  }
}

// This function is not used anymore; it used to be used in a previous version
// Keeping it in case we need to revert this behavior
function setupFavoritesDropOverAnimation() {
  markAsCustomDragDropReceiver(query("#favoritesListSets"), {
    onDragEnter: function () {
      if (_isElementBeingDraggedASavedSet() == false) return;
      if (isThereAnEmptySlotInFavorites() == false) return;
      const currentSetName =
        dragState.elementBeingDragged.querySelector(".setTitle h2").innerText;
      const emptyFav = getAnyEmptyFavoriteSet();
      emptyFav
        .querySelector(".fileFolder")
        .classList.add("placeholder-marked-blue");
      emptyFav.querySelector("h2").innerText = currentSetName;
    },
    onDragLeave: function () {
      _resetFavoriteDragDropAnimation();
    },
    onDrop: function () {
      _resetFavoriteDragDropAnimation();
    },
  });
}

// Order is important
document.addEventListener("DOMContentLoaded", () => {
  NodeCB.initFolders(); // Creates 'sets', 'library', etc if they don't exist

  setupButtonSwapping();
  setupButtonContextMenus();

  setupClosingContextMenus();
  setupClosingMenuBarMenus();

  setupClosingDialogs();

  loadLibraryAudios();
  loadSavedSets();
  loadFavoriteSets();

  // setupFavoritesDropOverAnimation()
  setupEachFavoriteDropOverAnimation();
  setupButtonsDropOverAnimation();

  if (getAnySetName() == null) {
    onNewSetClick();
  }

  makeSetActive(getAnySetName());
});
var pressTimer1;
var hold1;
document.addEventListener("keydown", (evt) => {
  console.log(evt.code);
  let btn;
  // Check which key was pressed
  switch (evt.code) {
    case "Numpad1":
      btn = queryAll("#button1")[0];
      keyDown(btn);
      break;
    case "Numpad2":
      btn = queryAll("#button2")[0];
      keyDown(btn);
      break;
    case "Numpad3":
      btn = queryAll("#button3")[0];
      keyDown(btn);
      break;
    case "Numpad4":
      btn = queryAll("#button4")[0];
      keyDown(btn);
      break;
    case "Numpad5":
      btn = queryAll("#button5")[0];
      keyDown(btn);
      break;
    case "Numpad6":
      btn = queryAll("#button6")[0];
      keyDown(btn);
      break;
  }
});

document.addEventListener("keyup", (evt) => {
  console.log(evt.code);
  let btn;
  switch (evt.code) {
    case "Numpad1":
      btn = queryAll("#button1")[0];
      keyUp(btn);
      break;
    case "Numpad2":
      btn = queryAll("#button2")[0];
      keyUp(btn);
      break;
    case "Numpad3":
      btn = queryAll("#button3")[0];
      keyUp(btn);
      break;
    case "Numpad4":
      btn = queryAll("#button4")[0];
      keyUp(btn);
      break;
    case "Numpad5":
      btn = queryAll("#button5")[0];
      keyUp(btn);
      break;
    case "Numpad6":
      btn = queryAll("#button6")[0];
      keyUp(btn);
      break;
  }
});

function keyUp(btn) {
  btn.classList.remove("deviceButton--active");
  clearTimeout(pressTimer1);
}

function keyDown(btn) {
  btn.click();
  btn.classList.add("deviceButton--active");

  // when he hold press for 1500 ms the sound stops
  pressTimer1 = window.setTimeout(function () {
    const audioName = btn.querySelector("h2").innerText;
    if (audioName == "[Empty]") return;
    stopAudio(audioName, btn.id);
    hold1 = true;
  }, 1500);
}

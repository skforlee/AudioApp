/* Note: the readonly attribute is there to prevent some strange drag-drop behavior */
/* The input should only be write-able if focused */

function makeSetActive(setName) {
  // Make it look pink
  const savedSetsLis = queryAll("#setsList .savedSetsSet");
  const favoriteSetsLis = queryAll("#favoritesListSets li");
  for (const li of savedSetsLis) li.classList.remove("active");
  for (const li of favoriteSetsLis) li.classList.remove("active");

  const savedSetLi = savedSetsLis.filter(
    (li) => li.querySelector(".setTitle h2").innerText == setName
  )[0];
  savedSetLi.classList.add("active");

  // Update buttons
  const audioNames = NodeCB.getSavedSetAudioNames(setName);
  console.log({ audioNames });

  for (let i = 0; i <= 5; i++) {
    const thisButton = query(`#button${i + 1}`);
    if (audioNames[i] != null) {
      updateButton(thisButton, audioNames[i]);
    } else {
      updateButton(thisButton, "[Empty]");
    }
  }

  // Update name in the big panel
  query("#setNameInput").value = setName;
}

function createLibraryItemDom({ name }) {
  const element = dom(
    `
        <li draggable="true" class="libraryItem" data-file-name="${name}">
            <button class="sfxPlay"></button>
            <input type="text" value="${name}" readonly>
            <div class="dragArea"></div>
        </li>
    `,
    {
      ".sfxPlay": function (element) {
        const audioName = element.querySelector("input").value;
        const button = element.querySelector("button");

        onClickOnPlayButtonForAudio(button, audioName);
      },
    }
  );

  element.querySelector("input").addEventListener("focus", (evt) => {
    const input = element.querySelector("input");
    input.readOnly = false;
    const tempValue = removeExtension(input.value);
    element.setAttribute(
      "data-old-input-value",
      element.querySelector("input").value
    );
    input.value = tempValue;
  });
  element.querySelector("input").addEventListener("focusout", (evt) => {
    const input = element.querySelector("input");
    input.readOnly = true;
    if (
      input.value !=
      removeExtension(element.getAttribute("data-old-input-value"))
    )
      return; // Handled by the change event, below
    input.value = element.getAttribute("data-old-input-value");
  });
  element.querySelector("input").addEventListener("change", (evt) => {
    const input = element.querySelector("input");
    const oldName = element.getAttribute("data-old-input-value");
    input.readOnly = true;
    if (input.value.trim().length == 0) {
      input.value = oldName;
      return;
    }
    const extension = getExtension(oldName);
    const newName = fixNewAudioName(input.value + "." + extension);
    renameLibraryAudioFromLi(element, oldName, newName);
    input.value = newName;
  });

  setupAllowDragOnlyOnHandle(element, element.querySelector(".dragArea"));

  onElementDraggedToQueryAll(
    element,
    ".deviceButton",
    (buttonDiv) => {
      const audioName = element.querySelector("input").value;
      buttonDiv.querySelector("h2").innerText = audioName;
      updateSavedSetItemsInDomAndFiles(
        getCurrentlyActiveSetName(),
        getButtonsAudioNamesNullIfEmpty()
      );
      makeSetActive(getCurrentlyActiveSetName());
    },
    {
      onDragStart: function (evt) {
        evt.dataTransfer.dropEffect = "copy";
      },
    }
  );

  // This used to be the drag-and-drop to the saved set directly
  // onElementDraggedToQueryAll(element, '.savedSetsSet', (savedSetLi) => {
  //     const audioName = element.querySelector('input').value
  //     const savedSetName = savedSetLi.querySelector('.setTitle h2').innerText
  //     tryAddSoundFromLibraryToSet(audioName, savedSetName)
  //     makeSetActive(getCurrentlyActiveSetName())
  // }, {
  //     onDragStart: () => {
  //         showFullSetIndicators()
  //     },
  //     onDragEnd: () => {
  //         hideFullSetIndicators()
  //     }
  // })

  onRightClickContextMenu(element, "audioContextMenu");

  query("#libraryItems").appendChild(element);
  updateLibraryAndSavedSetsTitleNumber();
  return element;
}
function createSavedSetDom({ name, items, isFavorited, isActive, libAudios }) {
  if (name == null) throw `You must provide a name to createSavedSetDom`;

  let elementExtraClasses = "";
  if (isFavorited === true) elementExtraClasses += " favorited";
  if (isActive === true) elementExtraClasses += " active";

  if (items == null) {
    items = repeatToArray("[Empty]", 6);
  }

  // added the || condition to check if the audio exist in the library in the first place
  items = items.map((item) => {
    if (item != null && !libAudios.includes(item)) {
      let name = item;
      for (const savedSetData of NodeCB.getAllSavedSetsWithAudiosData()) {
        // For each set...
        const audioNames = savedSetData.audioNames;
        for (let i = 0; i < audioNames.length; i++) {
          // For each audio name in that set...
          const audioName = audioNames[i];
          if (audioName == name) {
            NodeCB.deleteAudioShortcutByIndexInSetFolder(
              savedSetData.setName,
              i
            );
          }
        }
      }

      // Update numbers - e.g "Library <17>"
      updateLibraryAndSavedSetsTitleNumber();

      // Remove from buttons in DOM
      makeSetActive(getCurrentlyActiveSetName());
    }
    return item != null && libAudios.includes(item) ? item : "[Empty]";
  });

  const element = dom(
    `
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
                        ${items
                          .map(
                            (itemName) => `
                                <li id="">
                                    <button class="sfxPlay"></button>
                                    <h2 class="${
                                      itemName == "[Empty]" ? "empty" : ""
                                    }">${itemName}</h2>
                                </li>
                            `
                          )
                          .join("")}
                    </ul>
                </div>

            </div>
        </li>
    `,
    {
      ".dropdown-icon": function (elem) {
        // On click on the ".dropdown-icon", toggle "shown" class
        elem.classList.toggle("shown");
      },
      ".setListSfxs li button": function (elem, button) {
        const audioName = button.parentNode.querySelector("h2").innerText;
        if (audioName == "[Empty]") return;
        onClickOnPlayButtonForAudio(button, audioName);
      },
    }
  );
  element.addEventListener("click", (evt) => {
    const setName = element.querySelector(".setTitle h2").innerText;
    makeSetActive(setName);
  });

  // Responds to 'drop' events (dragging/dropping library items)
  markAsCustomDragDropReceiver(element);

  setupAllowDragOnlyOnHandle(element, element.querySelector(".dragArea"));

  // Drag events
  onElementDraggedToQueryAll(
    element,
    "#favoritesListSets li",
    (favoriteLiDraggedOn) => {
      const setName = element.querySelector(".setTitle h2").innerText;
      // tryMakeSetFavorite(setName)
      tryMakeSetFavoriteInSlotLi(setName, favoriteLiDraggedOn);
    },
    {
      onDragStart: () => {
        tryShowFullFavoritesIndicator();
        // tryColorFavoritesSet()
      },
      onDragEnd: () => {
        tryHideFullFavoritesIndicator();
        // uncolorAllFavoritesSets()
      },
    }
  );

  // Needed to fix a strange behavior, since we only allow dragging on the drag area
  if (window.hasMouseUpFullIndicatorFix == null) {
    window.hasMouseUpFullIndicatorFix = true;
    window.addEventListener("mouseup", () => {
      tryHideFullFavoritesIndicator();
    });
  }

  onRightClickContextMenu(element, "setContextMenu");

  document.querySelector("#setsList").appendChild(element);

  updateLibraryAndSavedSetsTitleNumber();

  return element;
}
function createFavoriteSetItem({ name, isEmpty }) {
  const nFavoriteSets =
    document.querySelector("#favoritesListSets").children.length;
  if (nFavoriteSets > 5)
    throw "Can not add a favorite set; favorite sets is full!";

  const h2Class = isEmpty === true ? `empty` : "";
  const displayName = isEmpty === true ? "[Empty]" : name;

  const element = dom(`
        <li draggable="true">
            <div class="fileFolder">
                <h2 class="${h2Class}">${displayName}</h2>
                <div class="dragArea"></div>
            </div>
        </li>
    `);

  element.addEventListener("click", (evt) => {
    const setName = element.querySelector("h2").innerText;
    makeSetActive(setName);
  });

  onRightClickContextMenu(
    element,
    "favoriteContextMenu",
    () => element.querySelector("h2").classList.contains("empty") == false
  ); // Only open menu if it's not empty

  markAsCustomDragDropReceiver(element, {
    onDragEnter: function () {
      console.log("> ENTER");
      if (_isElementBeingDraggedASavedSet() == false) {
        return;
      }
      if (element.querySelector("h2").classList.contains("empty") == false) {
        return;
      }
      const currentSetName =
        dragState.elementBeingDragged.querySelector(".setTitle h2").innerText;
      element
        .querySelector(".fileFolder")
        .classList.add("placeholder-marked-blue");
      element.querySelector("h2").innerText = currentSetName;
    },
    onDragLeave: function () {
      console.log("< LEFT");
      _resetFavoriteDragDropAnimationForLi(element);
    },
    onDrop: function () {
      _resetFavoriteDragDropAnimation();
    },
  });

  document.querySelector("#favoritesListSets").appendChild(element);
  return element;
}

// Utils
function onClickOnPlayButtonForAudio(button, audioFileName) {
  const allSpecificButtons = getAllButtonsWithThatAudio(audioFileName);
  stopAudio(audioFileName);
  const anyButton = allSpecificButtons[0];
  const isButtonReadyToPlay =
    anyButton.classList.contains("sfxPlay--pause") == false;

  if (isButtonReadyToPlay) {
    for (const button of allSpecificButtons) {
      button.classList.add("sfxPlay--pause");
    }
    playAudioFromLibrary(audioFileName, () => {
      for (const button of allSpecificButtons) {
        button.classList.remove("sfxPlay--pause");
      }
    });
  } else {
    for (const button of allSpecificButtons) {
      button.classList.remove("sfxPlay--pause");
    }
  }
}

function getAllButtonsWithThatAudio(audioName) {
  const libAudioButtons = queryAll("#libraryItems li input")
    .filter((input) => input.value == audioName)
    .map((input) => input.parentNode.querySelector("button"));
  let buttons = libAudioButtons.length > 0 ? [libAudioButtons[0]] : [];
  const setAudioButtons = queryAll(".setListSfxs li h2")
    .filter((h2) => h2.innerText == audioName)
    .map((h2) => h2.parentNode.querySelector("button"));
  if (setAudioButtons.length > 0) buttons = [...buttons, ...setAudioButtons];
  return buttons;
}

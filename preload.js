// This script contains BOTH the browser window AND the Node environment
// It exposes Node functions to the browser window

const { contextBridge, shell, remote, ipcRenderer } = require("electron");
const createDesktopShortcut = require("create-desktop-shortcuts");
const fs = require("fs");
const { join, resolve, basename, parse } = require("path");
const {
  assertNotNull,
  arrayFromObjectWithNumberKeys,
  playSound,
} = require("./preload-js/preload-utils.js");
const ini = require("ini");
const xml2js = require("xml2js");
const os = require("os");

const LIBRARY_FOLDER_PATH = "library";
const SAVED_SETS_FOLDER_PATH = "sets";
const FAVORITES_FOLDER_PATH = "favorites";
var shortCutExtension;
var ExecDir = process.env.PORTABLE_EXECUTABLE_DIR || "";

if (ExecDir){
  process.chdir(ExecDir);
}


if (os.platform == "linux") {
  // change shortcut extension to linux extension .desktop
  shortCutExtension = ".desktop";
} else if (os.platform == "darwin") {
  // change shortcut extension to macOS extension .webloc
  shortCutExtension = "";
} else {
  // change shortcut extension to Windows extension .lnk
  shortCutExtension = ".lnk";
}

// Library Audio
function saveAudioFile({ file, folder, callback }) {
  // callback(true) if succeeded, otherwise callback(false)
  // assertNotNull(file, folder)
  const filePath = join(folder, file.name);
  const fileReader = new FileReader();
  fileReader.readAsArrayBuffer(file);
  fileReader.onload = function () {
    const buffer = Buffer.from(fileReader.result);
    fs.writeFileSync(filePath, buffer, "binary");
    if (callback != null) {
      callback(true);
    }
  };
  fileReader.onerror = function (evt) {
    if (callback != null) {
      callback(false);
    }
  };
}
function saveAudioFilesToLibrary(files, callback) {
  assertNotNull(files);

  let nSavedFilesSoFar = 0;

  for (const file of files) {
    saveAudioFile({
      file: file,
      folder: LIBRARY_FOLDER_PATH,
      callback: function (didSucceed) {
        nSavedFilesSoFar += 1;
        if (nSavedFilesSoFar == files.length && callback != null) {
          callback();
        }
      },
    });
  }
}
function renameLibraryAudioFile(oldName, newName) {
  const audioPath = join(LIBRARY_FOLDER_PATH, oldName);
  const newAudioPath = join(LIBRARY_FOLDER_PATH, newName);
  fs.renameSync(audioPath, newAudioPath);
}
function deleteLibraryAudioFile(audioName) {
  fs.rmSync(join(LIBRARY_FOLDER_PATH, audioName), { force: true });
}
function getLibraryAudioPath(audioName) {
  if (ExecDir){
    return join(join(ExecDir, LIBRARY_FOLDER_PATH), audioName);
  }else{
    return resolve(join(LIBRARY_FOLDER_PATH, audioName));
  }
}
function getAllLibraryAudioNames() {
  const allAudios = Array.from(fs.readdirSync(LIBRARY_FOLDER_PATH));
  return allAudios.filter((audioName) => audioName != "desktop.ini");
}
function createAudio(audioName) {
  const audioPath = getLibraryAudioPath(audioName);
  const audio = new Audio(audioPath);
  return audio;
}

// Saved Sets
function getAllSavedSetsWithAudiosData() {
  const allSetNames = Array.from(fs.readdirSync(SAVED_SETS_FOLDER_PATH)).filter(
    (setName) => setName != "desktop.ini"
  );
  const setsData = allSetNames.map((setName) => ({
    setName: setName,
    audioNames: getSavedSetAudioNames(setName),
  }));
  return setsData;
}
function createSavedSetFolder(setName) {
  const setFolderPath = join(SAVED_SETS_FOLDER_PATH, setName);
  if (fs.existsSync(setFolderPath) == false) {
    fs.mkdirSync(setFolderPath);
  }
}
function renameSavedSetFolder(setName, newName) {
  const setPath = join(SAVED_SETS_FOLDER_PATH, setName);
  const newSetPath = join(SAVED_SETS_FOLDER_PATH, newName);
  fs.renameSync(setPath, newSetPath);
}

let __rmType = "absolute-sync";
function deleteSavedSetFolder(setName) {
  console.log(`NodeCB: Deleting set folder for set ${setName}`);
  const setPath = join(SAVED_SETS_FOLDER_PATH, setName);
  console.log(`NodeCB: Found path "${setPath}"`);
  const absolutePath = resolve(setPath);
  console.log(`NodeCB: Found absolute path "${absolutePath}"`);

  console.log(`NodeCB: Deleting with method ${__rmType}`);
  try {
    switch (__rmType) {
      case "absolute-sync":
        fs.rmSync(absolutePath, { recursive: true, force: true });
        break;
      case "absolute-async":
        fs.rm(absolutePath, { recursive: true, force: true }, (e) => {
          console.log(`NodeCB: absolute-async result:`);
          console.log(e);
        });
        break;
      case "relative-sync":
        fs.rmSync(setPath, { recursive: true, force: true });
        break;
      case "relative-async":
        fs.rm(setPath, { recursive: true, force: true }, (e) => {
          console.log(`NodeCB: relative-async result:`);
          console.log(e);
        });
        break;
      default:
        console.log(`Method ${__rmType} unknown.`);
        console.log(
          `Use absolute-sync, absolute-async, relative-sync or relative-async`
        );
    }
  } catch (e) {
    console.log(`NodeCB: ERROR`);
    console.log(e);
  }
}
function changeDeleteSetMethod(type) {
  __rmType = type;
}
function getFirstAvailableSetName() {
  // Returns a 'random' set name (for new sets)
  const baseSetPath = join(SAVED_SETS_FOLDER_PATH, "Untitled Set ");
  let i = 1;
  while (fs.existsSync(baseSetPath + i)) {
    i += 1;
  }
  return `Untitled Set ${i}`;
}

// Favorite Sets
function rewriteFavoriteSetsShortcuts(setNames) {
  console.log("Deleting (NodeCB): got set names:" + setNames.join(", "));
  console.log({ setNames });
  if (setNames.length < 5)
    throw `Given setNames should always be length 6 (with null for empty slots)`;
  // Delete previous shortcuts
  // There if's are there to counteract some strange Windows behavior
  if (fs.existsSync(FAVORITES_FOLDER_PATH)) {
    console.log(
      "Deleting (NodeCB): Favorites exists. Deleting it to recreate it..."
    );
    fs.rmSync(FAVORITES_FOLDER_PATH, { recursive: true, force: true });
  }
  if (fs.existsSync(FAVORITES_FOLDER_PATH) == false) {
    console.log(
      "Deleting (NodeCB): Favorites does not exist now. Creating it..."
    );
    fs.mkdirSync(FAVORITES_FOLDER_PATH);
  }
  console.log(
    `Deleting (NodeCB): Recreated favorites folder. Success? ${fs.existsSync(
      FAVORITES_FOLDER_PATH
    )}`
  );

  // Create shortcuts
  for (let i = 0; i < setNames.length; i++) {
    const setName = setNames[i];
    console.log(`Deleting (NodeCB): Recreating favorite set ${setName}`);
    if (setName == null) continue;
    const targetPath = resolve(join(SAVED_SETS_FOLDER_PATH, setName));
    console.log(`Deleting (NodeCB): i=${i}, targetPath=${targetPath}`);
    const shortcutsCreated = createDesktopShortcut({
      windows: {
        filePath: targetPath,
        outputPath: FAVORITES_FOLDER_PATH,
        name: `${i}`,
      },
      osx: {
        filePath: targetPath,
        outputPath: FAVORITES_FOLDER_PATH,
        name: `${i}`,
      },
      linux: {
        filePath: targetPath,
        outputPath: FAVORITES_FOLDER_PATH,
        name: `${i}`,
      },
    });
    console.log(`Deleting (NodeCB): Shortcuts created? ${shortcutsCreated}`);
  }
}
function createFavoriteSetFolderAsShortcut(setName, index) {
  const setFolderFullPath = resolve(join(SAVED_SETS_FOLDER_PATH, setName));
  if (fs.existsSync(setFolderFullPath) == false)
    throw `Can't make shortcut for set ${setName} because it doesn't exist`;
  const shortcutsCreated = createDesktopShortcut({
    windows: {
      filePath: setFolderFullPath,
      outputPath: FAVORITES_FOLDER_PATH,
    },
    osx: {
      filePath: setFolderFullPath,
      outputPath: FAVORITES_FOLDER_PATH,
    },
    linux: {
      filePath: setFolderFullPath,
      outputPath: FAVORITES_FOLDER_PATH,
    },
  });
}
function renameFavoriteSetShortcutFolder(setName, newSetName) {
  const setPath = join(FAVORITES_FOLDER_PATH, setName + ".lnk");
  fs.rmSync(setPath, { force: true });
  createFavoriteSetFolderAsShortcut(newSetName);
}
function getAllFavoriteSetNamesNullIfEmpty() {
  const allFavoriteSetNames = [];
  for (let i = 0; i <= 4; i++) {
    const setPath = join(FAVORITES_FOLDER_PATH, i + shortCutExtension);
    if (fs.existsSync(setPath)) {
      allFavoriteSetNames.push(getShortcutTargetBasename(setPath));
    } else {
      allFavoriteSetNames.push(null);
    }
  }
  return allFavoriteSetNames;
}
// TODO: Also rework this
function isSetFavorite(setName) {
  const setNames = getAllFavoriteSetNamesNullIfEmpty();
  return setNames.includes(setName);
}

// Multiple
function createAudioShortcutInSetFolder(setName, audioName, index) {
  const fullPathToOriginalAudio = resolve(join(LIBRARY_FOLDER_PATH, audioName));
  const pathToShortcutFolder = join(SAVED_SETS_FOLDER_PATH, setName);
  const shortcutsCreated = createDesktopShortcut({
    windows: {
      filePath: fullPathToOriginalAudio,
      outputPath: pathToShortcutFolder,
      name: `${index}`,
    },
    osx: {
      filePath: fullPathToOriginalAudio,
      outputPath: pathToShortcutFolder,
      name: `${index}`,
    },
    linux: {
      filePath: fullPathToOriginalAudio,
      outputPath: pathToShortcutFolder,
      name: `${index}`,
    },
  });
}
function retargetAudioShortcutInSetFolder(setName, index, newAudioName) {
  deleteAudioShortcutByIndexInSetFolder(setName, index);
  createAudioShortcutInSetFolder(setName, newAudioName, index);
}
function deleteAudioShortcutByIndexInSetFolder(setName, index) {
  const shortcutName = index + shortCutExtension;
  const shortcutPath = join(SAVED_SETS_FOLDER_PATH, setName, shortcutName);
  fs.rmSync(shortcutPath, { force: true });
}
function updateSavedSetAudioShortcuts(setName, newAudioNames) {
  if (newAudioNames.length < 6)
    throw `For set ${setName}, newAudioNames should have length 6! It's currently: [${newAudioNames.join(
      ","
    )}]`;

  // Remove old shortcuts
  const filesInFolder = Array.from(
    fs.readdirSync(join(SAVED_SETS_FOLDER_PATH, setName))
  ).filter((fileName) => fileName != "desktop.ini");
  const oldShortcuts = filesInFolder.map((lnk) =>
    join(SAVED_SETS_FOLDER_PATH, setName, lnk)
  );
  for (const s of oldShortcuts) fs.rmSync(s, { force: true });

  // Create new shortcuts
  for (let i = 0; i <= 5; i++) {
    if (newAudioNames[i] == null) continue;
    createAudioShortcutInSetFolder(setName, newAudioNames[i], i);
  }
}

// Utils
function initFolders() {
  if(ExecDir){

    if (fs.existsSync(join(ExecDir, "sets")) == false) {
      fs.mkdirSync(join(ExecDir, "sets"));
    }
    if (fs.existsSync(join(ExecDir,"library")) == false) {
      fs.mkdirSync(join(ExecDir,"library"));
    }
    if (fs.existsSync(join(ExecDir,"favorites")) == false) {
      fs.mkdirSync(join(ExecDir,"favorites"));
    }
  }else{
    if (fs.existsSync("sets") == false) {
      fs.mkdirSync("sets");
    }
    if (fs.existsSync("library") == false) {
      fs.mkdirSync(join(ExecDir,"library"));
    }
    if (fs.existsSync(join(ExecDir,"favorites")) == false) {
      fs.mkdirSync(join(ExecDir,"favorites"));
    }
  }
}
function getShortcutTargetBasename(shortcutPath) {
  if (os.platform == "linux") {
    const desktopFile = fs.readFileSync(shortcutPath, "utf-8");
    const shortcutTarget = ini.parse(desktopFile)["Desktop Entry"].Exec;
    const fileName = basename(shortcutTarget);
    return fileName;
  } else if (os.platform == "darwin") {
    let absPath = fs.readlinkSync(shortcutPath);
    const fileName = basename(absPath)

    return fileName;
  }
  const parsed = shell.readShortcutLink(shortcutPath);
  const shortcutTarget = parsed.target;
  const fileName = basename(shortcutTarget);
  return fileName;
}
function getOriginalAudioShortcutNameFromSavedSet(setName, shortcutName) {
  const shortcutPath = join(SAVED_SETS_FOLDER_PATH, setName, shortcutName);
  return getShortcutTargetBasename(shortcutPath);
}
function getSavedSetAudioNames(setName) {
  const setPath = join(SAVED_SETS_FOLDER_PATH, setName);

  fs.readdir(setPath, (err, files) => {
    if (err) {
      console.error(`Error reading directory: ${err}`);
      return;
    }
  
    console.log(`Files in ${setPath}:`);
    files.forEach((file) => {
      console.log(file);
    });
  });

  const allFilesInside = [];
  for (let i = 0; i <= 5; i++) {
    const shortcutName = i + shortCutExtension;
    console.log(shortcutName);
    const shortcutPath = join(setPath, shortcutName);
    console.log(shortcutPath);
    console.log(fs.existsSync(shortcutPath));
    if (fs.existsSync(shortcutPath)) {
      allFilesInside.push(
        getOriginalAudioShortcutNameFromSavedSet(setName, shortcutName)
      );
    } else {
      allFilesInside.push(null);
    }
  }

  return allFilesInside;
}
function getAllFilesInFolderNameKeyTimestampValue(path) {
  const fileNames = Array.from(fs.readdirSync(path)).filter(
    (fileName) => fileName != "desktop.ini"
  );
  const filesData = {};
  for (const fileName of fileNames) {
    const filePath = join(path, fileName);
    const fileStat = fs.statSync(filePath);
    filesData[fileName] = fileStat.birthtimeMs;
  }
  return filesData;
}
function quit() {
  ipcRenderer.invoke("quit-app"); // See index.js
}
function openDevConsole() {
  ipcRenderer.invoke("open-dev-console"); // See index.js
}
function openExternalLink(url) {
  shell.openExternal(url);
}

contextBridge.exposeInMainWorld("NodeCB", {
  saveAudioFilesToLibrary,
  renameLibraryAudioFile,
  deleteLibraryAudioFile,

  createSavedSetFolder,
  renameSavedSetFolder,
  deleteSavedSetFolder,
  updateSavedSetAudioShortcuts,
  getAllSavedSetsWithAudiosData,
  getFirstAvailableSetName,
  getSavedSetAudioNames,

  renameFavoriteSetShortcutFolder,
  // createFavoriteSetFolderAsShortcut,
  rewriteFavoriteSetsShortcuts,
  getAllFavoriteSetNamesNullIfEmpty,
  isSetFavorite,

  createAudioShortcutInSetFolder,
  retargetAudioShortcutInSetFolder,
  deleteAudioShortcutByIndexInSetFolder,

  // getLibraryAudioPath,
  createAudio,
  getAllLibraryAudioNames,
  getAllFilesInFolderNameKeyTimestampValue,

  changeDeleteSetMethod,
  initFolders,
  getOriginalAudioShortcutNameFromSavedSet,
  openExternalLink,
  shell,
  openDevConsole,
  quit,
  fs,
});

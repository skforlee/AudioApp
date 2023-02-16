
// This script contains BOTH the browser window AND the Node environment
// It exposes Node functions to the browser window

const { contextBridge, shell } = require('electron')
const createDesktopShortcut = require('create-desktop-shortcuts')
const fs = require('fs')
const { join, resolve, basename, parse } = require('path')
const {
    assertNotNull,
    arrayFromObjectWithNumberKeys,
    playSound
} = require('./preload-js/preload-utils.js')



const LIBRARY_FOLDER_PATH = 'library'
const SAVED_SETS_FOLDER_PATH = 'sets'
const FAVORITES_FOLDER_PATH = 'favorites'


// Library Audio
function saveAudioFile({ file, folder, callback }) {    // callback(true) if succeeded, otherwise callback(false)
    // assertNotNull(file, folder)    
    console.log(`Saving file named ${file.name} to folder ${folder}`)
    const filePath = join(folder, file.name)
    const fileReader = new FileReader()
    fileReader.readAsArrayBuffer(file)
    fileReader.onload = function() {
        const buffer = Buffer.from(fileReader.result)
        fs.writeFileSync(filePath, buffer, "binary")
        if (callback != null) {
            callback(true)
        }
    }
    fileReader.onerror = function(evt) {
        if (callback != null) {
            callback(false)
        }
    }
}
function saveAudioFilesToLibrary(files, callback) {
    assertNotNull(files)
    
    let nSavedFilesSoFar = 0

    for (const file of files) {
        saveAudioFile({
            file: file,
            folder: LIBRARY_FOLDER_PATH,
            callback: function(didSucceed) {
                nSavedFilesSoFar += 1
                if (nSavedFilesSoFar == files.length && callback != null) {
                    callback()
                } 
            }
        })
    }
}
function renameLibraryAudioFile(oldName, newName) {
    const audioPath = join(LIBRARY_FOLDER_PATH, oldName)
    const newAudioPath = join(LIBRARY_FOLDER_PATH, newName)
    fs.renameSync(audioPath, newAudioPath)
}
function getLibraryAudioPath(audioName) {
    return join('..', LIBRARY_FOLDER_PATH, audioName)
}
function getAllLibraryAudioNames() {
    return fs.readdirSync(LIBRARY_FOLDER_PATH)
}


// Saved Sets
function getAllSavedSetsWithAudiosData() {
    const allSetNames = fs.readdirSync(SAVED_SETS_FOLDER_PATH)
    const setsData = allSetNames.map(setName => ({
        setName: setName,
        audioNames: getSavedSetAudioNames(setName)
    }))
    return setsData
}
function createSavedSetFolder(setName) {
    const setFolderPath = join(SAVED_SETS_FOLDER_PATH, setName)
    if (fs.existsSync(setFolderPath) == false) {
        fs.mkdirSync(setFolderPath)
    }
}
function renameSavedSetFolder(setName, newName) {
    const setPath = join(SAVED_SETS_FOLDER_PATH, setName)
    const newSetPath = join(SAVED_SETS_FOLDER_PATH, newName)
    fs.renameSync(setPath, newSetPath)
}
function getFirstAvailableSetName() {                           // Returns a 'random' set name (for new sets)
    const baseSetPath = join(SAVED_SETS_FOLDER_PATH, 'Set-')
    let i = 1
    while (fs.existsSync(baseSetPath + i)) {
        i += 1
    }
    return `Set-${i}`
}


// Favorite Sets
function createFavoriteSetFolderAsShortcut(setName) {
    const setFolderFullPath = resolve(join(SAVED_SETS_FOLDER_PATH, setName))
    if (fs.existsSync(setFolderFullPath) == false)
        throw `Can't make shortcut for set ${setName} because it doesn't exist`
    const shortcutsCreated = createDesktopShortcut({
        windows: {
            filePath: setFolderFullPath,
            outputPath: FAVORITES_FOLDER_PATH,
        },
        osx: {
            filePath: setFolderFullPath,
            outputPath: FAVORITES_FOLDER_PATH
        }
    })
    console.log({shortcutsCreated})
}
function renameFavoriteSetShortcutFolder(setName, newSetName) {
    const setPath = join(FAVORITES_FOLDER_PATH, setName + '.lnk')
    fs.rmSync(setPath, { force: true })
    createFavoriteSetFolderAsShortcut(newSetName)
}
function getAllFavoriteSetNames() {
    return Array.from(fs.readdirSync(FAVORITES_FOLDER_PATH)).map(lnk => parse(lnk).name)    // Remove the ".lnk" part; keep only the name
}
function isSetFavorite(setName) {
    return fs.existsSync(join(FAVORITES_FOLDER_PATH, setName + '.lnk'))
}


// Multiple
function createAudioShortcutInSetFolder(setName, audioName, index) {
    console.table({audioName, setName, index})
    const fullPathToOriginalAudio = resolve(join(LIBRARY_FOLDER_PATH, audioName))
    const pathToShortcutFolder = join(SAVED_SETS_FOLDER_PATH, setName)
    const shortcutsCreated = createDesktopShortcut({
        windows: {
            filePath: fullPathToOriginalAudio,
            outputPath: pathToShortcutFolder,
            name: `${index}`
        },
        osx: {
            filePath: fullPathToOriginalAudio,
            outputPath: pathToShortcutFolder,
            name: `${index}`
        }
    })
}
// TODO: Continue from here
function retargetAudioShortcutInSetFolder(setName, index, newAudioName) {
    const shortcutName = index + '.lnk'
    const shortcutPath = join(SAVED_SETS_FOLDER_PATH, setName, shortcutName)
    fs.rmSync(shortcutPath, { force: true })
    createAudioShortcutInSetFolder(setName, newAudioName, index)
}
function updateSavedSetAudioShortcuts(setName, newAudioNames) {
    if (newAudioNames.length < 6) throw `For set ${setName}, newAudioNames should have length 6! It's currently: [${newAudioNames.join(',')}]`

    // Remove old shortcuts
    const oldShortcuts = fs.readdirSync(join(SAVED_SETS_FOLDER_PATH, setName)).map(lnk => join(SAVED_SETS_FOLDER_PATH, setName, lnk))
    for (const s of oldShortcuts)
        fs.rmSync(s, { force: true })

    // Create new shortcuts
    for (let i = 0; i <= 5; i++) {
        if (newAudioNames[i] == null) continue
        createAudioShortcutInSetFolder(setName, newAudioNames[i], i)
    }
}



// Utils
function getShortcutTargetBasename(shortcutPath) {
    const parsed = shell.readShortcutLink(shortcutPath)
    const shortcutTarget = parsed.target
    const fileName = basename(shortcutTarget)
    return fileName
}
function getOriginalAudioShortcutNameFromSavedSet(setName, shortcutName) {
    const shortcutPath = join(SAVED_SETS_FOLDER_PATH, setName, shortcutName)
    return getShortcutTargetBasename(shortcutPath)
}
function getSavedSetAudioNames(setName) {
    const setPath = join(SAVED_SETS_FOLDER_PATH, setName)

    const allFilesInside = []
    for (let i = 0; i <= 5; i++) {
        const shortcutName = i + '.lnk'
        const shortcutPath = join(setPath, shortcutName)
        if (fs.existsSync(shortcutPath)) {
            allFilesInside.push(getOriginalAudioShortcutNameFromSavedSet(setName, shortcutName))
        } else {
            allFilesInside.push(null)
        }
    }

    return allFilesInside
}



contextBridge.exposeInMainWorld('NodeCB', {
    saveAudioFilesToLibrary,
    renameLibraryAudioFile,

    createSavedSetFolder,
    renameSavedSetFolder,
    createFavoriteSetFolderAsShortcut,
    updateSavedSetAudioShortcuts,
    getAllSavedSetsWithAudiosData,
    getFirstAvailableSetName,
    getSavedSetAudioNames,

    renameFavoriteSetShortcutFolder,
    createFavoriteSetFolderAsShortcut,
    getAllFavoriteSetNames,
    isSetFavorite,

    createAudioShortcutInSetFolder,
    retargetAudioShortcutInSetFolder,


    getLibraryAudioPath,
    getAllLibraryAudioNames,


    getOriginalAudioShortcutNameFromSavedSet,
    shell,
    fs
})
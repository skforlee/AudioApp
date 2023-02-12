
// This script contains BOTH the browser window AND the Node environment
// It exposes Node functions to the browser window

const { contextBridge, shell } = require('electron')
const createDesktopShortcut = require('create-desktop-shortcuts')
const fs = require('fs')
const { join, resolve, basename } = require('path')
const {
    assertNotNull,
    arrayFromObjectWithNumberKeys,
    playSound
} = require('./preload-js/preload-utils.js')



const LIBRARY_FOLDER_PATH = 'library'
const SAVED_SETS_FOLDER_PATH = 'sets'
const FAVORITES_FOLDER_PATH = 'favorites'



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
function createSavedSetFolder(setName) {
    const setFolderPath = join(SAVED_SETS_FOLDER_PATH, setName)
    if (fs.existsSync(setFolderPath) == false) {
        fs.mkdirSync(setFolderPath)
    }
}
function createFavoriteSetFolderAsShortcut(setName) {
    const setFolderFullPath = resolve(join(SAVED_SETS_FOLDER_PATH, setName))
    if (fs.existsSync(setFolderFullPath) == false)
        throw `Can't make shortcut for set ${setName} because it doesn't exist`
    const shortcutsCreated = createDesktopShortcut({
        windows: {
            filePath: setFolderFullPath,
            outputPath: FAVORITES_FOLDER_PATH
        },
        osx: {
            filePath: setFolderFullPath,
            outputPath: FAVORITES_FOLDER_PATH
        }
    })
    console.log({shortcutsCreated})
}
function getFirstAvailableSetName() {                           // Returns a 'random' set name (for new sets)
    const baseSetPath = join(SAVED_SETS_FOLDER_PATH, 'Set-')
    let i = 1
    while (fs.existsSync(baseSetPath + i)) {
        i += 1
    }
    return `Set-${i}`
}
function createAudioShortcutInSetFolder(audioName, setName) {
    const fullPathToOriginalAudio = resolve(join(LIBRARY_FOLDER_PATH, audioName))
    const pathToShortcutFolder = join(SAVED_SETS_FOLDER_PATH, setName)
    const shortcutsCreated = createDesktopShortcut({
        windows: {
            filePath: fullPathToOriginalAudio,
            outputPath: pathToShortcutFolder
        },
        osx: {
            filePath: fullPathToOriginalAudio,
            outputPath: pathToShortcutFolder
        }
    })
    console.log({shortcutsCreated})
}


function playAudioFromLibrary(audioName) {
    const audioPath = join('..', LIBRARY_FOLDER_PATH, audioName)
    playSound(audioPath)
}
function getOriginalAudioShortcutNameFromSavedSet(setName, shortcutName) {
    const shortcutPath = join(SAVED_SETS_FOLDER_PATH, setName, shortcutName)
    const parsed = shell.readShortcutLink(shortcutPath)
    const shortcutTarget = parsed.target
    const audioName = basename(shortcutTarget)
    return audioName
}
function getSavedSetAudioNames(setName) {
    const setPath = join(SAVED_SETS_FOLDER_PATH, setName)
    const allFilesInside = fs.readdirSync(setPath)
    const realAudioNames = allFilesInside.map(lnk => getOriginalAudioShortcutNameFromSavedSet(setName, lnk))
    return realAudioNames
}



contextBridge.exposeInMainWorld('NodeCB', {
    saveAudioFilesToLibrary,

    createSavedSetFolder,
    createFavoriteSetFolderAsShortcut,
    getFirstAvailableSetName,
    getSavedSetAudioNames,

    createFavoriteSetFolderAsShortcut,
    createAudioShortcutInSetFolder,


    playAudioFromLibrary,


    getOriginalAudioShortcutNameFromSavedSet,
    shell
})
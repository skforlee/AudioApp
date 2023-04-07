# How to work on SFXer:

This document describes everything necessary to continue work and development of SFXer.

## Technologies Used

SFXer is just a web app (website) exported to desktop using Electron.

## Setup

To start working on the project, follow these steps:

1. Download the source code from this link: https://github.com/skforlee/AudioApp
   - Click on the green button [< > Code] and click "Download ZIP"
   - Extract the zip wherever you have access to delete/write files
2. Install Node.js by going to this link: https://nodejs.org/en
   - I recommend installing the "Current" version instead of LTS
3. Install all JS modules required
   - Open a terminal inside the folder of the source code (inside the one you extracted from the ZIP)
     - You can do that by Shift+Right Clicking anywhere inside the folder and clicking "Open Terminal"
     - If that doesn't work, open a terminal anywhere, and type in:
       - `C:` (or whatever your disk is)
       - `C:\path\to\folder`
   - Install the following packages:
     - `npm install electron`
     - `npm install --save-dev @electron-forge/cli`
     - `npm install` (to install the rest automatically)
   - If you get any error messages, follow the instructions given in the terminal.
4. To start the app in developer mode:
   - Go to `index.js` and uncomment this line: // mainWindow.webContents.openDevTools()
   - Run this command: `npm run start`
   - Whenever you want to restart the app if you made changes, focus the console and press Ctrl+Shift+R

## Build

To build the app for windows: - Run this command: `npx electron-builder build` - If this doesn't work, go back one folder (the parent folder of the folder you're in) and create a new folder called "build", then try again. - The final app will be in the "build" folder in the parent folder of the folder of the app - `C:\projects` - `AudioApp` - `build`

# App Structure Explained

There are 3 main types of elements in the app:

- Library Items (each represents an audio)
  - Visible on the left of the app
  - Each library item (audio) is saved as an audio file inside the "library" folder
- Sets
  - Visible on the upper-center of the app
  - Each set is saved as a folder inside the "sets" folder.
  - Each set contains up to 6 audios. Each set folder contains up to 6 shortcuts to files from the "library" folder
  - These shortcuts are named 0, 1, 2, 3, 4 or 5, to preserve their chosen order by the user
- Favorite Sets (bottom-center)
  - Visible on the bottom-center of the app
  - Each favorite set is saved as a shortcut to a set folder, inside the "favorites" folder

# App Code Explained

There is no back-end server. The app is self-contained.
There is no HTTP communication with anything.
No framework is used - it's purely HTML/CSS/JS.
Ocasionally, you will see `query` and `queryAll` - these are just shorthands for `document.querySelector` and `document.querySelectorAll`.

All library items, sets and favorites in the DOM (HTML elements) are created using JavaScript.
Their creation funtions are in `js/dom-creation-functions.js`: - createLibraryItemDom - createSavedSetDom - createFavoriteSetItem
The code for their creation should be self explanatory.

There is a separation between what is normally allowed in on a website and Node.js functionality.
All functions that would normally NOT run on the website, but on a Node.js back-end are in `preload.js`.
They are exported to be visible to the website through an object called `NodeCB` (Node Context Bridge)
All functions in `preload.js` deal with file operations or other such functionalities that can't be handled in a normal browser.

All initialization functions are handled in `scripts.js` (works like a main function)

If you ever need to find a bug, you can start at one of the 3 element creation functions I talked about above and go through the code.
If your issue is related to something else (e.g. the 6 big buttons), see `index.html` or `scripts.js`.

# Future Features

## Testing and Packaging for Mac

you just need a mac machine to be able to run the packaging command (due dmg-license stuff):

```bash
npx electron-builder --mac
```

**Note:** make sure that you've lready installed electron-builder as a dev tool by running this command

```bash
npm install electron-builder --save-dev
```

## Optimizing App's Speed

File reading/writing takes a lot of time, especially when made with sync functions.
It might be worth using async functions for some file read/write operations in `preload.js` (e.g. `fs.writeFile` instead of `fs.writeFileSync`).

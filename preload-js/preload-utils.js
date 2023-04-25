module.exports = {

    assertNotNull(name, ...params) {
        for (let i = 0; i < params.length; i++) {
            if (params[i] == null) {
                throw `Parameter number [${i}] from "${name}" is null`
            }
        }
    },

    arrayFromObjectWithNumberKeys(obj) {
        const newArray = []
        let i = 0
        while (obj[i] != undefined) {   // null is accepted though!
            newArray.push(obj[i])
            i += 1
        }
        return newArray
    },

    playSound(path) {
        const audio = new Audio(path)
        audio.play()
        return audio
    }
}
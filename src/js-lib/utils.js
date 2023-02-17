


// Network and Location

function submitForm(_url, _data, type, callback){
    if(type == null){
        type = 'get'
    }
    $.ajax({
        type : type,
        url : _url + '?' + objectToURLParameters(_data),
        data : {},
        success : function(response){
            callback(response);
        }
    });
}

function doPost(url, data, callback){
    submitForm(url, data, 'post', callback)
}

function doGet(url, data, callback){
    submitForm(url, data, 'get', callback)
}

function getURLParametersAsObject() {
    function paramsToObject(entries) {
      const result = {}
      for(const [key, value] of entries) { // each 'entry' is a [key, value] tupple
        result[key] = value;
      }
      return result;
    }
    const queryString = window.location.search
    const urlParams = new URLSearchParams(queryString)
    return paramsToObject(urlParams)
}
function objectToURLParameters(obj) {
    if(obj == null) return ''
    url = Object.keys(obj).map(function(k) {
        return encodeURIComponent(k) + '=' + encodeURIComponent(obj[k])
    }).join('&')
    return url
}













// Other utilities

function imgToBase64(img, isRegexModifiying) {    // Not sure what the second param is
    const canvas = document.createElement('canvas')
    canvas.width = img.width;
    canvas.height = img.height;
    var ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0);
    var dataURL = canvas.toDataURL("image/png; base64");
    if (isRegexModifiying == false)
        return dataURL
    else 
        return dataURL.replace(/^data:image\/(png|jpg);base64,/, "");
}

function playSound(path) {
    const audio = new Audio(path)
    audio.play()
    return audio
}












// Object and Array utilities
function getRandomProperty(obj) {
    var result;
    var count = 0;
    for (var prop in obj)
        if (Math.random() < 1/++count)
           result = prop;
    return result;
}
function randomOf(...args){
    return args[randomInt(0, args.length - 1)];
}
function randomizeArray(array_a){
    var iRandomize;
    for(iRandomize = 0; iRandomize < array_a.length; iRandomize++){
        var randomizeArrayIndex = randomInt(0, array_a.length - 1);
        var auxRandomize = array_a[iRandomize];
        array_a[iRandomize] = array_a[randomizeArrayIndex];
        array_a[randomizeArrayIndex] = auxRandomize;
    }
}
function arrayFromObjectWithNumberKeys(obj) {
    const newArray = []
    let i = 0
    while (obj[i] != undefined) {   // null is accepted though!
        newArray.push(obj[i])
        i += 1
    }
    return newArray
}
function repeatToArray(repeatWhat, nTimes) {
    const arr = []
    for (let i = 1; i <= nTimes; i++) {
        arr.push(repeatWhat)
    }
    return arr
}
function fillArrayUntilLength(array, withWhat, maxLength) {
    while (array.length < maxLength) {
        array.push(withWhat)
    }
}












// Math
function roundUp(nr, by){
    return (nr - nr%by + by);
}
function roundUp25(nr){
    return (nr - nr%25 + 25);
}
function roundUp50(nr){
    return (nr - nr%50 + 50);
}
function roundDown25(nr){
    return (nr - nr%25);
}
function roundDown50(nr){
    return (nr - nr%50);
}
function round50(nr){
    var roundness = nr%50;
    var complement  = 50 - roundness;
    if(roundness <= complement){
        return nr - roundness;}
    else return nr + complement;
}
function distanceBetween(t1, t2) {
    return Math.sqrt((t1.x - t2.x) * (t1.x - t2.x) + (t1.y - t2.y) * (t1.y - t2.y))
}
function angleBetween(t1, t2) {
    return Math.atan2(t2.y - t1.y, t2.x - t1.x) * 180 / Math.PI
}
function percentChance(chance){	/* Ex: percentChance(20) = 20% chance to return true; */
    var c = randomInt(1, 100);
    if(c <= chance) return true;
    return false;
}
function randomInt(low, high){
    return Math.floor(Math.random() * (high - low + 1) + low);
}









// Strings
function quotify(str){
    return "\"" + str + "\"";
}
function isUpperCase(str){
    if(str == str.toUpperCase()){
        return true;
    }
    return false;
}
function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}












// DOM
function queryAll(q) {
    return Array.from(document.querySelectorAll(q))
}
function query(q) {
    return document.querySelector(q)
}
function removeAllChildren(node){
    while (node.firstChild) {
        node.removeChild(node.firstChild);}
}
const dom = function (str, clickListeners={}) {
    const doc = new DOMParser().parseFromString(str, 'text/html');
    const firstDiv = doc.body.firstChild;
    for (const listenerName of Object.keys(clickListeners)) {
        for (const elem of Array.from(firstDiv.querySelectorAll(listenerName))) {
            elem.addEventListener('click', () => {
                clickListeners[listenerName](firstDiv, elem)
            })
        }
    }
	return firstDiv
}
function isPointInsideDiv(x, y, div) {
    const rect = div.getBoundingClientRect()
    return (x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom)
}
function sortChildren(div, sortFunc) {
    const divChildren = Array.from(div.children)
    divChildren.sort(sortFunc)
    for (const child of divChildren) {
        div.appendChild(child)
    }
}
/**
 * Created by zhannalibman on 24/01/2017.
 */

const readlineSync = require("readline-sync");
const fs = require("fs");
const dataFileName = "data.json";
const menu = [
    "Print current folder",
    "Change current folder",
    "Create file or folder",
    "Delete file or folder",
    "Open file",
    "Quit Program"
];

var shouldQuit = false;
var currentFolderId = 0;
var lastAddedId = 6;
var fsStorage = [];

startApp();

function startApp() {
    loadData();
    printFolderContentById(currentFolderId);
    // app's loop:
    while (!shouldQuit) {
        const selectedMenuOption = printMenu();
        onMenuOptionSelected(selectedMenuOption);
    }
}

/**
 * Loads saved data from file or if there is no such file assigns default value for fsStorage
 * */
function loadData() {
    try {
        const dataJson = fs.readFileSync(dataFileName, {encoding: "utf8"});
        const fsStorageAsArray = JSON.parse(dataJson);
        fromSaveFormat(fsStorageAsArray);
    } catch (err) {
        // fill some initial data
        fsStorage = [
            {
                id: 0, name: "root", children: [
                    { id: 1, name: "sub1", children: [
                        { id: 4, name: "file.txt"},
                        { id: 5, name: "sub3", children: [
                                {id: 6, name: "file2.txt", content: "content2"}
                        ]}
                    ]},
                    { id: 2, name: "sub2", children: []},
                    { id: 3, name: "file1.txt", content: "text"}
                ]
            }
        ]
    }
}

/**
 * Prints user menu
 * */
function printMenu() {
    const selectedMenuOption = readlineSync.keyInSelect(menu, "Please make your choice",{"cancel" : false});
    return selectedMenuOption;
}

/**
 * Handles user's selection in menu
 * */
function onMenuOptionSelected(selectedMenuOption) {
    switch (selectedMenuOption) {
        //Print current folder
        case 0:
            printFolderContentById(currentFolderId);
            break;
        //Change current folder
        case 1:
            changeCurrentFolder();
            break;
        //Create file or folder
        case 2:
            createFileOrFolder();
            break;
        //Delete file or folder
        case 3:
            deleteFileOrFolder();
            break;
        //Open file
        case 4:
            openFile();
            break;
        //Quit Program
        case 5:
            quitProgram();
            break;
        default:
            break;
    }
}
/**
 * Finds current folder by id and prints it
 * @param folderId - the id of the folder
 * */
function printFolderContentById(folderId){
    const folderToPrint = findElementById(folderId);
    printFolderContent(folderToPrint);
}
/**
 * Finds element by its id
 * @param elementId - the id of the element
 * @return element object with given id
 * */
function findElementById(elementId) {
    return findElementRecursive(elementId, fsStorage[0], null).element;
}

/**
 * Finds parent element by id of the child element
 * @param elementId - the id of the child element.
 * @return parent object.
 * */
function findParentByElementId(elementId) {
    return findElementRecursive(elementId, fsStorage[0], null).parent;
}

/**
 * Prints the content of the folder after sorting by type(first folders then files) and alphabetically.
 * @param folderToPrint - object (folder) in the fsStorage which content will be printed
 * */
function printFolderContent(folderToPrint){
    console.log(folderToPrint.name);
    var folderContent = folderToPrint.children;
    //sorting by folder/file and alphabetically
    var sortedFolderContent = folderContent.sort(function(a,b){
        return (isFolder(a) == isFolder(b)) ? (a.name > b.name) : (isFolder(a) < isFolder(b)) });
    for (var i = 0; i < sortedFolderContent.length; i++) {
        console.log("\t" + (sortedFolderContent[i]).name);
    }
}

/**
 * Asks to which folder to go and navigates there
 * */
function changeCurrentFolder() {
    const folderName = readlineSync.question("Change folder to: ");
    if (isNameEmpty(folderName)) {
        return;
    }
    if (folderName == "..") {
        goUp();
    } else {
        goDown(folderName);
    }
}

/**
 * Changes current folder to one level up.
 * */
function goUp() {
    if (currentFolderId === 0) {
        return;
    }
    const parentElement = findParentByElementId(currentFolderId);
    currentFolderId = parentElement.id;
    printFolderContent(parentElement);
}

/**
 * Changes current folder to a specified folder one level down.
 * @param folderName - string, the name of the folder one level down
 * */
function goDown(folderName) {
    const folderToGo = findChildByName(currentFolderId, folderName);
    if (folderToGo == null){
        console.log("Not found");
        return;
    }
    if (!isFolder(folderToGo)){
        console.log(folderName, "is not a folder");
    } else {
        printFolderContent(folderToGo);
        currentFolderId = folderToGo.id;
    }
}

/**
 * Searches for an element with given name among the children of the folder with given id
 * @param folderId - id of the folder where the function searches for the element
 * @param childName - string, the name of the element that is searched for
 * @return child element with matching name
 * */
function findChildByName(folderId, childName){
    const currentFolder = findElementById(folderId);
    for (var i = 0; i < currentFolder.children.length; i++){
        if (currentFolder.children[i].name === childName){
            return currentFolder.children[i];
        }
    }
    return null;
}

/**
 * Searches recursively for an element in fsStorage
 * @param id - integer which is stored in element.id
 * @param element - object from which the function starts search
 * @param parent - parent object of element
 * @return object with element with given id and with parent element.
 * */
function findElementRecursive(id, element, parent) {
    if(element.id === id) {
        return {element: element, parent: parent};
    }
    if (isFolder(element)) {
        for (var i = 0; i < element.children.length; i++) {
            var result = findElementRecursive(id, element.children[i], element);
            if (result.element !== null) {
                return result;
            }
        }
    }
    return {element: null, parent: null};
}

/**
 * Checks that the element is a folder
 * @param element - object in fsStorage
 * @return true if the element is a folder and false if it is a file
 * */
function isFolder (element){
    if (element.children != undefined) {
        return true;
    }
    else{
        return false;
    }
}

/**
 * Creates new file or folder.
 */
function createFileOrFolder() {
    const newFileOrFolderName = readlineSync.question("Please type file/folder name: ");
    if (isNameEmpty(newFileOrFolderName)) {
        return;
    }
    if (findChildByName(currentFolderId, newFileOrFolderName) != null) {
        console.log("Such file/folder already exists.");
        return;
    }
    const fileContent = readlineSync.question("Please write your content: ");
    var newElement = {id: ++lastAddedId, name: newFileOrFolderName};
    if (fileContent.length > 0){
        newElement.content = fileContent;
    }
    else {
        newElement.children = [];
    }
    const currentFolder = findElementById(currentFolderId);
    currentFolder.children.push(newElement);
    printFolderContent(currentFolder);
}

/**
 * Deletes file or folder.
 * */
function deleteFileOrFolder() {
    const nameToBeDeleted = readlineSync.question("Please type file/folder name to be deleted: ");
    if (isNameEmpty(nameToBeDeleted)) {
        return;
    }
    if (nameToBeDeleted == "root") {
        console.log("This folder can not be deleted.");
        return;
    }
    if (readlineSync.keyInYN("Are you sure?")) {
        // 'Y' key was pressed.
        const currentFolder = findElementById(currentFolderId);
        var found = false;
        for (var i = 0; i < currentFolder.children.length; i++){
            if (currentFolder.children[i].name == nameToBeDeleted){
                found = true;
                currentFolder.children.splice(i, 1);
                console.log(nameToBeDeleted, "was deleted.");
                break;
            }
        }
        if (!found) {
            console.log("Not found");
        }
        printFolderContent(currentFolder);
    }
}
/**
 * Displays file content.
 */
function openFile() {
    const fileName = readlineSync.question("Which file to open? ");
    if (isNameEmpty(fileName)) {
        return;
    }
    const file = findChildByName(currentFolderId, fileName);
    if ( file === null) {
        console.log("Not found");
        return;
    }
    if (!isFolder(file)) {
        var hasContent = (file.content != null && file.content != undefined);
        console.log(file.name, hasContent ? ("\n\t" + file.content) : "is empty");
    } else {
        console.log(fileName, "is not a file");
    }
}

/**
 * Asks user for confirmation and quits the program
 * */
function quitProgram() {
    if (readlineSync.keyInYN("Do you want to quit?")) {
        // 'Y' key was pressed.
        try {
            const fsStorageAsArray = toSaveFormat(fsStorage[0], null);
            var data = JSON.stringify(fsStorageAsArray);
            fs.writeFileSync(dataFileName, data, {encoding: "utf8"});
        } catch(err) {
            console.log("Error occurred while saving the data", err.code);
        }
        shouldQuit = true;
    } else {
        return;
    }
}

/**
 * Checks the length of the string, representing file/folder name and prints in the console if it is empty.
 * @param name - entered by the user string
 * @return true if the string empty or false otherwise.
 * */
function isNameEmpty(name) {
    if (name.length === 0) {
        console.log("You didn't enter name.");
        return true;
    } else {
        return false;
    }
}

/**
 * Converts fsStorage to flat array.
 * @param element - element of fsStorage. First time the function is called with root element (fsStorage[0])
 * @param parent - parent element. First time the function is called with null
 * @return saveArray - objects of fsStorage in flat array
 * */
function toSaveFormat(element, parent){
    var saveArray = [objToSaveFormat(element, parent)];
    if (isFolder(element)) {
        for (var i = 0; i < element.children.length; i++) {
             var arr = toSaveFormat(element.children[i], element);
             saveArray = saveArray.concat(arr);
        }
    }
    return saveArray;
}

/**
 * Converts the element to object for array
 * @param obj - object at the runtime format
 * @param parent - parent element of the given object
 * @return object at the save format
 * */
function objToSaveFormat(obj, parent){
    const parentId = parent === null ? null : parent.id;
    const type = isFolder(obj) ? "folder" : "file";
    var element = {id: obj.id, parent: parentId, name: obj.name, type: type};
    if (obj.content != undefined){
        element.content = obj.content;
    }
    return element;
}


/**
 * Converts the object from flat array to object which is suitable for fsStorage as object.
 * @param objectInArray - object from saved array
 * @return object at the runtime format
 * */
function objFromSaveFormat(objectInArray) {
   var objectInTree = {id: objectInArray.id, name: objectInArray.name};
   if (objectInArray.type == "folder") {
       objectInTree.children = [];
   } else if (objectInArray.content != undefined) {
       objectInTree.content = objectInArray.content;
   }
   return objectInTree;
}

/**
 * Converts flat array to fsStorage object
 * @param arr - fsStorage as array (saved format)
 * */
function fromSaveFormat(arr){
    fsStorage = [];
    fsStorage.push(objFromSaveFormat(arr[0]));// "root" always goes first in the array
    lastAddedId = 0;
    for (var i = 1; i < arr.length; i++) {
        //parent is always before child in the array
        findElementById(arr[i].parent).children.push(objFromSaveFormat(arr[i]));
        if (arr[i].id > lastAddedId) {
            lastAddedId = arr[i].id;
        }
    }
}








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
    printCurrentFolder(currentFolderId);
    //app's loop:
    while (!shouldQuit) {
        const selectedMenuOption = printMenu();
        onMenuOptionSelected(selectedMenuOption);
    }
}

function loadData() {
    try {
        var dataJson = fs.readFileSync(dataFileName, {encoding: "utf8"});
        fsStorage = JSON.parse(dataJson);
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

function printMenu() {
    const selectedMenuOption = readlineSync.keyInSelect(menu, "Please make your choice",{"cancel" : false});
    return selectedMenuOption;
}

function onMenuOptionSelected(selectedMenuOption) {
    switch (selectedMenuOption) {
        //Print current folder
        case 0:
            printCurrentFolder(currentFolderId);
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
 * */
function printCurrentFolder(currentFolderId){
    const folderToPrint = findElementById(currentFolderId);
    printFolderContent(folderToPrint);
}
/**
 * @return element object with given id
 * */
function findElementById(elementId) {
    return findElementRec(elementId, fsStorage[0]).element;
}

/**
 * @param elementId - the id of the child element.
 * @return parent object.
 * */
function findParentByElementId(elementId) {
    return findElementRec(elementId, fsStorage[0]).parent;
}

/**
 * Prints the content of the folder after sorting by type(first folders then files) and alphabetically.
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
    if (beenEnteredEmptyName(folderName)) {
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
 * @return child element with matching name
 * */
function findChildByName(folderId, childName){
    const currentFolder = findElementById(folderId);
    for (var i = 0; i < currentFolder.children.length; i++){
        if (currentFolder.children[i].name == childName){
            return currentFolder.children[i];
        }
    }
    return null;
}

/**
 * Searches recursively for an element in fsStorage
 * @param folderId - integer which is stored in element.id
 * @param root - object from which the function starts search
 * @return object with element with given id and with parent element.
 * */
function findElementRec(folderId, root) {
    if(root.id === folderId){
        return {element: root, parent: null};
    }
    var result = {element: null, parent: null};
    if (isFolder(root)) {
        for (var i = 0; i < root.children.length; i++) {
            if (root.children[i].id === folderId){
                return {element: root.children[i], parent: root};
            }
            result = findElementRec(folderId, root.children[i]);
            if (result.element !== null && result.parent !== null) {
                return result;
            }
        }
    }
    return result;
}

/**
 * Checks that the element is a folder
 * */
function isFolder (element){
    if (element["children"] !== undefined){
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
    if (beenEnteredEmptyName(newFileOrFolderName)) {
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
    if (beenEnteredEmptyName(nameToBeDeleted)) {
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
    if (beenEnteredEmptyName(fileName)) {
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
            var data = JSON.stringify(fsStorage);
            fs.writeFileSync(dataFileName, data, {encoding: "utf8"});
        } catch(err) {
            console.log("Error occurred while saving the data", err.code);
        }
        shouldQuit = true;
        process.exit(0);
    } else {
        return;
    }
}

/**
 * Checks the length of the string, representing file/folder name and prints in the console if it is empty.
 * @return true if the string empty or false otherwise.
 * */
function beenEnteredEmptyName(name) {
    if (name.length === 0) {
        console.log("You didn't enter name.");
        return true;
    } else {
        return false;
    }
}







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
var lastAddedId = 4;
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
                id: 0, name: "root", children: [{id: 1, name: "sub1", children: [{id: 4, name: "file.txt"},]},
                { id: 2, name: "sub2", children: []}, {id: 3, name: "file1.txt", content: "text"}
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
            // createFileOrFolder();
            break;
        //Delete file or folder
        case 3:
            // deleteFileOrFolder();
            break;
        //Open file
        case 4:
            // openFile();
            break;
        //Quit Program
        case 5:
            quitProgram();
            break;
        default:
            break;
    }
}


function printCurrentFolder(currentFolderId){
    const folderToPrint = findElementById(currentFolderId, fsStorage[0]);
    printFolderContent(folderToPrint);
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
    var parentId = (fsStorage[findElementById(currentFolderId)])[1];
    currentFolderId = parentId;
    printCurrentFolder(currentFolderId);
}

/**
 * Changes current folder to a specified folder one level down.
 * */
function goDown(folderName) {
    const currentFolder = findElementById(currentFolderId, fsStorage[0]);
    for (var i = 0; i < currentFolder.children.length; i++){
        if (currentFolder.children[i].name == folderName){
            if (!isFolder(currentFolder.children[i])) {
                console.log(folderName, "is not a folder");
                return;
            }
            else{
                printFolderContent(currentFolder.children[i]);
                currentFolderId = currentFolder.children[i].id;
                return;
            }
        }
    }
    console.log("Not found");
}

/**
 * Searches recursively for an element in fsStorage
 * @param folderId - integer which is stored in element.id
 * @param rootElement - object from which the function starts search
 * @return element with given id
 * */
function findElementById(folderId, rootElement) {
    if(rootElement["id"] === folderId){
        return rootElement;
    }
    if (isFolder(rootElement)) {
        var result = null;
        for (var i = 0; i < rootElement["children"].length; i++) {
            if (rootElement.children[i].id === folderId) {
                return rootElement.children[i];
            } else {
                result = findElementById(folderId, rootElement.children[i]);
                if (result != null) {
                    return result;
                }
            }
        }
        return result;
    }
    return null;
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
    if (name.length == 0) {
        console.log("You didn't enter name.");
        return true;
    } else {
        return false;
    }
}







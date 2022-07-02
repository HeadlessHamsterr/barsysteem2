let { ipcRenderer } = require('electron')
let { spawn } = require('child_process')
let mariadb = require('mariadb')
let jQuery = $ = require('jquery');
let fs = require('fs')

require('electron-virtual-keyboard/client')(window, jQuery)

var keyboard = $('.addUserName').keyboard();
var numpad = $('.addUserSpaces').keyboard({
    layout: {
        'normal': [
                    ['7 8 9'],
                    ['4 5 6'],
                    ['1 2 3'],
                    [' 0 {backspace:*}']
                ]
    }
})

let pool = mariadb.createPool({
    host: '192.168.1.71',
    user: 'root',
    password: 'H00gr@ven',
    database: 'barsysteem'
})

let frisDrinks = ["Cola", "Fanta", "Cassis", "Anders"]
let _maxUsersInRow = 5
let _spacesPerCard = 20
let _amountNotFrisDrinks = 3
let _pilsID = 1
let _specID = 2
let _colaID = 3
let _fantaID = 4
let _cassID = 5
let _othID = 6
let _radlID = 7
var users = []
var activeUser;

let updateTimer = setInterval(function checkUpdate(){
    let request = new XMLHttpRequest();

    var updateAvailable = false
    var updateUrl;
    request.onreadystatechange = function() {
        if(this.readyState == 4 && this.status == 200){
            let response = JSON.parse(this.responseText)

            //Get latest version of the app from the GitHub API
            latestVersion = response["tag_name"].toString().replace('V', '');
            //Convert the version string to a list for easier comparing
            latestVersionList = latestVersion.split('.');

            //Get current app version and converting to list
            currentVersion = app.getVersion().toString();
            currentVersionList = currentVersion.split('.')

            console.log(latestVersionList);
            console.log(currentVersionList);

            //Check if a new version is available
            if(parseInt(latestVersionList[0]) > parseInt(currentVersionList[0])){
              updateAvailable = true;
            }else if(parseInt(latestVersionList[1]) > parseInt(currentVersionList[1]) && parseInt(latestVersionList[0]) >= parseInt(currentVersionList[0])){
              updateAvailable = true;
            }else if(parseInt(latestVersionList[2]) > parseInt(currentVersionList[2]) && parseInt(latestVersionList[1]) >= parseInt(currentVersionList[1]) && parseInt(latestVersionList[0]) >= parseInt(currentVersionList[0])){
              updateAvailable = true;
            }

            if(updateAvailable){
                for(asset in response["assets"]){
                    if(response["assets"][asset]["name"].includes('AppImage')){
                        updateUrl = response["assets"][asset]["browser_download_url"]
                        break
                    }
                }
                download(updateUrl, '/home/pi/barsysteem/barsysteemNew.AppImage', (bytes, percent) => waitForDownload(percent))
            }
        }
    }

    request.open("GET", "https://api.github.com/repos/HeadlessHamsterr/barsysteem2/releases/latest")
    request.send()
}, 3600000);

$(document.getElementById('usersMenuDiv')).hide()

//Query database for the users
pool.getConnection().then(conn => {
    conn.query('SELECT * FROM user').then((rows) => {
        for(let i = 0; i < rows.length; i++){
            users.push(rows[i])
        }
        let usersTable = document.getElementById('usersTable')
        var rowToEdit = 0;
        $(usersTable).append(`<tr id="usersRow${rowToEdit}"></tr>`)

        //Loop through all users
        for(let i = 0; i < users.length; i++){

            //Check if the maximum amount of users in a row is reached, if so append a new row
            if(Math.floor(i / _maxUsersInRow) > rowToEdit){
                rowToEdit++
                $(usersTable).append(`<tr id="usersRow${rowToEdit}"></tr>`)
            }

            //Append the user to the row
            let activeRow = document.getElementById(`usersRow${rowToEdit}`)
            $(activeRow).append(`<td><button class="userBtn" onclick=openUser(${i})>${users[i].name}</button></td>`)
        }
    })
})

async function download(
    sourceUrl,
    targetFile,
    progressCallback,
    length
){
    const request = new Request(sourceUrl, {
        headers: new Headers({"Content-Type": "application/octet-stream"}),
    })

    const response = await fetch(request)

    if(!response.ok){
        throw Error(
            `Unable to download update: ${response.status} ${response.statusText}`
        )
    }else{
        const body = response.body
        if(boyd == null){
            throw Error(
                "No response body"
            )
        }

        const finalLength = length || parseInt(response.headers.get("Content-length" || "0"), 10)
        const reader = body.getReader()
        const writer = fs.createWriteStream(targetFile)

        await streamWithProgress(finalLength, reader, writer, progressCallback)
        writer.end()
    }
}

async function streamWithProgress(length, reader, writer, progressCallback){
    let bytesDone = 0

    while(true){
        const result = await reader.read()
        if(result.done){
            if(progressCallback != null){
                progressCallback(length, 100)
            }
            return
        }

        const chunk = result.value;
        if(chunk == null){
            throw Error("Empty chunk received during download")
        }else{
            writer.write(Buffer.from(chunk))
            if(progressCallback != null){
                const percent = length === 0 ? null : Math.floor((bytesDone /length) * 100)
                progressCallback(bytesDone, percent)
            }
        }
    }
}

function waitForDownload(percent){
    if(percent == 100){
        $(document.getElementById('update')).show()
    }else{
        console.log(`Downloading update ${percent}`)
    }
}

async function updateUsers(){
    users = []
    //Query database for the users
    let conn
    try {
        conn = await pool.getConnection()
        const rows = await conn.query('SELECT * FROM user')

        for(let i = 0; i < rows.length; i++){
            users.push(rows[i])
            if(activeUser != null){
                if(users[i].userID == activeUser.userID){
                    activeUser = users[i]
                }
            }
        }
    } finally {
     if(conn){
        conn.release();
     }   
    }
}

function openUser(_localUserID){
    $(document.getElementById('addDrinkcardsDiv')).hide()
    activeUser = users[_localUserID]

    document.getElementById('userName').innerHTML = activeUser.name
    document.getElementById('spaces').innerHTML = "Vakjes: " + activeUser.spaces

    $(document.getElementById('usersDiv')).hide()
    $(document.getElementById('usersTable')).empty()
    $(document.getElementById('usersMenuDiv')).show()
}

async function returnToHome(){
    $(document.getElementById('usersTable')).empty()
    await updateUsers()
    $(document.getElementById('usersMenuDiv')).hide()
    $(document.getElementById("addDrinkcardsDiv")).hide()
    $(document.getElementById('usersDiv')).show()
    let usersTable = document.getElementById('usersTable')

    var rowToEdit = 0;
    $(usersTable).append(`<tr id="usersRow${rowToEdit}"></tr>`)

    //Loop through all users
    for(let i = 0; i < users.length; i++){

        //Check if the maximum amount of users in a row is reached, if so append a new row
        if(Math.floor(i / _maxUsersInRow) > rowToEdit){
            rowToEdit++
            $(usersTable).append(`<tr id="usersRow${rowToEdit}"></tr>`)
        }

        //Append the user to the row
        let activeRow = document.getElementById(`usersRow${rowToEdit}`)
        $(activeRow).append(`<td><button class="userBtn" onclick=openUser(${i})>${users[i].name}</button></td>`)
    }
}

async function orderDrink(drinkType){
    var cost;
    var drinkID;
    switch(drinkType){
        case "Fris":
            cost = 1
            $(document.getElementById('sodaTypePopup')).show()
        break;
        case "Pils":
            cost = 1
            drinkID = _pilsID
        break;
        case "Speciaalbier":
            cost = 2
            drinkID = _specID
        break;
        case "Radler":
            cost = 1
            drinkID = _radlID
        break;
        //The fris drinks are all 1 space and need to close the popup, so they can all be handled together
        default:
            $(document.getElementById('sodaTypePopup')).hide()
            cost = 1
            switch(drinkType){
                case "Cola":
                    drinkID = _colaID
                break;
                case "Fanta":
                    drinkID = _fantaID
                break;
                case "Cassis":
                    drinkID = _cassID
                break;
                case "Anders":
                    drinkID = _othID
                break;
            }
        break;

    }
    console.log(`Ordering ${drinkType} for ${activeUser.name}`)

    if(cost > activeUser.spaces){
        $(document.getElementById('noSpacesPopup')).show()
    }else if(drinkType != "Fris"){
        let conn

        conn = await pool.getConnection()
        var lastAmount = 0
        totalAmount = await conn.query(`SELECT totalAmount FROM drinktransactions WHERE userID = ${activeUser.userID} AND type = ${drinkID} ORDER BY drinkTransactionID DESC;`)
        try{
            if(totalAmount[0].totalAmount != null){
                lastAmount = totalAmount[0].totalAmount
            }
        }catch(e){}

        await conn.query(`INSERT INTO drinktransactions(userID, type, spaceAmount, totalAmount) VALUES(${activeUser.userID},${drinkID},${cost},${lastAmount+1});`)
        await conn.query(`UPDATE user SET spaces = ${activeUser.spaces-cost} WHERE userID = ${activeUser.userID}`)
        let inventory = await conn.query(`SELECT amount FROM inventory WHERE drinkID = ${drinkID}`)
        let lastInvetory = inventory[0].amount
        await conn.query(`UPDATE inventory SET amount = ${lastInvetory-1} WHERE drinkID = ${drinkID}`)

        if(conn){
            conn.release()
        }

        await updateUsers()
        console.log(`Active user: ${activeUser}`)
        document.getElementById('userName').innerHTML = activeUser.name
        document.getElementById('spaces').innerHTML = "Vakjes: " + activeUser.spaces
    }
}

function closeNoCardsPopup(){
    $(document.getElementById("noSpacesPopup")).hide()
}

function showCardOrder(){
    $(document.getElementById("usersMenuDiv")).hide()
    $(document.getElementById("addDrinkcardsDiv")).show()
}

function modifyCards(modification){
    var cardsToBuy = parseInt(document.getElementById("numCardsToBuy").innerHTML);

    switch(modification){
        case 1:
            if(cardsToBuy != 1){
                cardsToBuy = cardsToBuy - 1
            }
        break;
        case 2:
            cardsToBuy = cardsToBuy + 1
        break;
    }
    document.getElementById('numCardsToBuy').innerHTML = cardsToBuy
}

async function buyCards(){
    let numCards = parseInt(document.getElementById('numCardsToBuy').innerHTML)
    if(numCards != 0){
        let conn
        conn = await pool.getConnection()
        var numSpacesNow = 0
        let response = await conn.query(`SELECT spaces FROM user WHERE userID = ${activeUser.userID};`)

        numSpacesNow = parseInt(response[0].spaces)

        let newSpaces = numSpacesNow + (_spacesPerCard * numCards)

        response = await conn.query(`SELECT totalAmount FROM cardtransactions WHERE userID = ${activeUser.userID} ORDER BY cardTransactionID DESC;`)

        let lastTotal = 0
        
        try{
            lastTotal = parseInt(response[0].totalAmount)
        }catch(e){}

        await conn.query(`INSERT INTO cardtransactions(userID, amount, totalAmount) VALUES(${activeUser.userID},${numCards},${lastTotal+numCards})`)
        await conn.query(`UPDATE user SET spaces = ${newSpaces} WHERE userID = ${activeUser.userID}`)

        if(conn){
            conn.release()
        }

        await updateUsers()
        for(let i = 0; i < users.length; i++){
            if(users[i].userID == activeUser.userID){
                openUser(i)
                break
            }
        }
    } 
}

function openMainNav(){
    $(document.getElementById('usersDiv')).hide()
    $(document.getElementById('mainMenu')).show()
}

function closeMainNav(){
    $(document.getElementById('mainMenu')).hide()
    returnToHome()
}

function showMenu(type){
    switch(type){
        case 1:
            if(document.getElementById("addUserArrow").style.transform == "rotate(0deg)"){
                document.getElementById("addUserArrow").style.transform = "rotate(180deg)"
                document.getElementById("remUserArrow").style.transform = "rotate(0deg)"
                $("#remUserDiv").slideUp(300)
                $("#addUserDiv").slideDown(300)
            }else{
                document.getElementById("addUserArrow").style.transform = "rotate(0deg)"
                $("#addUserDiv").slideUp(300)
                $(document.getElementById('addUserName')).css('border-color', 'var(--input-border)');
                $(document.getElementById('addUserSpaces')).css('border-color', 'var(--input-border');
                document.getElementById('addUserName').value = ""
                document.getElementById('addUserSpaces').value = ""
                document.getElementById('addUserErrorSpan').innerHTML = "";
            }
        break;
        case 2:
            if(document.getElementById("remUserArrow").style.transform == "rotate(0deg)"){
                document.getElementById("addUserArrow").style.transform = "rotate(0deg)"
                document.getElementById("remUserArrow").style.transform = "rotate(180deg)"
                $("#remUserDiv").slideDown(300)
                $("#addUserDiv").slideUp(300)
                $(document.getElementById('addUserName')).css('border-color', 'var(--input-border)');
                $(document.getElementById('addUserSpaces')).css('border-color', 'var(--input-border');
                document.getElementById('addUserName').value = ""
                document.getElementById('addUserSpaces').value = ""
                document.getElementById('addUserErrorSpan').innerHTML = "";
            }else{
                document.getElementById("remUserArrow").style.transform = "rotate(0deg)"
                $("#remUserDiv").slideUp(300)
            }
    }
}

async function addUser(){
    let userName = document.getElementById('addUserName').value;
    let spaces = document.getElementById('addUserSpaces').value;

    if(userName == "" && spaces == ""){
        $(document.getElementById('addUserName')).css('border-color', 'red');
        $(document.getElementById('addUserSpaces')).css('border-color', 'red');
        document.getElementById('addUserErrorSpan').innerHTML = "Vul beide vakjes in";
    }else if(userName == ""){
        $(document.getElementById('addUserSpaces')).css('border-color', 'var(--input-border)');
        $(document.getElementById('addUserName')).css('border-color', 'red');
        document.getElementById('addUserErrorSpan').innerHTML = "Vul een naam in";
    }else if(spaces == ""){
        $(document.getElementById('addUserName')).css('border-color', 'var(--input-border)');
        $(document.getElementById('addUserSpaces')).css('border-color', 'red');
        document.getElementById('addUserErrorSpan').innerHTML = "Vul aantal vakjes in";
    }else{
        $(document.getElementById('addUserName')).css('border-color', 'var(--input-border)');
        $(document.getElementById('addUserSpaces')).css('border-color', 'var(--input-border');
        document.getElementById('addUserErrorSpan').innerHTML = "";

        let conn
        conn = await pool.getConnection()
        var queryFailed = false
        try{
            let response = await conn.query(`INSERT INTO user(name, spaces) VALUES ("${userName}",${parseInt(spaces)})`)
        }catch(err){
            console.log(`Error while adding user: ${err}`)
            queryFailed = true
        }

        if(queryFailed){
            $(document.getElementById('addUserName')).css('border-color', 'red');
            $(document.getElementById('addUserSpaces')).css('border-color', 'red');
            document.getElementById('addUserErrorSpan').innerHTML = "Gebruiker toevoegen mislukt."
        }else{
            $(document.getElementById('addUserName')).css('border-color', 'green');
            $(document.getElementById('addUserSpaces')).css('border-color', 'green');
            document.getElementById('addUserErrorSpan').innerHTML = `${userName} toegevoegd met ${spaces} vakjes.`
        }
    }
}

async function remUser(){
    let userID = document.getElementById('remUserName').value

    if(userID == ""){
        $(document.getElementById('remUserName')).css('border-color', 'red');
        document.getElementById('remUserErrorSpan').innerHTML = "Vul een naam in";
    }else{
        $(document.getElementById('remUserName')).css('border-color', 'var(--input-border)');
        document.getElementById('remUserErrorSpan').innerHTML = "";

        let conn
        conn = await pool.getConnection()
        var queryFailed = false
        var userName;
        try{
            userName = await conn.query(`SELECT name FROM user WHERE userID = ${userID}`)
            await conn.query(`DELETE FROM cardtransactions WHERE userID = ${userID}`)
            await conn.query(`DELETE FROM drinktransactions WHERE userID = ${userID}`)
            await conn.query(`DELETE FROM user WHERE userID = ${userID}`)
        }catch(err){
            queryFailed = true
            console.log(`Error while removing user: ${err}`)
        }

        if(queryFailed){
            $(document.getElementById('remUserName')).css('border-color', 'red');
            document.getElementById('remUserErrorSpan').innerHTML = "Gebruiker verwijderen mislukt."
        }else{
            $(document.getElementById('remUserName')).css('boder-color', 'green')
            document.getElementById('remUserErrorSpan').innerHTML = `${userName[0].name} met ID ${userID} is verwijderd.`
        }
    }
}

function returnToActiveUser(){
    for(let i = 0; i < users.length; i++){
        if(users[i].userID == activeUser.userID){
            openUser(i)
            break
        }
    }
}

function resetUserManagement(){
    $(document.getElementById('addUserName')).css('border-color', 'var(--input-border)');
    $(document.getElementById('addUserSpaces')).css('border-color', 'var(--input-border');
    document.getElementById('addUserErrorSpan').innerHTML = "";
    
    $(document.getElementById('remUserName')).css('border-color', 'var(--input-border)');
    document.getElementById('remUserErrorSpan').innerHTML = "";

}

function update(){
    spawn('./update.sh')
    ipcRenderer.send("klaarErmee")
}
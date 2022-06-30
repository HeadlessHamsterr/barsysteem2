let mariadb = require('mariadb')
let $ = require('jquery');

let pool = mariadb.createPool({
    host: 'localhost',
    user: 'root',
    password: 'Fr1t5-PC',
    database: 'barsysteem'
})

let _maxUsersInRow = 4
var users = []
var activeUser;
$(document.getElementById('usersMenuDiv')).hide()

//Query database for the users=
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
            $(activeRow).append(`<td><button class="userBtn" onclick=openUser(${users[i].userID})>${users[i].name}</button></td>`)
        }
    })
})

async function updateUsers(){
    users = []
    console.log(`Empty users: ${users}`)
    //Query database for the users
    let conn
    try {
        conn = await pool.getConnection()
        const rows = await conn.query('SELECT * FROM user')

        for(let i = 0; i < rows.length; i++){
            console.log(rows[i])
            users.push(rows[i])
        }
    } finally {
     if(conn){
        conn.release();
     }   
    }
    console.log(`Filled users: ${users}`)
}

function openUser(userID){
    console.log(userID);
    console.log(users[userID-1])
    activeUser = userID

    document.getElementById('userName').innerHTML = users[userID-1].name
    document.getElementById('spaces').innerHTML = users[userID-1].spaces

    $(document.getElementById('usersDiv')).hide()
    $(document.getElementById('usersTable')).empty()
    $(document.getElementById('usersMenuDiv')).show()
}

function returnToHome(){
    $(document.getElementById('usersMenuDiv')).hide()
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
        $(activeRow).append(`<td><button class="userBtn" onclick=openUser(${users[i].userID})>${users[i].name}</button></td>`)
    }
}

async function orderDrink(drinkType){
    var orderedDrink;
    var cost;
    switch(drinkType){
        case 0:
            orderedDrink = "Fris"
            cost = 1
        break;
        case 1:
            orderedDrink = "Pils"
            cost = 1
        break;
        case 2:
            orderedDrink = "Speciaalbier"
            cost = 2
        break;
    }
    console.log(`Ordering ${orderedDrink} for ${users[activeUser-1].name}`)

    let conn

    conn = await pool.getConnection()
    var lastAmount = 0
    totalAmount = await conn.query(`SELECT totalAmount FROM drinktransactions WHERE userID = ${activeUser} AND type = ${drinkType} ORDER BY drinkTransactionID DESC;`)
    try{
        if(totalAmount[0].totalAmount != null){
            lastAmount = totalAmount[0].totalAmount
        }
        console.log(totalAmount[0])
    }catch(e){}

    await conn.query(`INSERT INTO drinktransactions(userID, type, spaceAmount, totalAmount) VALUES(${activeUser},${drinkType},${cost},${lastAmount+1});`)
    await conn.query(`UPDATE user SET spaces = ${users[activeUser-1].spaces-cost} WHERE userID = ${activeUser}`)

    if(conn){
        conn.release()
    }

    await updateUsers()
    console.log(users[activeUser-1])
    document.getElementById('userName').innerHTML = users[activeUser-1].name
    document.getElementById('spaces').innerHTML = users[activeUser-1].spaces
}
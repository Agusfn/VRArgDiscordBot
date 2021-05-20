import sqlite3 from "sqlite3"



const db = new sqlite3.Database("./databases/data.db", err => {
    if(err) {
        console.log(err.message)
    }
    console.log("Connected to the database.")
})

//db.run("CREATE TABLE persons(name text)")
/*db.run("INSERT INTO persons(name) VALUES (?)", ["Juan"], err => {
    console.log("Row inserted")
})*/

db.all("SELECT * FROM persons", [], (err, rows) => {
    rows.forEach(row => {
        console.log(row)
    })
})

db.close(err => {
    console.log("Closed connection to database")
})
const express = require("express");
const mysql = require("mysql");
const path = require("path");

const app = express(); //initialises express

const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "root",
    port: 3306,
    database: "user-db-project"
});

db.connect( (error) => { // working
    if (error) {
        console.log(error);
    } else {
        console.log("MySQL Connected");
    }
});

app.use(express.urlencoded({extended:false})); //pass front & back
app.use(express.json());

const viewsPath = path.join(__dirname, "/views");

app.set("view engine", "hbs");
app.set("views", viewsPath);

app.get("/", (req, res) => {
        res.render("index");    
});

app.get("/adduser", (req, res) => {
    res.render("adduser");
});

app.post("/adduser", (req, res) => { //mysql injection
    let name = req.body.userName;
    let email = req.body.userEmail;
    let pwrd = req.body.userPassword;

    db.query('INSERT INTO users SET ?', { username: name, email: email, pwrd: pwrd }, (error, results) => {
        /*if (error.errno === 1062) {
            res.send("This is a duplicate email address");
        } else*/ 
        if (error) {
            if (error.errno === 1062) {
                res.send("This is a duplicate email address");
            } else {
            console.log(error);
            res.send("There was an error");
            }
        } else {
            res.send("User has been registered");
        }
    })
});

app.get("/allusers", (req, res) => {
    db.query("SELECT * FROM users", (error, results) => {
        // console.log(results);

        res.render("allusers", {
            users: results
        })
    });
});


app.post("/edituser/:id", (req, res) => { 
    const id =  req.params.id;
    console.log(id);
     
    db.query("SELECT * FROM users WHERE id_num = ?", [id], (error, results) => {
        console.log(results);
        if (error) {
            console.log(error)
            res.send("it's gone wrong")
        } else {
            res.render("edituser", {
                users: results
            })
        }
        
    }); 
});

app.post("/edituser/:id", (req, res) => { //updates user
    const id =  req.params.id;
    let name = req.body.userName;
    let email = req.body.userEmail;
    let pwrd = req.body.userPassword;

    const query = "UPDATE users SET username = ?, email = ?, pwrd = ? WHERE id_num = ?"; // ?=positional parameters
    const user = [name, email, pwrd, id];

    db.query(query, user, (error, results) => { //use variable to stop it being really long & difficult to read
        if (error) {
            console.log(error);
            res.send("There was an error");
        } else {
            res.send("User has been updated"); 
        }
    }); 

});

app.post("/deleteuser/:id", (req, res) => { //updates user
    const id =  req.params.id;
    console.log(id);

    db.query("SELECT * FROM users WHERE id_num = ?", [id], (error, results) => {
        // console.log(results);

        res.render("deleteuser", {
            users: results
        })
    });

    db.query("DELETE FROM users WHERE id_num = ?", [id], (error, results) => {
        if (error) {
            console.log(error);
            res.send("There was an error deleting the user")}
    }); 

});
 
app.get("*", (req, res) => {
    res.render("error");
})

app.listen(5000, () => {
    console.log("Server started on Port 5000");
});
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

const publicDirectory = path.join(__dirname, '/public');

app.use(express.static(publicDirectory));

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
        if (error) {
            if (error.errno === 1062) {
                res.render("adduser", {
                    error: "This is a duplicate email address"
                })
            } else {
            console.log(error);
            res.render("problem")
            }
        } else {
            res.render("adduser", {
                message: "User has been registered"
            })
        }
    })
});

app.get("/allusers", (req, res) => {
    db.query("SELECT * FROM users", (error, results) => {
        res.render("allusers", {
            users: results
        })
    });
});


app.get("/edituser/:id", (req, res) => { 
    const id =  req.params.id;
    console.log(id);
     
    db.query("SELECT * FROM users WHERE id_num = ?", [id], (error, results) => {
        console.log(results);
        if (error) {
            console.log(error)
            res.render("problem")
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
            if (error.errno === 1062) {
                db.query("SELECT * FROM users WHERE id_num = ?", [id], (error, results) => {
                    console.log(results);
                    if (error) {
                        console.log(error)
                        res.render("problem")
                    } else {
                        res.render("edituser", {
                            users: results,
                            error: "This is a duplicate email address"
                        })
                    }
                    
                }); 
            } else {
            console.log(error);
            res.render("problem")
            }
        } else {
            res.render("edituser", {
                message1: "User has been updated"
            })
        }
    }); 


});

app.get("/deleteuser/:id", (req, res) => { //updates user
    const id =  req.params.id;
    console.log(id);

    db.query("SELECT * FROM users WHERE id_num = ?", [id], (error, results) => {

        res.render("deleteuser", {
            users: results
        })
    });

    db.query("DELETE FROM users WHERE id_num = ?", [id], (error, results) => {
        if (error) {
            console.log(error);
            res.render("problem")}
    }); 

});
 
app.get("*", (req, res) => {
    res.render("error");
})

app.listen(5000, () => {
    console.log("Server started on Port 5000");
});
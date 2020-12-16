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
        if (error.errno === 1062) {
            res.send("This is a duplicate email address");
        } else if (error) {
            // console.log(error);
            res.send("There was an error");
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

app.get("/edituser", (req, res) => { 
    
    let id = req.body.userId; //works if i hard code number here
    console.log(id);
    let pwrd = req.body.userPassword;
    console.log(pwrd);
    

    db.query("SELECT * FROM users WHERE id_num = ?", [8],/*{ id_num: id }, */(error, results) => {
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
    
    // res.render("edituser")
});

// app.post("/edituser/:id_num", (req, res) => { //updates user
//     const id =  req.params.id_num;
//     let name = req.body.userName;
//     let email = req.body.userEmail;
//     let pwrd = req.body.userPassword;

//     const query = "UPDATE users SET name = ?, email = ?, pwrd = ? WHERE id = ?"; // ?=positional parameters
//     const user = [name, email, pwrd, id];

//     db.query(query, user, (error, results) => { //use variable to stop it being really long & difficult to read
//         if (error) {
//             res.send("There was an error");
//         } else {
//             res.send("User has been updated"); 
//         }
//     }); 

// });

// app.get("/update", (req, res) => {
//     res.render("update");
// });

// app.post("/update/:userID", (req, res) => { //user ID is a variable the colon represents a url parameter
//     console.log(req.params.userID); // lets you grab the variable

//     // pulling data from form
//     const name = req.body.userName;
//     const age = req.body.userAge;
//     const location = req.body.userLocation;
//     const job = req.body.userJob;

//     const id =  req.params.userID;

//     const query = "UPDATE users SET name = ?, age = ?, location = ?, job = ? WHERE id = ?"; // ?=positional parameters
//     const user = [name, age, location, job, id];

//     db.query(query, user, (error, results) => { //use variable to stop it being really long & difficult to read
//         if (error) {
//             res.send("There was an error");
//         } else {
//             res.send("User has been updated"); 
//         }
//     }); 


// });

// app.get("/delete", (req, res) => {
//     res.render("deleteUser");
// })

// app.post("/delete/:userID", (req, res) => {
//     const id =  req.params.userID;

//     let query = "DELETE FROM users WHERE id = ?"; //delete query
//     let user = [id]; //the item you want to pass

//     db.query(query, user, (error, results) => {
//         if (error) {
//             res.send("There was an error deleting the user");
//         } else {
//             res.send("User has been deleted"); 
//         }
//     });
// })

app.listen(5000, () => {
    console.log("Server started on Port 5000");
});
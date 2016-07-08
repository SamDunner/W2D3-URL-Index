require('dotenv').config();
const express = require("express");
const connect = require("connect");
const methodOverride = require("method-override");
const mongodb = require("mongodb");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");

const app = express();
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(methodOverride('_method'));
app.use(cookieParser());

const PORT = process.env.PORT || 8080;
const MONGODB_URI = process.env.MONGODB_URI;
const MongoClient = mongodb.MongoClient;

function generateRandomString() {
  let randomString = "";
  let charSet = "abcdefghijklmnopqrstuvwxyz0123456789";
  for(var i = 0; i < 6; i++) {
    randomString += charSet.charAt(Math.floor(Math.random() * charSet.length));
  };
  return randomString;
};

let dbInstance;

MongoClient.connect(MONGODB_URI, (err, db) => {
  if (err) { throw err; }
  console.log(`Successfully connected to DB: ${MONGODB_URI}`);
  dbInstance = db;
});

app.get("/urls", (req, res) => {
  dbInstance.collection('urls').find().toArray((err, doc) => {
    let templateVars = {
      urls: doc,
      username: req.cookies["username"]
    }
    res.render("urls_index", templateVars);
  });
});

app.get("/", (req, res) => {
  let templateVars = {
    username: req.cookies["username"]
  }
  res.render("urls_new", templateVars);
});

app.get("/urls/new", (req, res) => {
  let templateVars = {
    username: req.cookies["username"]
  }
  res.render("urls_new", req.cookies["usernames"]);
});

app.post("/login", (req, res) => {
  res.cookie("username", req.body.username)
  res.redirect("/");
});

app.post("/urls", (req, res) => {
  dbInstance
    .collection('urls')
    .insertOne({shortURL: generateRandomString(),
                longURL: req.body.URL},
               (err, doc) => {
                 res.redirect("/urls");
               });
});

app.get("/u/:id", (req, res) => {
  dbInstance
    .collection('urls')
    .findOne({shortURL: req.params.id},
             (err, doc) => {
               res.redirect(doc.longURL);
             });
});

app.get("/urls/:id", (req, res) => {
  dbInstance
    .collection('urls')
    .findOne({shortURL: req.params.id},
             (err, doc) => {
                let templateVars = {
                  shortURL: doc.shortURL,
                  longURL: doc.longURL,
                  username: req.cookies["username"]
                }
                res.render("urls_edits", templateVars);
             });
});

app.get("/urls/:id/edit", (req, res) => {
  dbInstance
    .collection('urls')
    .findOne({shortURL: req.params.id},
             (err, doc) => {
                let templateVars = {
                  shortURL: doc.shortURL,
                  longURL: doc.longURL,
                  username: req.cookies["username"]
                }
               res.render("urls_show", templateVars);
             });
});

app.put("/urls/:id", (req, res) => {
  dbInstance
    .collection('urls')
    .updateOne({shortURL: req.params.id},
               {$set: {longURL: req.body.newURL}},
               (err, doc) => {
                 res.redirect("/urls");
               });
});

app.delete("/urls/:id", (req, res) => {
  dbInstance
    .collection('urls')
    .deleteOne({shortURL: req.params.id}, (err, doc) => {
      res.redirect("/urls");
    });
});

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
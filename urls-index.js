var express = require("express");
var app = express();
app.set("view engine", "ejs");

var connect = require('connect');
var methodOverride = require('method-override');

const MongoClient = require("mongodb").MongoClient;
const MONGODB_URI = "mongodb://127.0.0.1:27017/url_shortener";



var PORT = process.env.PORT || 8080; // default port 8080


var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};


const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

let dbInstance;

MongoClient.connect(MONGODB_URI, (err, db) => {
  if (err) {
    throw err;
  }
  console.log(`Successfully connected to DB: ${MONGODB_URI}`);
  dbInstance = db;
});


app.use(methodOverride('_method'));


app.get("/urls", (req, res) => {
  dbInstance.collection('urls').find().toArray((err, doc) => {
  let templateVars = {urls: doc};
  res.render("urls_index", templateVars);
  });
});


app.delete("/urls/:id", (req, res) => {
    dbInstance.collection('urls').deleteOne({shortURL:req.params.id}, (err, doc) => {
    res.redirect("/urls");
  });
});

// function remove(db, id, cb) {
//   let filter = { _id: Mongo.ObjectId(id) };
//   db.collection("todos").deleteOne(filter, cb);
//   delete urlDatabase[req.params.id];
// }

app.put("/urls/:id/edit", (req, res) => {

  dbInstance.collection('urls').updateOne({shortURL:req.params.id},
                                          {$set: {longURL: req.body.newURL}},
                                          (err, doc) => {
    res.redirect("/urls");
  });
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls/:id/edit", (req, res) => {
  dbInstance.collection('urls').findOne({shortURL:req.params.id}, (err, doc) => {
  res.render("urls_show", doc);
  });
});

app.get("/urls/:id", (req, res) => {
    dbInstance.collection('urls').findOne({shortURL:req.params.id}, (err, doc) => {
      res.render("urls_edits", doc);
    });

});

// app.get("/urls/:id", (req, res) => {
//   let templateVars = { shortURL: req.params.id,
//                        urls: urlDatabase };
//   res.render("urls_edits", templateVars);
// });






app.post("/urls", (req, res) => {

  function generateRandomString() {
  let randomString = "";
  let charSet = "abcdefghijklmnopqrstuvwxyz0123456789";
    for(var i=0; i < 6; i++) {
      randomString += charSet.charAt(Math.floor(Math.random() * charSet.length));
    }
    return randomString
  }

  var inputURL = req.body.URL
  var randomCode = generateRandomString();
    dbInstance.collection('urls').insertOne({shortURL: randomCode, longURL: inputURL}, (err, doc) => {
  res.redirect("/urls");
  });
});

// app.get("/u/:shortURL", (req, res) => {
//   let shortURL = {randomCode: req.params.shortURL };
//   let longURL = urlDatabase[shortURL]
//   res.redirect(longURL);
// });



app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});









// app.get("/", (req, res) => {
//   res.end("Hello!");
// });

// app.get("/urls.json", (req, res) => {
//   res.json(urlDatabase);
// });

// app.get("/hello", (req, res) => {
//   res.end("<html><body>Hello <b>World</b></body></html>\n");
// });


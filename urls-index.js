"use strict";

var express = require("express");
var app = express();
app.set("view engine", "ejs");

var connect = require('connect');
var methodOverride = require('method-override');


var PORT = process.env.PORT || 8080; // default port 8080



var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};


const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

app.use(methodOverride('_method'));


app.get("/urls", (req, res) => {
  let templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.delete("/urls/:id", (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect("/urls");
});

//   if (req.body && typeof req.body === 'object' && '_method' in req.body) {
//     //look in urlencoded post bodies and delete it
//     var method = req.body._method
//     delete req.body._method
//     return method
//   }
// }))


app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls/:id", (req, res) => {
  let templateVars = { shortURL: req.params.id,
                       urls: urlDatabase };
  res.render("urls_show", templateVars);
});

app.post("/urls", (req, res) => {

  function generateRandomString() {
  let randomString = "";
  let charSet = "abcdefghijklmnopqrstuvwxyz0123456789";
    for(var i=0; i < 6; i++) {
      randomString += charSet.charAt(Math.floor(Math.random() * charSet.length));
    }
    return randomString
  }

  var inputURL = req.body.longURL
  var randomCode = generateRandomString();
  urlDatabase[randomCode]=inputURL;
  console.log(urlDatabase);
  res.redirect("/urls");

});

app.get("/u/:shortURL", (req, res) => {
  let shortURL = {randomCode: req.params.shortURL };
  let longURL = urlDatabase[shortURL]
  res.redirect(longURL);
});



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




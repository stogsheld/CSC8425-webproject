var sqlite3 = require('sqlite3').verbose();
var express = require('express');
var http = require('http');
var path = require("path");
var bodyParser = require('body-parser');


var app = express();
var server = http.createServer(app);
server.listen(8080,function(){
    console.log("Server listening on port: 8080");
});

let db = new sqlite3.Database(':memory:', (err) => {
  if (err) {
    return console.error(err.message);
  }
  console.log("Connected to the in-memory SQlite database. We're up and running!");
});

app.use(bodyParser.urlencoded({extended: false}));
app.use(express.static(path.join(__dirname,'../')));


app.get('/', function(req,res){
  res.sendFile(path.join(__dirname,'../audition-form.html'));
});

// add extra fields here as type TEXT
db.run('CREATE TABLE IF NOT EXISTS aud(username TEXT, forename TEXT, surname TEXT, dob TEXT, address TEXT, postcode TEXT, email TEXT, phonenumber TEXT, showList TEXT, songList TEXT, otherShowChoice TEXT, contactSMS TEXT, contactEmail TEXT, contactPost TEXT, mailingPreferences TEXT, comments TEXT)');

/* these following functions will require editing to accept more or different field values */

// View
app.post('/view', function(req,res){
  db.serialize(()=>{
    db.each('SELECT username USERNAME, forename ID, surname NAME, dob DOB, address ADDRESS, postcode POSTCODE, email EMAIL, phonenumber PHONENUMBER, showList SHOWLIST, songList SONGLIST, otherShowChoice OTHERSHOWCHOICE, contactSMS CONTACTSMS, contactEmail CONTACTEMAIL, contactPost CONTACTPOST, mailingPreferences MAILINGPREFERENCES, comments COMMENTS FROM aud WHERE username =?', [req.body.username], function(err,row){

      if(err){
        res.send("Error encountered while displaying");
        return console.error(err.message);
      }
      res.send(` Username: ${row.USERNAME}, Forename: ${row.ID}, Surname: ${row.NAME}, Date of Birth: ${row.DOB}, Address: ${row.ADDRESS}, Postcode: ${row.POSTCODE}, Email: ${row.EMAIL}, Phone Number: ${row.PHONENUMBER}, Show Selection: ${row.SHOWLIST}, Song Selection: ${row.SONGLIST}, Other Show Choice: ${row.OTHERSHOWCHOICE}, Contact by SMS?: ${row.CONTACTSMS}, Contact by Email?: ${row.CONTACTEMAIL}, Contact by Post?: ${row.CONTACTPOST}, Subscribed to mailing list?: ${row.MAILINGPREFERENCES}, Comments: ${row.COMMENTS}`);
      console.log("Entry displayed successfully");
    });
  });
});


// Insert
app.post('/add', function(req,res){
  db.serialize(()=>{
    db.run('INSERT INTO aud(username,forename,surname,dob,address,postcode,email,phonenumber,showList,songList,otherShowChoice,contactSMS,contactEmail,contactPost,mailingPreferences,comments) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)', [req.body.username, req.body.forename, req.body.surname, req.body.dob, req.body.address, req.body.postcode, req.body.email, req.body.phonenumber, req.body.showList, req.body.songList, req.body.otherShowChoice, req.body.contactSMS, req.body.contactEmail, req.body.contactPost, req.body.mailingPreference, req.body.comments], function(err) {
      if (err) {
        return console.log(err.message);
      }
      console.log("New auditionee has been added");
      res.send("New auditionee has been added into the database with username = " + req.body.username + ", forename = "+req.body.forename+ ", surname = "+req.body.surname + ", Date of birth = " + req.body.dob + ", Address = " + req.body.address + ", Postcode = " + req.body.postcode + ", Email Address = " + req.body.email + ", Phone Number = " + req.body.phonenumber + ", Show Chosen = " + req.body.showList + ", Song Chosen = " + req.body.songList + ", Other Show Choice = " + req.body.otherShowChoice + ", Contact by SMS? = " + req.body.contactSMS + ", Contact by Email = " + req.body.contactEmail + ", Contact by Post? = " + req.body.contactEmail + ", Mailing List Preferences = " + req.body.mailingPreference + ", Comments = " + req.body.comments);
    });
});
});

//UPDATE
app.post('/update', function(req,res){
  db.serialize(()=>{
    db.run('UPDATE aud SET surname = ? WHERE username = ?', [req.body.surname,req.body.username], function(err){
      if(err){
        res.send("Error encountered while updating");
        return console.error(err.message);
      }
      res.send("Entry updated successfully");
      console.log("Entry updated successfully");
    });
  });
});


//DELETE
app.post('/delete', function(req,res){
  db.serialize(()=>{
    db.run('DELETE FROM aud WHERE username = ?', req.body.username, function(err) {
      if (err) {
        res.send("Error encountered while deleting");
        return console.error(err.message);
      }
      res.send("Entry deleted");
      console.log("Entry deleted");
    });
  });
});



app.get('/close', function(req,res){
  db.close((err) => {
    if (err) {
      res.send('There is some error in closing the database');
      return console.error(err.message);
    }
    console.log('Closing the database connection.');
    res.send('Database connection successfully closed');
  });
});



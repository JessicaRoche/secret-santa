/*
* @Author: Ali
* @Date:   2017-02-22 11:00:40
* @Last Modified by:   Ali
* @Last Modified time: 2017-02-24 04:52:00
*/

/******** Requiring libraries ********/
var express = require('express');
var bodyParser= require('body-parser');
var app = express();
var MongoClient = require('mongodb').MongoClient;



/******** Setting ********/
app.use(bodyParser.urlencoded({extended: true}));
app.set('port', 3000);
var config = require('./config/config.js');
var db;
MongoClient.connect( config.mongoLaClient, (err, database) => {
    if (err) return console.log(err);
    db = database;
    app.listen(app.get('port'), function(){
        console.log('Server is listening on port ' + app.get('port') + '. Press CTRL-C to terminate.');
    });
});
app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/app'));
app.use(bodyParser.json());

/******** Routing ********/
app.get('/', (req, res) => {
    //res.sendFile(__dirname + '/app/index.html');
    var cursor = db.collection('gifters').find().toArray(function(err, results) {
         if (err) return console.log(err);
         res.render('index.ejs', {gifters: results});
    });
});

app.post('/register', (req, res) => {
    if (req.body.name.length !== 0 && req.body.email.length !== 0 && req.body.pass.length !== 0){
        var newGifter = {};
        newGifter.name = req.body.name.toLowerCase();
        newGifter.spouse = req.body.spouse.toLowerCase();
        newGifter.match = '';

        db.collection('gifters').save(newGifter, (err, result) => {
            if (err) return console.log(err);
            console.log('saved to database');
            res.redirect('/');
            });
    } else {
        res.redirect('/');
    }
});

app.put('/update/:name', (req, res) => {
    var gifter = req.params.name;
    db.collection('gifters').findOneAndUpdate( 
        {
            query: {name: gifter},
            update: {$set:{
                name: req.body.name,
                spouse: req.body.spouse
            }}, function(err, result){
                res.send(result);
            }
        }
        );
});

app.delete('/delete/:name', function (req, res) {
    var gifter = req.params.name;
    db.candidateList.findOneAndDelete(
        {
            query: { name: gifter}, 
            function (err, result) {
                res.json(result);
            }
        });
});


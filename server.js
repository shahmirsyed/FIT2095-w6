let express = require('express');
const mongoose = require('mongoose');
let app = express();
let bodyParser = require('body-parser');
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

app.use(express.static('images'));
app.use(express.static('css'));

var randomstring = require("randomstring");

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({
    extended: false
}));

var viewPath = __dirname + "/views";
app.listen(8080);


// Connection URL
const url = 'mongodb://localhost:27017/FIT2095';


const Author = require('./models/author-schema');
const Book = require('./models/book-schema');

// var reference to the db
// let db;

// MongoClient.connect(url, {useNewUrlParser: true}, function (err, client) {
//     if (err) {
//         console.log('Err  ', err);
//     } else {
//         console.log("Connected successfully to server");
//         db = client.db('FIT2095');
//     }
// });

mongoose.connect(url, {useNewUrlParser: true}, function (err){
    if (err) {
            console.log('Error: could not connect to the server  ', err);
    } else {
        console.log("Connected successfully to server");
    }


    //home page
    app.get('/', function(req, res){
        res.sendFile(viewPath + '/index.html');
    })

    app.get('/newbook', function(req, res){
        res.sendFile(viewPath + '/newbook.html');
    })

    app.post('/newbook', function(req, res){
        let bookDetails = req.body;
        let curIsbn = randomstring.generate(13);
        let book;
        console.log(bookDetails);
        if (bookDetails.dop === ''){
            book = new Book({
                _id: new mongoose.Types.ObjectId(),
                title: bookDetails.title,
                isbn: curIsbn,
                author: bookDetails.author,
                summary: bookDetails.summary
            })
        }
        else{
            book = new Book({
                _id: new mongoose.Types.ObjectId(),
                title: bookDetails.title,
                isbn: curIsbn,
                author: bookDetails.author,
                dateOfPublication: bookDetails.dop,
                summary: bookDetails.summary
            })
        }
        
        book.save(function (err){
            if (err){
                res.render('invalid-data', {msg: "The book details are invalid. "})
            }
            else{
                Author.findByIdAndUpdate(book.author._id, { $inc: {numBooks: 1}}, 
                    function(err, docs){
                        if (err){
                            res.render('invalid-data', {msg: "Error occurred when incrementing the author's number of books."});
                        }
                        else{
                            console.log("Updated author numBooks: " + docs.numBooks);
                        }
                })
                res.redirect('/getbooks');
            }
        });
    })

    app.get('/getbooks', function(req, res){
        Book.find({}).populate('author').exec(function (err, bookDb) {
            if (bookDb.length == 0){
                res.render('listbooks', { data: [{isbn:'',  title: '', dop: '',
                    author: '', summary: ''}] });
            }
            else{
                res.render('listbooks', { data: bookDb });
            }
            
        });
    })

    app.get('/updatebook', function (req, res) {
        res.sendFile(viewPath + '/updatebook.html');
    });


    app.post('/updatebook', function(req, res){

        let bookDetails = req.body;
        let filter = { isbn: bookDetails.isbn };
        let theUpdate = { $set: { title: bookDetails.title, dateOfPublication: bookDetails.dop,
            author: bookDetails.author, summary: bookDetails.summary } };
            // if any field is undefined display invalid data
        if ( !bookDetails.title || !bookDetails.dop || !bookDetails.isbn ||
            !bookDetails.author || !bookDetails.summary){
            res.render('invalid-data', {msg: "You have to fill out all the form details to update the book's properties."} )
        }
        Book.updateOne(filter, theUpdate, function (err, doc){
            if (err){
                console.log("error occurred when updating the book details.");
            }
            else{
                res.redirect('/getbooks');
            }
        });
    })

    app.get('/deletebook', function(req,res){
        res.sendFile(viewPath + '/delete-book.html');
    })

    app.post('/deletebook', function(req, res){
        let bookDetails = req.body;
        let filter = { isbn: bookDetails.isbn };
        Book.deleteOne(filter, function(err, docs){
            if (err){
                res.render("invalid-data",{msg: "Books isbn provided is invalid."});
            }
            else{
                res.redirect('/getbooks');
            }
        });
    })

    app.get('/delete-by-isbn/:isbn', function(req, res){
        let filter = {isbn: req.params.isbn};
        Book.deleteOne(filter, function(err, docs){
            if (err){
                res.render("invalid-data",{msg: "Books isbn provided is invalid."});
            }
            else{
                res.redirect('/getbooks');
            }
        });
        
    })

    app.get('/newauthor', function(req,res){
        res.sendFile(viewPath + '/newauthor.html');
    })

    app.post('/newauthor', function(req, res){
        let authorDetails = req.body;
        let author = new Author({
            _id: new mongoose.Types.ObjectId(),
            name: {firstName: authorDetails.firstName, lastName: authorDetails.lastName },
            dateOfBirth: authorDetails.dob,
            address: {state: authorDetails.state, unit: authorDetails.unit,  street: authorDetails.street, suburb: authorDetails.suburb },
            numBooks: authorDetails.numBooks
        });
        author.save(function(err){
            if (err){
                res.render("invalid-data",{msg: "Author details provided are invalid."});
            }
            else{
                res.redirect('/getauthors');
            }
        })
        

    });

    app.get('/getauthors', function(req, res){
        Author.find({}, function (err, authorDb) {
            if (authorDb.length == 0){
                res.render('listauthors', { data: [
                    { name:{firstName:"", lastName:""},  
                    dateOfBirth: '', 
                    address: {
                        state:'', suburb:'', unit:''
                    }, 
                    numBooks: 0
                    }
                ] });
            }
            else{
                res.render('listauthors', { data: authorDb });
            }  
        });
    })

    app.get('/updateauthor', function(req, res){
        res.sendFile(viewPath + '/updateauthor.html');
    });

    app.post('/updateauthor', function(req, res){
        let authorDetails = req.body;
        let filter = { _id: authorDetails.id };
        let theUpdate = { $set: {numBooks: authorDetails.numBooks } };
            // if any field is undefined display invalid data
        if ( !authorDetails.numBooks){
            res.render('invalid-data', {msg: "You have to have something in number of books to update it to update the author's details."});
        }
        Author.findByIdAndUpdate(filter, theUpdate , function(err, doc){
            if (err){
                res.render('invalid-data', {msg: "There was an error when updating the author's number of books."});
            }
            else{
                res.redirect('/getauthors');
            }    
        });
        
    });

    app.get('/*', function(req,res){
        res.sendFile(viewPath + '/error.html')
    });



});

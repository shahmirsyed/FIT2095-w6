const mongoose = require('mongoose');

let bookSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    title: {
        type: String,
        required: true
    },
    isbn: {
        type: String,
        validate: {validator: function(isbnStr){
                return isbnStr.length == 13;
            },
            message: "The length of the isbn should be 13."
        }
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Author'
    },
    dateOfPublication: {
        type: Date,
        default: Date.now
    },
    summary: String
});

module.exports = mongoose.model('Book', bookSchema);
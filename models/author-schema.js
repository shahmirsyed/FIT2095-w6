const mongoose = require('mongoose');

let authorSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    name: {
        firstName: {
            type: String,
            required: true
        },
        lastName: String
    },
    dateOfBirth: {
        type: Date
    },
    address: {
        state: {
            type: String,
            validate: {validator: function(st){
                        return st.length >= 2 && st.length <= 3;
                },
                message: "The state should be at least 2 and not more than 3 characters long."
            }
        },
        unit: String,
        street: String,
        suburb: String
    },
    numBooks: {
        type: Number,
        min: 1, max: 150,
        message: "Number of books should be between the range 1 and 150 (inclusive)."
    }
});


module.exports = mongoose.model('Author', authorSchema);
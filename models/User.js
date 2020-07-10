const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const UserSchema = new Schema(
    {
       username: {type: String, required: true},
       email: {type: String, required: true},
       password: {type: String, required: true},
       username_lower : {type: String, required: true},
       elo: {type: Number, required: true}
    }
);

module.exports = mongoose.model('User', UserSchema);
// api's User.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    username: String,
    password: String,
    role: {
        type: String,
        default: 'user'
    },
    // other fields...
});
const UserModel = mongoose.model('User', UserSchema);

module.exports = mongoose.model('User', UserSchema);
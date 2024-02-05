// api's Post.js
const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const CommentSchema = new Schema({
    content: String,
    author: { type: Schema.Types.ObjectId, ref: 'User' },
    createdAt: { type: Date, default: Date.now }
});

const PostSchema = new Schema({
    title: String,
    summary: String,
    content: String,
    cover: String,
    author: { type: Schema.Types.ObjectId, ref: 'User' },
    comments: [CommentSchema]
}, {
    timestamps: true,
});

const PostModel = model('Post', PostSchema);

module.exports = PostModel;

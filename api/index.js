// index.js
const express = require('express');
const cors = require('cors');
const mongoose = require("mongoose");
const User = require('./models/User');
const Post = require('./models/Post');
const bcrypt = require('bcryptjs');
const app = express();
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const multer= require('multer');
const uploadMiddleware = multer({ dest: 'uploads/' })
const fs = require('fs');
const router = express.Router();


const salt = bcrypt.genSaltSync(10);
const secret = 'jfgosduft908erjfklsdf';

app.use(cors({credentials:true,origin:'http://localhost:3000'}));
app.use(express.json());
app.use(cookieParser());
app.use('/uploads', express.static(__dirname+'/uploads'));
mongoose.connect('mongodb+srv://blog:ksn3TK8GYLOOxqI1@cluster0.zv4ffnn.mongodb.net/?retryWrites=true&w=majority');

app.post('/register', async (req,res) => {
    const {username,password} = req.body;
    try{
        const userDoc = await User.create({
        username,
        password:bcrypt.hashSync(password,salt),
    });
        res.json(userDoc);

    } catch(e) {
        console.log(e)
        res.status(400).json(e);
    }
});

app.post('/login', async (req,res) => {
    const {username, password} = req.body;
    const userDoc = await User.findOne({username});
    const passOk = bcrypt.compareSync(password, userDoc.password);
    if(passOk){
       //logged in
       jwt.sign({username,id:userDoc._id}, secret, {}, (err, token) => {
        if (err) throw err;
        res.cookie('token', token).json({
            id:userDoc._id,
            username,
        });
       });
    }else{
        res.status(400).json('wrong credentials');
    }
});

app.get('/profile', async (req, res) => {
    const { token } = req.cookies;
    if (token) {
        jwt.verify(token, secret, async (err, user) => {
            if (err) {
                res.status(401).json({ error: 'Invalid token' });
            } else {
                const userDoc = await User.findById(user.id);
                if (userDoc) {
                    res.json({
                        username: userDoc.username,
                        role: userDoc.role,
                    });
                } else {
                    res.status(404).json({ error: 'User not found' });
                }
            }
        });
    } else {
        res.json({});
    }
});

app.post('/logout', (req,res) => {
    res.cookie('token', '').json('ok');
})

app.post('/post', uploadMiddleware.single('file'), async (req,res) =>{
    const {originalname,path} = req.file;
    const parts = originalname.split('.');
    const ext = parts[parts.length -1];
    const newPath = path+'.'+ext;
    fs.renameSync(path, newPath);

    const {token} = req.cookies;

    jwt.verify(token, secret, {}, async (err,info) => {
        if(err) throw err;
        const{title,summary,content}= req.body;

        const postDoc = await Post.create({
            title,
            summary,
            content,
            cover:newPath,
            author:info.id,
        });
        res.json(postDoc);
    });
});

app.put('/post', uploadMiddleware.single('file'), async (req,res) =>{
    let newPath = null;
    if(req.file){
        const {originalname,path} = req.file;
        const parts = originalname.split('.');
        const ext = parts[parts.length -1];
        newPath = path+'.'+ext;
        fs.renameSync(path, newPath);
    }

    const {token} = req.cookies;
    jwt.verify(token, secret, {}, async (err,info) => {
        if(err) throw err;
        const{id,title,summary,content}= req.body;

        const postDoc = await Post.findById(id);
        const isAuthor = JSON.stringify(postDoc.author) === JSON.stringify(info.id);
        if(!isAuthor) {
            return res.status(400).json('you are not the author');
        }
        postDoc.title = title;
        postDoc.summary = summary;
        postDoc.content = content;
        postDoc.cover = newPath ? newPath : postDoc.cover;
        await postDoc.save();

        res.json(postDoc);
    });
});

app.get('/post', async (req,res) => {
    res.json(
        await Post.find()
        .populate('author', ['username'])
        .sort({createdAt: -1})
        .limit(20)
    );
});

app.get('/post/:id', async (req, res) => {
    const {id} = req.params;
    try {
        const postDoc = await Post.findById(id)
        .populate('author', ['username']) // Populating post author
        .populate('comments.author', 'username'); // Populating comments' author usernames
        if (!postDoc) {
            return res.status(404).send('Post not found');
        }
        res.json(postDoc);
    } catch (error) {
        console.error('Error fetching post:', error);
        res.status(500).json({ message: 'Error fetching post details', error: error.message });
    }
});


app.delete('/post/:id', async (req, res) => {
    const { token } = req.cookies;
    if (!token) {
        return res.status(401).json({ message: 'Authentication required' });
    }

    try {
        const result = await Post.findByIdAndDelete(req.params.id);
        if (!result) {
            return res.status(404).json({ message: 'Post not found' });
        }
        console.log(`Post with id ${req.params.id} deleted`);
        res.json({ message: 'Post successfully deleted' });
    } catch (err) {
        console.error(`Error when trying to delete post with id ${req.params.id}: ${err.message}`);
        res.status(500).json({ message: 'Internal Server Error', error: err.toString() });
    }
});
// Part of index.js
app.post('/post/:id/comment', async (req, res) => {
    const { id } = req.params;
    const { content } = req.body; // Assume the user's ID is either in the body or extracted from a session/token
    const { userId } = req; // This should come from your authentication middleware/session

    if (!content) {
        return res.status(400).json({ message: 'Comment content cannot be empty' });
    }

    try {
        const post = await Post.findById(id);
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }
        // Add the comment to the post
        post.comments.push({ content, author: userId }); // Assuming userId is available
        await post.save();
        res.status(201).json(post);
    } catch (error) {
        console.error('Error adding comment:', error);
        res.status(500).json({ message: 'Error adding comment', error: error.message });
    }
});
// Part of index.js
app.delete('/post/:postId/comment/:commentId', async (req, res) => {
    const { postId, commentId } = req.params;

    try {
        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }
        // Remove the comment from the post
        post.comments = post.comments.filter(comment => comment._id.toString() !== commentId);
        await post.save();
        res.json({ message: 'Comment deleted successfully' });
    } catch (error) {
        console.error('Error deleting comment:', error);
        res.status(500).json({ message: 'Error deleting comment', error: error.message });
    }
});





app.listen(4000);
//QG9imFK3jpJ9obx

//mongodb+srv://blog:ksn3TK8GYLOOxqI1@cluster0.zv4ffnn.mongodb.net/?retryWrites=true&w=majority
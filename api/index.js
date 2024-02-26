const express = require('express');
const cors = require('cors');
const mongoose = require("mongoose");
const User = require('./models/User');
const Post = require('./models/Post');
const bcrypt = require('bcryptjs');
const app = express();
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const multer = require('multer');
const uploadMiddleware = multer({ dest: 'uploads/' })
const fs = require('fs');
const path = require('path');

const salt = bcrypt.genSaltSync(10);
const secret = 'jfgosduft908erjfklsdf';

app.use(cors({credentials: true, origin: 'http://localhost:3000'}));
app.use(express.json());
app.use(cookieParser());
app.use('/uploads', express.static(__dirname + '/uploads'));
mongoose.connect('mongodb+srv://blog:ksn3TK8GYLOOxqI1@cluster0.zv4ffnn.mongodb.net/?retryWrites=true&w=majority');

// Authentication Middleware
const authenticateToken = (req, res, next) => {
    const token = req.cookies.token;
    if (!token) return res.sendStatus(401);

    jwt.verify(token, secret, (err, user) => {
        if (err) return res.sendStatus(403);
        req.userId = user.id;
        next();
    });
};
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
app.post('/post/:id/comment', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const { content } = req.body;
    const userId = req.userId; // Now this is set by the authenticateToken middleware

    if (!content) {
        return res.status(400).json({ message: 'Comment content cannot be empty' });
    }

    try {
        const post = await Post.findById(id);
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }
        post.comments.push({ content, author: userId });
        await post.save();
        res.status(201).json(post);
    } catch (error) {
        console.error('Error adding comment:', error);
        res.status(500).json({ message: 'Error adding comment', error: error.message });
    }
});
app.delete('/post/:postId/comment/:commentId', authenticateToken, async (req, res) => {
    const { postId, commentId } = req.params;

    console.log(`Deleting comment ${commentId} from post ${postId}`);

    try {
        const post = await Post.findById(postId);
        if (!post) {
            console.log('Post not found');
            return res.status(404).json({ message: 'Post not found' });
        }

        const commentIndex = post.comments.findIndex(comment => comment._id.toString() === commentId);
        if (commentIndex === -1) {
            console.log('Comment not found');
            return res.status(404).json({ message: 'Comment not found' });
        }

        // Remove the comment and log the operation
        post.comments.splice(commentIndex, 1);
        await post.save();

        console.log(`Comment ${commentId} deleted successfully`);
        res.json({ message: 'Comment deleted successfully' });
    } catch (error) {
        console.error('Error deleting comment:', error);
        res.status(500).json({ message: 'Error deleting comment', error: error.message });
    }
});

app.use(express.static(path.join(__dirname, '../client/build')));

// The "catchall" handler: for any request that doesn't match one above,
// send back React's index.html file.
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
});

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});


//QG9imFK3jpJ9obx

//mongodb+srv://blog:ksn3TK8GYLOOxqI1@cluster0.zv4ffnn.mongodb.net/?retryWrites=true&w=majority
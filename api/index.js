const express = require('express');
const cors = require('cors');
const mongoose = require("mongoose");
const User = require('./models/User');
const app = express();

app.use(cors());
app.use(express.json());

mongoose.connect('mongodb+srv://blog:ksn3TK8GYLOOxqI1@cluster0.zv4ffnn.mongodb.net/?retryWrites=true&w=majority');

app.post('/register', async (req,res) => {
    const {username,password} = req.body;
    try{
        const userDoc = await User.create({username,password});
        res.json(userDoc);

    }catch(e) {
        res.status(400).json(e);
    }
});

app.listen(4000);
//QG9imFK3jpJ9obxq

//mongodb+srv://blog:ksn3TK8GYLOOxqI1@cluster0.zv4ffnn.mongodb.net/?retryWrites=true&w=majority
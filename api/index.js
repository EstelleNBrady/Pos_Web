const express = require('express');
const cors = require('cors');
const mongoose = require("mongoose");
const app = express();

app.use(cors());
app.use(express.json());

mongoose.connect('mongodb+srv://blog:ksn3TK8GYLOOxqI1@cluster0.zv4ffnn.mongodb.net/?retryWrites=true&w=majority');

app.post('/register', (req,res) => {
    const {username,password} = req.body;
    res.json({requestData:{username,password}});
});

app.listen(4000);
//ksn3TK8GYLOOxqI1
//kKl4FzxEbCaFgzeC

//mongodb+srv://blog:ksn3TK8GYLOOxqI1@cluster0.zv4ffnn.mongodb.net/?retryWrites=true&w=majority
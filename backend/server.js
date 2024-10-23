const express = require('express');
const app = express();
const db = require('./db');
const cors = require('cors');
require('dotenv').config();

app.use(cors())
const bodyParser = require('body-parser');
app.use(bodyParser.json());
const PORT = process.env.PORT || 3000;

// const { jwtAuthmiddleware} = require('./jwt');

const userRoutes = require('./routes/userRoutes');
const candidateRoutes = require('./routes/candidateRoutes');

app.use('/user' , userRoutes);
app.use('/candidate', candidateRoutes);
app.listen(PORT,()=>{
    console.log("server running on port 3000");
  })
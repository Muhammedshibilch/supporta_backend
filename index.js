require('dotenv').config()
const express = require('express');
const cors = require('cors');
const router = require('./routes/router')
require('./config/connection')



const server = express()

server.use(cors())
server.use(express.json())
server.use(router)



const PORT = 3000 || process.env.PORT

server.listen(PORT,()=>{
    console.log(`server started at port : ${PORT} and waiting for client request!!!`);
    
})

server.get('/',(req,res)=>{
    res.status(200).send(`<h1 style="color:blue">Welcome to the server</h1>`)
})
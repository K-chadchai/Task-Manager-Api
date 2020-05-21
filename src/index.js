const express = require('express')
require('./data/mongoose') // call mongoose to run server mongoose.connect

const routerUser = require('../src/User/user') // call router from user.js
const routerTask = require('../src/User/task')
const bcrypt = require('bcryptjs')

const app = express()
const port = process.env.PORT//set localport 3000 and set server heroku port 

// app.use((req,res,next)=> { // this is middleware function use when we shutdown the server
//     res.status(503).send('Site is currenly down. Check back soon!')
//     // next()
// })


app.use(express.json()) //incoming json parse to object !!
app.use(routerTask)
app.use(routerUser) // use router 

app.listen(port, () => {
    console.log('Server is up on port' + port)
})


const Task = require('../src/models/task')
const User = require('../src/models/user')

const multer = require('multer')

const upload = multer({
    dest: 'images',
    limits: {
        fileSize: 1000000
    },
    fileFilter(req, file, cb) { // fileFilter = การกำหนดไฟล์
        if (!file.originalname.match(/\.(doc|docx)$/)) { // .match() use regular expressed
            return cb(new Error('Please upload a word Document'))
        }

        cb(undefined,true)
    }
})
app.post('/upload', upload.single('upload') ,(req,res) => { //.single('key')
    res.send()
}, (error, req, res, next) =>{
    res.status(400).send({error: error.message})
})

const mongoose = require('mongoose')

mongoose.connect(process.env.MONGODB_URL, { //ส่งข้อมูลเข้าไปใน rest api db
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
})
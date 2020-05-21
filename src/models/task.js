const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')

mongoose.connect('mongodb://127.0.0.1:27017/task-manager-api', { //ส่งข้อมูลเข้าไปใน rest api db
    useNewUrlParser: true,
    useCreateIndex: true,
})

const taskSchema = new mongoose.Schema({ 

    description: {
        type: String,
        require: true,
        trim: true,
    },
    completed: {
        type: Boolean,
        default: false,
        trim: true, //remove space 
    },
    owner : {
        type : mongoose.Schema.Types.ObjectId, // crete objectId
        required: true,
        ref: 'User'

    }
}, {
    timestamps : true
})

const Task = mongoose.model('tasks', taskSchema) // collection name tasks

module.exports = Task

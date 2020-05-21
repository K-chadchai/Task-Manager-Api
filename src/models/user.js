const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const Task = require('./task')

mongoose.connect('mongodb://127.0.0.1:27017/task-manager-api', { //ส่งข้อมูลเข้าไปใน rest api db
    useNewUrlParser: true,
    useCreateIndex: true,
})

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        require: true,
        trim: true,
    },
    email: {
        type: String,
        unique: true, 
        require: true,
        trim: true, //remove space 
        lowercase: true,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error('Email is invalid')
            }
        }
    },
    password: {
        type: String,
        require: true,
        trim: true,
        minlength: 7, // ขั้นต่ำ 7 ตัว
        validate(value) {
            if (value.toLowerCase().includes('password')) { // includes = รวมไปถึง คือเจอคำว่า password
                throw new Error('Password can not contain password')
            }
        }
    },
    age: {
        type: Number,
        default: 0,
        trim: true,
        validate(value) {
            if (value < 0) {
                throw new Error("age isn't be a negative")
            }
        }
    },
    tokens: [{
        token: {
            type: String,
            require: true
        }
    }],
    avatar : {
        type: Buffer
    }
}, {
    timestamps: true
})

userSchema.virtual('tasks', { // Create virtual to ref to task!
    ref: 'tasks',
    localField: '_id',
    foreignField: 'owner'
})

userSchema.methods.toJSON = function () { //.toJSON is  stringify data to JSON
    const user = this
    const userObject = user.toObject() // Parse to object and delete it 
    
    delete userObject.password // delete password to show
    delete userObject.tokens //delete tokens to show
    delete userObject.avatar

    return userObject
}

userSchema.methods.CreateToken = async function () {
    const user = this
    const token = jwt.sign({ _id: user._id.toString()} , 'thisismyapp')

    user.tokens = user.tokens.concat({token: token}) // .concat include array 

    await user.save()

    return token
}

userSchema.statics.Credentials = async (email,password) => { //create function Credentials
    const user = await User.findOne({email})

    if (!user) {
        throw new Error('Unable to login')
    }

    const ismatch = await bcrypt.compare(password, user.password)

    if (!ismatch) {
        throw new Error('Unable to login')
    }

    return user
}

// before save it will run this func
userSchema.pre('save', async function (next) {
    const user = this

    if(user.isModified('password')) { // user มีการแก้ไขพาสมั้ย
        user.password = await bcrypt.hash(user.password , 8) // ถ้ามีให้เข้ารหัส
    }

    next()
})

// before delete
userSchema.pre('remove', async function(next) {
    const user = this
    await Task.deleteMany({ owner : user._id })
    next()
})

const User = mongoose.model('User', userSchema)

module.exports = User
const Users = require('../models/user')
const express = require('express')
const router = new express.Router()
const auth = require('../middleware/auth')
const multer = require('multer')
const sharp = require('sharp')
const {sendWelcomeEmail, sendGoodbyeEmail} = require('../Emails/account')


router.post('/users', async (req,res) => {
    const user = new Users(req.body) // ส่งค่า req.body เข้าไปเช็คเงื่อนไข

    try {
        await user.save()
        sendWelcomeEmail(user.email, user.name)
        const token = await user.CreateToken()
        res.status(201).send({user , token})
    } catch (e) {
        res.status(400).send(e)
    }

})

router.post('/users/login', async (req,res) => {
    try {
        const user = await Users.Credentials(req.body.email, req.body.password)
        const token = await user.CreateToken()
        res.send({user, token})
    } catch (e) {
        res.status(400).send({error : e})
    }
})

router.post('/users/logout' , auth, async(req,res) => { 
    try {
        req.user.tokens = req.user.tokens.filter((token)=>{
            return token.token !== req.token
        })
        await req.user.save()

        res.send()

    } catch (e) {
        res.status(500).send()
    }   
})

router.post('/users/logoutAll' , auth, async(req,res) => { // logout all tokens

    try {
        req.user.tokens = []
        await req.user.save()
        res.send()
    } catch (e) {  
        res.status(500).send()
    }

})

router.patch('/users/me',auth, async (req,res) => {

    const update = Object.keys(req.body) // เก็บค่าที่ได้รับจาก postman ยิง body มา
    const allowUpdate = ['name','email','password','age'] //  กำหนดที่จะให้แก้ได้
    const isValid = update.every((update) => { // ใช้ every เพื่อให้รันobject ในทุก update
        return allowUpdate.includes(update) // .inclues ใช้เพื่อเทียบว่า ค่าใน allow มี ค่าตรงกับ update มั้ยถ้ามีจะreturn true /false
    })

    if (!isValid) {
        res.status(400).send({error : 'invalid updates'})
    }

    try {
        update.forEach((update)=> req.user[update] =  req.body[update])
        await req.user.save()
        res.send(req.user).status(200)

    } catch (e) {
        res.status(400).send(e)
    }

})

router.get('/users/me' , auth,async (req,res) => { // การใช้ async and await คือการ ประกาศ async และ ใช้คำสั่ง await เพื่อให้รันทีละบรรทัด โดยไม่ต้องใช้ .then() => .catch()

    try {
        res.send(req.user)
    } catch (e) {
        res.status(400).send(e)
    }
    
})

router.delete('/users/me', auth ,async (req,res) => {

    try {
        await req.user.remove()
        sendGoodbyeEmail(req.user.email, req.user.name)
        res.send(req.user)

    } catch (e) {
        res.status(400).send()
    }
})

const upload = multer({
    limits: {
        fileSize: 1000000 //1MB
    },
    fileFilter(req, file, cb) {
        if(!file.originalname.match(/\.(jpg|jpeg|png)$/)) { //ถ้าไม่ใช่ไฟล์ jpg jpeg png เข้าเงื่อนไข return ค่ากลับ
            return cb(new Error('Please upload jpg or jpeg or png'))
        }
        cb(undefined,true)
    }
})



router.post('/upload/me/avatar', auth ,upload.single('avatar'), async (req,res) => {
    const buffer = await sharp(req.file.buffer).resize({width: 250, height: 250}).png().toBuffer() // sharp use to resize 
    req.user.avatar = buffer
    await req.user.save()
    res.send()
},(error, req, res, next) => { // use middleware function
    res.status(400).send({error : error.message})
})

router.get('/users/:id/avatar', async (req,res) => {
    try {  
        const user = await Users.findById(req.params.id)

        if(!user || !user.avatar) {
            throw new Error()
        }

        res.set('Content-Type' , 'image/png')
        res.send(user.avatar)

    } catch (e) {
        res.status(400).send()
    }   
})

router.delete('/users/me/avatar', auth, async (req,res) => {
    req.user.avatar = undefined
    await req.user.save()
    res.send()
}, (error, req, res, next) => {
    res.status(400).send({error: error.message})
})



module.exports = router
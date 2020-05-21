const express = require('express')
const Task = require('../models/task')
const auth = require('../middleware/auth')
const router = new express.Router()

router.post('/tasks',auth, async (req,res) => {
    // const user = new Task(req.body) // ส่งค่า req.body เข้าไปเช็คเงื่อนไข

    const task = new Task({
        ...req.body,
        owner : req.user._id
    })

    try {
        await task.save()
        res.status(201).send(task)
    } catch (e) {   
        res.status(400).send(e)
    }

})

router.patch('/tasks/:id',auth, async (req,res) => {

    const update = Object.keys(req.body) // เก็บค่าที่ได้รับจาก postman ยิง body มา
    const allowUpdate = ['description','completed'] //  กำหนดที่จะให้แก้ได้
    const isValid = update.every((update) => { // ใช้ every เพื่อให้รันobject ในทุก update
        return allowUpdate.includes(update) // .inclues ใช้เพื่อเทียบว่า ค่าใน allow มี ค่าตรงกับ update มั้ยถ้ามีจะreturn true /false
    })

    if (!isValid) {
        res.send({error : 'invalid updates'}).status(400)
    }

    try {
        const task = await Task.findOne({_id : req.params.id , owner : req.user._id})
    
        if(!task) {
            res.status(400).send()
        }

        update.forEach((update)=> task[update] = req.body[update])
        await task.save()
        res.send(task).status(200)

    } catch (e) {
        res.status(400).send(e)
    }

})
//GET /tasks?completed=true
//GET /task?limit=2&skip=1
//GET /tasl?soryBy=createdAt:desc
router.get('/tasks',auth , async (req,res) => { // การใช้ async and await คือการ ประกาศ async และ ใช้คำสั่ง await เพื่อให้รันทีละบรรทัด โดยไม่ต้องใช้ .then() => .catch()
    // req.query.completed = ?completed

    const match = {}
    const sort = {}

    if (req.query.completed) {
        match.completed = req.query.completed === 'true'
    }

    if (req.query.sortBy) {
        const parts = req.query.sortBy.split(':')
        sort[parts[0]] = parts[1] === 'desc' ? -1 : 1 // ถ้าใช่ desc ให้ sort -1 ถ้าไม่ใช่ให้ sort 1
    }
    try {
        await req.user.populate({
            path: 'tasks',
            match,
            options: {
                limit: parseInt(req.query.limit), // pargination = การกำหนดการมองเห็นของ task
                skip: parseInt(req.query.skip),
                sort
            }
        }).execPopulate()
        res.status(201).send(req.user.tasks)
    } catch (e) {
        res.status(400).send(e)
    }
    
})


router.get('/tasks/:id', auth, async (req,res) => {

    const _id = req.params.id // get id by user input on /website

    try {
        const task = Task.findOne({_id , owner : req.user._id})

        if (!task) {
            return res.status(404).send()
        }
        res.send(task)

    } catch (e) {
        res.status(400).send()
    }
})

router.delete('/tasks/:id',auth, async (req,res) => {

    try {
        const task = await Task.findOneAndDelete({_id : req.params.id , owner : req.user._id})

        if (!task) {
            res.status(404).send()
        }

        res.send(task)

    } catch (e) {
        res.status(400).send()
    }
})

module.exports = router
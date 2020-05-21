//CRUD create read update delete
const {MongoClient, ObjectID} = require('mongodb')

// const id = new ObjectID()
// console.log(id)
// console.log(id.getTimestamp())

const connectUrl = 'mongodb://127.0.0.1:27017'
const databaseName = 'task-manager'

MongoClient.connect(connectUrl, {useNewUrlParser: true} , (error,client) => {
    if (error) {
        return console.log('Unable to connect to database!!')
    }

    const db = client.db(databaseName) // create database name task-manager

})
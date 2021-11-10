import express from 'express'
import mongoose from 'mongoose'
import {Messages,Rooms} from './dbMessages.js';
import Pusher from 'pusher';
import cors from 'cors';

//app config
const app=express(); 
const port = process.env.PORT || 9000;

const pusher = new Pusher({
    appId: process.env.appId,
    key: process.env.key,
    secret: process.env.secret,
    cluster: "eu",
    useTLS: true
  });

  console.log(process.env.appId);
  console.log(process.env.key);
  console.log(process.env.secret);
  

//middleware
app.use(express.json())
app.use(cors());

//DB config
const connection_url = process.env.connectionUrl;
mongoose.connect(connection_url,{
    useCreateIndex:true,
    useNewUrlParser:true,
    useUnifiedTopology:true
})

const db = mongoose.connection

db.once('open',()=>{
    console.log("DB connected")
    const msgCollection = db.collection("messagecontents");
    const changeStream = msgCollection.watch();   
    
    changeStream.on('change',(change)=>{
        console.log("A change occured ",change);

        if(change.operationType==="insert"){
            const messageDetails = change.fullDocument;
            pusher.trigger("message","inserted",{
                name: messageDetails.name,
                message: messageDetails.message,
                timestamp: messageDetails.timestamp,
                received: messageDetails.received,
                roomId: messageDetails.roomId
            }).catch(e=>{
                console.log(e)
            });
        }
        else{
            console.log("Error triggering Pusher");
        }
    });
});  

//api route
app.get('/',(req,res)=>res.status(200).send('hello world'));

app.get('/messages/:roomId',(req,res)=>{
    Messages.find({"roomId":{$eq:req.params.roomId}},(err,data)=> {
        if(err){
            res.status(500).send(err)
        }
        else{
            res.status(200).send(data)
        }
    })
})

app.post('/messages/new',(req,res)=>{
    const dbMessage = req.body

    Messages.create(dbMessage, (err, data) => {
        if(err) {
            res.status(500).send(err)
            console.log(err)
        }
        else {
            res.status(201).send(data)
        }
    })
})


app.get('/rooms',(req,res)=>{
    Rooms.find((err,data)=> {
        if(err){
            res.status(500).send(err)
        }
        else{
            res.status(200).send(data)
        }
    })
})

app.get('/rooms/:id',(req,res)=>{
    Rooms.findById(req.params.id,(err,data)=> {
        if(err){
            res.status(500).send(err)
        }
        else{
            res.status(200).send(data)
        }
    })
})

app.post('/rooms/new',(req,res)=>{
    const room = req.body

    Rooms.create(room, (err, data) => {
        if(err) {
            res.status(500).send(err)
            console.log(err)
        }
        else {
            res.status(201).send(data)
        }
    })
})

//listen
app.listen(port,()=>console.log(`Listening on port:${port}`));
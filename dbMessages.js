import mongoose from 'mongoose'

const whatsappSchema = mongoose.Schema({
    message:String,
    name:String,
    timestamp:String,
    received: Boolean,
    roomId: String
});

const roomsSchema = mongoose.Schema({
    name:String
});

const Messages = mongoose.model('messagecontents', whatsappSchema);
const Rooms =  mongoose.model('rooms',roomsSchema);
export {Messages,Rooms} 

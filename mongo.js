import mongoose from 'mongoose';
const back =new mongoose.Schema({
    name:String,
    email:String,
    password:String
});
export const userdb=mongoose.model('userdb',back);
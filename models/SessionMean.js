const mongoose =require('mongoose');
const {Schema} = require('mongoose');
const SessionMeanModel = mongoose.model('session_mean', new Schema({ meanAlert: Number, meanDrowsy:Number}));
// const sessionDataSchema = new mongoose.Schema({
//   data:{
//     type:Array
//   }
// });
// const SessionData = mongoose.model('SessionData', sessionDataSchema);
module.exports = SessionMeanModel;
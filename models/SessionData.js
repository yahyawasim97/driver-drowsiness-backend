const mongoose =require('mongoose');
const {Schema} = require('mongoose');
const SessionDataModel = mongoose.model('session_data', new Schema({ data: Object }));
// const sessionDataSchema = new mongoose.Schema({
//   data:{
//     type:Array
//   }
// });
// const SessionData = mongoose.model('SessionData', sessionDataSchema);
module.exports = SessionDataModel;
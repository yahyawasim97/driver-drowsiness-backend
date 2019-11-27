const mongoose =require('mongoose');
const {Schema} = require('mongoose');
const SessionMeanModel = mongoose.model('session_mean', new Schema({ 
    meanAlertBlinks: Number, 
    meanAlertDuration: Number,
    meanDrowsyBlinks:Number,
    meanDrowsyDuration: Number,
    drowsyAlpha: Number,
    drowsyBeta: Number,
    drowsyTheta: Number,  
    alertAlpha: Number,
    alertBeta: Number,
    alertTheta: Number
}));
// const sessionDataSchema = new mongoose.Schema({
//   data:{
//     type:Array
//   }
// });
// const SessionData = mongoose.model('SessionData', sessionDataSchema);
module.exports = SessionMeanModel;
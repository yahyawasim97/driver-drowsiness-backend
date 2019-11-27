const mongoose =require('mongoose');
const {Schema} = require('mongoose');
const OverallMeanModel = mongoose.model('overall_mean', new Schema({ 
    meanAlertBlinks: Number, 
    meanAlertDuration: Number, 
    meanAlertAlpha: Number,
    meanAlertBeta: Number,
    meanAlertTheta: Number,
    meanDrowsyBlinks:Number,
    meanDrowsyDuration: Number,
    meanDrowsyAlpha: Number,
    meanDrowsyBeta:Number,
    meanDrowsyTheta:Number 
    },{
    timestamps: true
}));
// const sessionDataSchema = new mongoose.Schema({
//   data:{
//     type:Array
//   }
// });
// const SessionData = mongoose.model('SessionData', sessionDataSchema);
module.exports = OverallMeanModel;
const mongoose =require('mongoose');
const {Schema} = require('mongoose');
const OverallMeanModel = mongoose.model('overall_mean', new Schema({ 
    alert:Object,
    drowsy:Object
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
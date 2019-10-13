const Cortex = require('../cortex');
const io  =require('../socket');
const SessionData = require('../models/SessionData');
const SessionMean = require('../models/SessionMean');
const OverallMean = require('../models/OverallMean');

const socketUrl = 'wss://localhost:6868'
const user = {
    "clientId":"8BjOD6sZK2afGFLDNg3leUVJ1DO6eJWmSDf1pTVY",
    "clientSecret":"9fbLUAFLH79zMaOmU3d4VGbgPyjrAG6U6tG077a5BbTr4XHWgFXgDZoQGsnXN3M9koC6JALQGEjptzUCQpXvjzCBIH6AwNLCw3xmcpVGAebG61XNBLEdqeis65GSqXdK",
    "debit":1
}
let cortex ;

exports.getUnsubscribe=async (req, res, next)=>{

    cortex.unSubscribe(['pow'],cortex.sessionId, cortex.authToken);
    let sessionData = cortex.getSessionData();
    SessionData.create({data:sessionData}, function (err, results) {
        res.send({id: results._id,minutes:sessionData.length});
    });
    // res.status(200).json({title:'Data Fetching start',data:sessionData});
}

exports.updatePost = async(req,res,next)=>{
    // let id = req.body.id;
    console.log('hereedsadas 1234')
    // let id = '5da33b021d6ccb2e1c970961';
    // let min = 1;
    // let max = 2;
    let id = req.body.id;
    let min = req.body.min;
    let max = req.body.max;
    console.log(req.body);
    let sessionUser = await SessionData.findById(id);
    let sessionUserData = sessionUser.data;
    console.log(sessionUserData)
    let alertBlink=0;
    let drowsyBlink=0;
    let alertCount =0;
    let drowsyCount=0;
    sessionUserData.forEach((data,index)=>{
        if(index+1 >= min && index+1<=max){
            alertBlink = alertBlink + data;
            alertCount = alertCount+1;
        }else{
            drowsyBlink = drowsyBlink + data;
            drowsyCount = drowsyCount +1;
        }
    })
    if(alertCount>1){

        alertBlink = Math.round(alertBlink/alertCount);
    }
    if(drowsyCount>1){

        drowsyBlink = Math.round(drowsyBlink/drowsyCount);
    }
    if(alertBlink && drowsyBlink){
        await SessionMean.create({meanAlert:alertBlink,meanDrowsy:drowsyBlink});
    }else if (alertBlink){
        await SessionMean.create({meanAlert:alertBlink});
    }else if (drowsyBlink){
        await SessionMean.create({meanDrowsy:drowsyBlink});
    }
    refreshMean();
    res.send({sessionUserData,alertBlink,drowsyBlink});
}

refreshMean=async()=>{
    let data = await SessionMean.find();
    let meanAlert =0;
    let meanDrowsy =0;
    data.forEach((data)=>{
        if(data.meanAlert && data.meanDrowsy){
            meanAlert = data.meanAlert +meanAlert;
            meanDrowsy = data.meanDrowsy + meanDrowsy;
        }else if(data.meanAlert){
            meanAlert = data.meanAlert +meanAlert;
        }else if(data.meanDrowsy){
            meanDrowsy = data.meanDrowsy + meanDrowsy;
        }
    })
    meanAlert = Math.round(meanAlert/data.length);
    meanDrowsy = Math.round(meanDrowsy/data.length);
    await OverallMean.create({meanAlert,meanDrowsy});
    
}

exports.getAuthorize = async (req, res, next) => {
    cortex = new Cortex(user, socketUrl);
    await cortex.sub(['fac','pow']);
    res.status(200).json({title:'Data Fetching start'});
//     let c = new Cortex(user, socketUrl);
    
// // ---------- sub data stream
// // have six kind of stream data ['fac', 'pow', 'eeg', 'mot', 'met', 'com']
// // user could sub one or many stream at once
// let streams = ['pow']
// c.sub(streams)


//     res.render('index');  
};

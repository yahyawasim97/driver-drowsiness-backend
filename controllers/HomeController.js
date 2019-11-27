const Cortex = require('../cortex');
const io  =require('../socket');
const SessionData = require('../models/SessionData');
const SessionMean = require('../models/SessionMean');
const OverallMean = require('../models/OverallMean');

const socketUrl = 'wss://localhost:6868'
const user = {
    "clientId":"sunUpMiwyMPtnubThqHBrPxPuisCeYrtra2MtkMo",
    "clientSecret":"zJNwBCLEmXJ4sCqROfLRr9r5Sgn83iOaGDnYv3utXX6p6Elamf86GixdIYy6sKnUjUfVdokKxSpaM8vtusjJJjg5lmBg4Tf7ApWZgw8274qVh7J3plwj2GJ0DMBBh9CB",
    "debit":1
}
let cortex ;

exports.getUnsubscribe=async (req, res, next)=>{
    let name  = req.query.name;
    cortex.unSubscribe(['pow','fac'],cortex.sessionId, cortex.authToken);
    let sessionData = cortex.getSessionData();
    console.log(sessionData)
    SessionData.create({data:{blinks:sessionData.sessionBlinkData,name,sessionBandsData:sessionData.sessionBandsData}}, function (err, results) {
        res.send({id: results._id,minutes:sessionData.length});
    });
}

exports.updatePost = async(req,res,next)=>{
    let id = req.body.id;
    let min = req.body.min;
    let max = req.body.max;
    let sessionUser = await SessionData.findById(id);
    let sessionUserData = sessionUser.data;
    let alertBlink=0;
    let alertDuration =0;
    let drowsyBlink=0;
    let drowsyDuration = 0;
    let alertCount =0;
    let drowsyCount=0;
    let alertAlpha =0;
    let alertBeta =0;
    let alertTheta = 0;
    let drowsyAlpha =0;
    let drowsyBeta =0;
    let drowsyTheta =0;

    sessionUserData.blinks.forEach((d,index)=>{
        if(index+1 >= min && index+1<=max){
            drowsyBlink = drowsyBlink + d.count
            drowsyDuration = drowsyDuration + d.blinkDuration;
            drowsyCount = drowsyCount +1;
        }else{
            alertBlink = alertBlink + d.count;
            alertDuration = alertDuration + d.blinkDuration;
            alertCount = alertCount+1;
            }
        })
        sessionUserData.sessionBandsData.forEach((d,index)=>{
            if(index+1 >= min && index+1<=max){
                drowsyAlpha = drowsyAlpha + d.alpha;
                drowsyBeta = drowsyBeta + d.beta;
                drowsyTheta = drowsyTheta + d.theta;
            }else{
                alertAlpha = alertAlpha + d.alpha;
                alertBeta = alertBeta + d.beta;
                alertTheta = alertTheta + d.theta;
            }
        })

    
        alertBlink = Math.round(alertBlink/alertCount);
        alertDuration = Math.round(alertDuration/alertCount);
        alertAlpha =alertAlpha/sessionUserData.sessionBandsData.length;
        alertBeta = alertBeta/sessionUserData.sessionBandsData.length;
        alertTheta = alertTheta/sessionUserData.sessionBandsData.length;
        drowsyBlink = Math.round(drowsyBlink/drowsyCount);
        drowsyDuration = Math.round(drowsyDuration/drowsyCount);
        drowsyAlpha = drowsyAlpha/sessionUserData.sessionBandsData.length;
        drowsyBeta = drowsyBeta/sessionUserData.sessionBandsData.length;
        drowsyTheta =drowsyTheta/sessionUserData.sessionBandsData.length;
        await SessionMean.create({meanAlertBlinks:alertBlink,meanAlertDuration:alertDuration,meanDrowsyBlinks:drowsyBlink,meanDrowsyDuration:drowsyDuration,drowsyAlpha,drowsyBeta,drowsyTheta,alertAlpha,alertBeta,alertTheta});
        refreshMean();
    
    res.send({sessionUserData,alertBlink,alertDuration,drowsyBlink,drowsyDuration,drowsyAlpha,drowsyBeta,drowsyTheta});
}

refreshMean=async()=>{
    let data = await SessionMean.find();
    let meanAlertBlinks =0;
    let meanAlertDuration = 0;
    let meanAlertAlpha =0;
    let meanAlertBeta = 0;
    let meanAlertTheta = 0;
    let meanDrowsyBlinks =0;
    let meanDrowsyDuration = 0;
    let meanDrowsyAlpha =0;
    let meanDrowsyBeta = 0;
    let meanDrowsyTheta = 0;
    let alertCount = 0;
    let drowsyCount =0;
    data.forEach((data)=>{
        if(data.meanDrowsyBlinks ===0 && data.meanDrowsyDuration===0 && data.drowsyTheta===0 && data.drowsyAlpha===0 && data.drowsyBeta===0 && (data.meanAlertBlinks>0 || data.meanAlertDuration>0 || data.alertAlpha >0 || data.alertBeta>0 || data.alertTheta>0)){
            meanAlertBlinks = data.meanAlertBlinks +meanAlertBlinks;
            meanAlertDuration = data.meanAlertDuration + meanAlertDuration;
            meanAlertAlpha = data.alertAlpha + meanAlertAlpha;
            meanAlertBeta = data.alertBeta + meanAlertBeta;
            meanAlertTheta = data.alertTheta + meanAlertTheta;
            alertCount++;
        }else if(data.meanAlertBlinks ===0 && data.meanAlertDuration===0 && data.alertTheta===0 && data.alertAlpha===0 && data.alertBeta===0 && (data.meanDrowsyBlinks>0 || data.meanDrowsyDuration>0 || data.drowsyTheta >0 || data.drowsyAlpha>0 || data.drowsyBeta>0)){
            meanDrowsyBlinks = data.meanDrowsyBlinks + meanDrowsyBlinks;
            meanDrowsyDuration = data.meanDrowsyDuration + meanDrowsyDuration;
            meanDrowsyAlpha = data.drowsyAlpha + meanDrowsyAlpha;
            meanDrowsyBeta = data.drowsyBeta + meanDrowsyBeta;
            meanDrowsyTheta = data.drowsyTheta + meanDrowsyTheta;
            drowsyCount++;
        }else if(data.meanDrowsyBlinks){
            meanDrowsyBlinks = data.meanDrowsyBlinks + meanDrowsyBlinks;
            meanDrowsyDuration = data.meanDrowsyDuration + meanDrowsyDuration;
            meanDrowsyAlpha = data.drowsyAlpha + meanDrowsyAlpha;
            meanDrowsyBeta = data.drowsyBeta + meanDrowsyBeta;
            meanDrowsyTheta = data.drowsyTheta + meanDrowsyTheta;
            meanAlertBlinks = data.meanAlertBlinks +meanAlertBlinks;
            meanAlertDuration = data.meanAlertDuration + meanAlertDuration;
            meanAlertAlpha = data.alertAlpha + meanAlertAlpha;
            meanAlertBeta = data.alertBeta + meanAlertBeta;
            meanAlertTheta = data.alertTheta + meanAlertTheta;
            alertCount++;
            drowsyCount++;
        }
    })
    if(alertCount>0){
        meanAlertBlinks = Math.round(meanAlertBlinks/alertCount);
        meanAlertDuration = Math.round(meanAlertDuration/alertCount);
        meanAlertAlpha = meanAlertAlpha/alertCount;
        meanAlertBeta = meanAlertBeta/alertCount;
        meanAlertTheta = meanAlertTheta/alertCount;
    }
    if(drowsyCount>0){
        meanDrowsyBlinks = Math.round(meanDrowsyBlinks/drowsyCount);
        meanDrowsyDuration = Math.round(meanDrowsyDuration/drowsyCount);
        meanDrowsyAlpha = meanDrowsyAlpha/drowsyCount;
        meanDrowsyBeta = meanDrowsyBeta/drowsyCount;
        meanDrowsyTheta = meanDrowsyTheta/drowsyCount;
    }
    
    await OverallMean.create({meanAlertBlinks,meanAlertDuration,meanAlertAlpha,meanAlertBeta,meanAlertTheta,meanDrowsyBlinks,meanDrowsyDuration,meanDrowsyAlpha,meanDrowsyBeta,meanDrowsyTheta});
    
}

exports.getAuthorize = async (req, res, next) => {
    cortex = new Cortex(user, socketUrl);
    await cortex.sub(['fac','pow' ]);
    res.status(200).json({title:'Data Fetching start'});
//     let c = new Cortex(user, socketUrl);
    
// // ---------- sub data stream
// // have six kind of stream data ['fac', 'pow', 'eeg', 'mot', 'met', 'com']
// // user could sub one or many stream at once
// let streams = ['pow']
// c.sub(streams)


//     res.render('index');  
};

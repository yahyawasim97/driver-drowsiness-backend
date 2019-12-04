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
        res.send({id: results._id,minutes:sessionData.sessionBlinkData.length});
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
    let drowsyBandCount =0;
    let alertBandCount =0;
    sessionUserData.blinks.forEach((d,index)=>{
        if(index+1 >= min && index+1 <= max){
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
            if(index*5+1 >= min && index*5+1<=max){
                drowsyAlpha = drowsyAlpha + d.alpha;
                drowsyBeta = drowsyBeta + d.beta;
                drowsyTheta = drowsyTheta + d.theta;
                drowsyBandCount++;
            }else{
                alertAlpha = alertAlpha + d.alpha;
                alertBeta = alertBeta + d.beta;
                alertTheta = alertTheta + d.theta;
                alertBandCount++;
            };
        })

        if(alertCount>0){
            alertBlink = Math.round(alertBlink/alertCount);
            alertDuration = Math.round(alertDuration/alertCount);
        }
        if(alertBandCount>0){
            alertAlpha =alertAlpha/alertBandCount;
            alertBeta = alertBeta/alertBandCount;
            alertTheta = alertTheta/alertBandCount;
        }
        if(drowsyCount>0){   
            drowsyBlink = Math.round(drowsyBlink/drowsyCount);
            drowsyDuration = Math.round(drowsyDuration/drowsyCount);   
        }
        if(drowsyBandCount>0){    
            drowsyAlpha = drowsyAlpha/drowsyBandCount;
            drowsyBeta = drowsyBeta/drowsyBandCount;
            drowsyTheta =drowsyTheta/drowsyBandCount;
        }
        const alert = {
            blinks:alertBlink,
            duration:alertDuration,
            theta:alertTheta,
            alpha:alertAlpha,
            beta:alertBeta
        }
        const drowsy ={
            blinks:drowsyBlink,
            duration:drowsyDuration,
            theta:drowsyTheta,
            alpha:drowsyAlpha,
            beta:drowsyBeta
        };
        await SessionMean.create({alert,drowsy});
        
        // meanAlertBlinks:alertBlink,meanAlertDuration:alertDuration,meanDrowsyBlinks:drowsyBlink,meanDrowsyDuration:drowsyDuration,drowsyAlpha,drowsyBeta,drowsyTheta,alertAlpha,alertBeta,alertTheta});
        refreshMean();
    
        res.send({alert,drowsy});
}

refreshMean=async()=>{
    let data = await SessionMean.find();
    //blinks
    let meanAlertBlinks =0, alertBlinksCount =0,meanDrowsyBlinks =0, drowsyBlinksCount =0;

    //duration
    let meanAlertDuration = 0,alertDurationCount= 0,meanDrowsyDuration = 0,drowsyDurationCount= 0;

    //alpha
    let meanAlertAlpha =0,alertAlphaCount=0,meanDrowsyAlpha =0,drowsyAlphaCount=0;

    //beta
    let meanAlertBeta =0,alertBetaCount=0,meanDrowsyBeta =0,drowsyBetaCount=0;

    //theta
    let meanAlertTheta =0,alertThetaCount=0,meanDrowsyTheta =0,drowsyThetaCount=0;

    data.forEach((data)=>{
        if(data.alert){
            //blinks
            meanAlertBlinks += data.alert.blinks;
            alertBlinksCount +=1;

            //blinks duration
            data.alert.duration && data.alert.duration>0? meanAlertDuration+= data.alert.duration:meanAlertDuration;
            data.alert.duration && data.alert.duration>0 && alertDurationCount++;
            
            //alpha
            data.alert.alpha && data.alert.alpha>0 && data.alert.alpha<12 ? meanAlertAlpha += data.alert.alpha:meanAlertAlpha;
            data.alert.alpha && data.alert.alpha>0 && data.alert.alpha<12 && alertAlphaCount++;
           
            //beta
            data.alert.beta && data.alert.beta>0 && data.alert.beta<30 ? meanAlertBeta += data.alert.beta:meanAlertBeta;
            data.alert.beta && data.alert.beta>0 && data.alert.beta<30 && alertBetaCount++;

            //theta
            data.alert.theta && data.alert.theta>0 && data.alert.theta<7 ? meanAlertTheta += data.alert.theta:meanAlertTheta;
            data.alert.theta && data.alert.theta>0 && data.alert.theta<7 && alertThetaCount++;
        }
        if(data.drowsy){
            //blinks
            meanDrowsyBlinks += data.drowsy.blinks;
            drowsyBlinksCount +=1;

            //blinks duration
            data.drowsy.duration && data.drowsy.duration>0? meanDrowsyDuration+= data.drowsy.duration:meanDrowsyDuration;
            data.drowsy.duration && data.drowsy.duration>0 && drowsyDurationCount++;
            
            //alpha
            data.drowsy.alpha && data.drowsy.alpha>0 && data.drowsy.alpha<12 ? meanDrowsyAlpha += data.drowsy.alpha:meanDrowsyAlpha;
            data.drowsy.alpha && data.drowsy.alpha>0 && data.drowsy.alpha<12 && drowsyAlphaCount++;
           
            //beta
            data.drowsy.beta && data.drowsy.beta>0 && data.drowsy.beta<30 ? meanDrowsyBeta += data.drowsy.beta:meanDrowsyBeta;
            data.drowsy.beta && data.drowsy.beta>0 && data.drowsy.beta<30 && drowsyBetaCount++;

            //theta
            data.drowsy.theta && data.drowsy.theta>0 && data.drowsy.theta<7 ? meanDrowsyTheta += data.drowsy.theta:meanDrowsyTheta;
            data.drowsy.theta && data.drowsy.theta>0 && data.drowsy.theta<7 && drowsyThetaCount++;
        }
    });
    //     if(data.meanDrowsyBlinks ===0 && data.meanDrowsyDuration===0 && data.drowsyTheta===0 && data.drowsyAlpha===0 && data.drowsyBeta===0 && (data.meanAlertBlinks>0 || data.meanAlertDuration>0 || data.alertAlpha >0 || data.alertBeta>0 || data.alertTheta>0)){
    //         meanAlertBlinks = data.meanAlertBlinks +meanAlertBlinks;
    //         meanAlertDuration = data.meanAlertDuration + meanAlertDuration;
    //         meanAlertAlpha = data.alertAlpha + meanAlertAlpha;
    //         meanAlertBeta = data.alertBeta + meanAlertBeta;
    //         meanAlertTheta = data.alertTheta + meanAlertTheta;
    //         alertCount++;
    //     }else if(data.meanAlertBlinks ===0 && data.meanAlertDuration===0 && data.alertTheta===0 && data.alertAlpha===0 && data.alertBeta===0 && (data.meanDrowsyBlinks>0 || data.meanDrowsyDuration>0 || data.drowsyTheta >0 || data.drowsyAlpha>0 || data.drowsyBeta>0)){
    //         meanDrowsyBlinks = data.meanDrowsyBlinks + meanDrowsyBlinks;
    //         meanDrowsyDuration = data.meanDrowsyDuration + meanDrowsyDuration;
    //         meanDrowsyAlpha = data.drowsyAlpha + meanDrowsyAlpha;
    //         meanDrowsyBeta = data.drowsyBeta + meanDrowsyBeta;
    //         meanDrowsyTheta = data.drowsyTheta + meanDrowsyTheta;
    //         drowsyCount++;
    //     }else if(data.meanDrowsyBlinks){
    //         meanDrowsyBlinks = data.meanDrowsyBlinks + meanDrowsyBlinks;
    //         meanDrowsyDuration = data.meanDrowsyDuration + meanDrowsyDuration;
    //         meanDrowsyAlpha = data.drowsyAlpha + meanDrowsyAlpha;
    //         meanDrowsyBeta = data.drowsyBeta + meanDrowsyBeta;
    //         meanDrowsyTheta = data.drowsyTheta + meanDrowsyTheta;
    //         meanAlertBlinks = data.meanAlertBlinks +meanAlertBlinks;
    //         meanAlertDuration = data.meanAlertDuration + meanAlertDuration;
    //         meanAlertAlpha = data.alertAlpha + meanAlertAlpha;
    //         meanAlertBeta = data.alertBeta + meanAlertBeta;
    //         meanAlertTheta = data.alertTheta + meanAlertTheta;
    //         alertCount++;
    //         drowsyCount++;
    //     }
    // })
    // if(alertCount>0){
    //     meanAlertBlinks = Math.round(meanAlertBlinks/alertCount);
    //     meanAlertDuration = Math.round(meanAlertDuration/alertCount);
    //     meanAlertAlpha = meanAlertAlpha/alertCount;
    //     meanAlertBeta = meanAlertBeta/alertCount;
    //     meanAlertTheta = meanAlertTheta/alertCount;
    // }
    // if(drowsyCount>0){
    //     meanDrowsyBlinks = Math.round(meanDrowsyBlinks/drowsyCount);
    //     meanDrowsyDuration = Math.round(meanDrowsyDuration/drowsyCount);
    //     meanDrowsyAlpha = meanDrowsyAlpha/drowsyCount;
    //     meanDrowsyBeta = meanDrowsyBeta/drowsyCount;
    //     meanDrowsyTheta = meanDrowsyTheta/drowsyCount;
    // }
    const alert = {
        blinks:alertBlinksCount>0?meanAlertBlinks/alertBlinksCount:0,
        duration:alertDurationCount>0?meanAlertDuration/alertDurationCount:0,
        alpha:alertAlphaCount>0?meanAlertAlpha/alertAlphaCount:0,
        beta:alertBetaCount>0?meanAlertBeta/alertBetaCount:0,
        theta:alertThetaCount>0?meanAlertTheta/alertThetaCount:0
    };
    const drowsy ={
        blinks:drowsyBlinksCount>0?meanDrowsyBlinks/drowsyBlinksCount:0,
        duration:drowsyDurationCount>0 ? meanDrowsyDuration/drowsyDurationCount:0,
        alpha:drowsyAlphaCount>0?meanDrowsyAlpha/drowsyAlphaCount:0,
        beta:drowsyBetaCount>0?meanDrowsyBeta/drowsyBetaCount:0,
        theta:drowsyThetaCount?meanDrowsyTheta/drowsyThetaCount:0
    };
    await OverallMean.create({alert,drowsy});
    
}

exports.getAuthorize = async (req, res, next) => {
    cortex = new Cortex(user, socketUrl);
    await cortex.sub(['fac','pow' ]);
    let means = await OverallMean.findOne({}, {}, { sort: { 'created_at' : -1 } }).exec();
    let sessionMeans = await SessionMean.find({}).exec();
    res.status(200).json({title:'Data Fetching start',means,sessionMeans});
};

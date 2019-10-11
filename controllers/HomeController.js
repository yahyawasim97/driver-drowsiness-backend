const Cortex = require('../cortex');
const io  =require('../socket');
const SessionData = require('../models/SessionData');

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
        res.send({id: results._id});
    });
    // res.status(200).json({title:'Data Fetching start',data:sessionData});
}

exports.getAuthorize = async (req, res, next) => {
    cortex = new Cortex(user, socketUrl);
    await cortex.sub(['fac','pow']);
   
    // console.log(response,'here');


    
    
    res.status(200).json({title:'Data Fetching start'});
//     let c = new Cortex(user, socketUrl);
    
// // ---------- sub data stream
// // have six kind of stream data ['fac', 'pow', 'eeg', 'mot', 'met', 'com']
// // user could sub one or many stream at once
// let streams = ['pow']
// c.sub(streams)


//     res.render('index');  
};

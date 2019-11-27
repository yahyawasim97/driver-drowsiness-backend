const mongoose = require('mongoose');
const SessionData = require('./SessionData');
const connectDb = () => {
  return mongoose.connect('mongodb://localhost:27017/driverdrowsinesssystem');
};
const models = { SessionData };
exports.connectDb= connectDb ;
exports.models = models;
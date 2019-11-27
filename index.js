const path = require("path");
const express = require("express");
const bodyParser = require('body-parser');
const cors =require('cors');
const { connectDb } =require('./models');

const homeController = require("./controllers/HomeController");
const app = express();
const port = process.env.PORT || "8000";
const router = express.Router();

app.use(cors());
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");


app.get('/authorize',homeController.getAuthorize);
app.get('/unsub',homeController.getUnsubscribe);
app.post('/updatePost',homeController.updatePost);
app.use((error,req,res,next)=>{
  const status =error.statusCode||500; 
  const message =error.message; 
  res.status(status).json({message});
})
app.use((req,res,next)=>{
  // res.setHeader('Access-Control-Allow-Origin','*');
  res.setHeader('Access-Control-Allow-Methods','GET,POST,PATCH,PUT,DELETE');
})
connectDb().then(async () => {
  const server = app.listen(port);
  const io = require('./socket').init(server)
  io.on('connection',socket=>{
    console.log('Client Connected')
  });
});

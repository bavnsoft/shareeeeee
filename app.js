const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const http = require("http");
var KiteConnect = require("kiteconnect").KiteConnect;
const mongoose = require("mongoose");
const ShareMraket = require("./models/ShareMarketData");
const db = require("./config/key").mongoURI;
const csv = require('csv-parser');
const fs = require('fs');




// Connect to Mongo
mongoose
  .connect(db)
  .then(() => console.log("MongoDB connected..."))
  .catch(err => console.log(err));




// Use Routes
app.use(function (req, res, next) {
  /*var err = new Error('Not Found');
   err.status = 404;
   next(err);*/

  // Website you wish to allow to connect
  res.setHeader('Access-Control-Allow-Origin', '*');

  // Request methods you wish to allow
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

  // Request headers you wish to allow
  res.setHeader('Access-Control-Allow-Headers', 'Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers,X-Access-Token,XKey,Authorization');

//  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

  // Pass to next layer of middleware
  next();
});

const results = [];






app.get("/",async function(req,res){

   var tokan = req.query.request_token;
//https://kite.trade/connect/login?v=3&api_key=8eek8nck2a305i8r
//Username :  NV0410
//pass : Sumit@123 




var api_key = "8eek8nck2a305i8r",
  secret = "rlk83bj1788a89au3d04d8jxjnqdnlsx",
  request_token = tokan,
  access_token = "";

var options = {
  "api_key": api_key,
  "debug": false
};

kc = new KiteConnect(options);
//kc.setSessionExpiryHook(sessionHook);

if(!access_token) {
  kc.generateSession(request_token, secret)
    .then(function(response) {
      console.log("Response", response);
      init();
    })
    .catch(function(err) {
      console.log(err);
    })
} else {
  kc.setAccessToken(access_token);
  init();
}


function init() {
    
    getInstruments("NSE");
    //getQuote(["NSE:INDUSINDBK"]);
 
 }



})

async function getQuote(instruments) {
  console.log(instruments);
  await kc.getQuote(instruments).then(async function(response) {
    

    if(response){

      console.log(JSON.stringify(response),'-------');
   // console.log(JSON.parse(response),'-------');

        const saveData = await new ShareMraket({
          data: JSON.stringify(response)
        });

        const newData = await saveData.save();
        console.log(newData);

    }

   

  }).catch(function(err) {
    console.log(err);
  })
}





async function getInstruments(exchange) {
  await kc.getInstruments(exchange).then(async function(response) {
    //console.log(response);

    var length = response.length;

    console.log(length)

   /* for(let i = 0; i < length; i++){
        console.log(response[i].tradingsymbol)

          await getQuote(["NSE:"+response[i].tradingsymbol+""]);

        } */

        fs.createReadStream('./ShareMarket2.csv')
          .pipe(csv())
          .on('data', async (data) => results.push(data))
          .on('end', async () => {

            console.log(results.length)

            for(let i = 0; i < results.length; i++){
                 await getQuote(["NSE:"+results[i]['SYMBOL    '].trim()]);
                 //console.log(results[i]['SYMBOL    ']);
            }
           
            // [
            //   { NAME: 'Daffy Duck', AGE: '24' },
            //   { NAME: 'Bugs Bunny', AGE: '22' }
            // ]
          });
  }).catch(function(err) {
    console.log(err);
  })
}


function getTrades() {
  kc.getTrades()
    .then(function(response) {
      console.log(response,'---response');
    }).catch(function(err) {
      console.log(err);
    });
}


function getMFOrders() {
  kc.getMFOrders()
    .then(function(response) {
      console.log(response);
    }).catch(function(err) {
      console.log(err);
    });
}





app.get("/api/get-data", async (req, res) => {


    const Data = await ShareMraket.find();
    //console.log(Data);
    res.send({status:true,data:Data})


})





const port = process.env.PORT || 8080;
app.listen(port, () => console.log("Server started on port " + port));

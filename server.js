const express = require("express");
const { SerialPort } = require("serialport");
const { ReadlineParser } = require("@serialport/parser-readline");
const fs = require("fs");
const { exec } = require("child_process");

const app = express();
const port = 3000;


// ========================
// LATEST SENSOR DATA
// ========================

let latestData = {
  N: 0,
  P: 0,
  K: 0,
  M: 0,
  prediction: "Waiting...",
  hourlyPrediction: "Waiting...",
  dailyPrediction: "Waiting..."
};


// ========================
// BUFFERS
// ========================

const READINGS_PER_HOUR = 720; // change to 20 for testing

let hourlyBuffer = [];
let dailyBuffer = [];


// ========================
// ARDUINO SERIAL
// ========================

const serial = new SerialPort({
  path: "COM3",
  baudRate: 9600
});

serial.on("open", () => {
  console.log("Arduino USB Serial Connected (COM3)");
});

serial.on("error", (err) => {
  console.log("Serial Port Error:", err.message);
});

const parser = serial.pipe(new ReadlineParser({ delimiter: "\n" }));


// ========================
// CSV FILE SETUP
// ========================

const fileName = "data.csv";

if (!fs.existsSync(fileName)) {
  fs.writeFileSync(
    fileName,
    "Date,Time,Nitrogen,Phosphorus,Potassium,Moisture,CropPrediction\n"
  );
}


// ========================
// SERIAL DATA RECEIVED
// ========================

parser.on("data", (data) => {

  console.log("RAW DATA:", data);

  const values = data.trim().split(",");

  if(values.length === 4){

    const N = Number(values[0]);
    const P = Number(values[1]);
    const K = Number(values[2]);
    const M = Number(values[3]);

    latestData.N = N;
    latestData.P = P;
    latestData.K = K;
    latestData.M = M;

    console.log("Sensor Data:", latestData);


    // ========================
    // LIVE ML PREDICTION
    // ========================

    exec(`python predict.py ${N} ${P} ${K} ${M}`, (error, stdout) => {

      if(error){
        console.log("Prediction Error:", error);
        return;
      }

      latestData.prediction = stdout.trim();

      console.log("Live Prediction:", latestData.prediction);

    });


    // ========================
    // SAVE TO CSV
    // ========================

    const now = new Date();
    const date = now.toISOString().split("T")[0];
    const time = now.toTimeString().split(" ")[0];

    const row = `${date},${time},${N},${P},${K},${M},${latestData.prediction}\n`;

    fs.appendFile(fileName, row, (err)=>{
      if(err) console.error("CSV Write Error:",err);
    });


    // ========================
    // STORE HOURLY READINGS
    // ========================

    hourlyBuffer.push({N,P,K,M});


    // ========================
    // HOURLY AVERAGE
    // ========================

    if(hourlyBuffer.length >= READINGS_PER_HOUR){

      let sumN=0,sumP=0,sumK=0,sumM=0;

      hourlyBuffer.forEach(d=>{
        sumN+=d.N;
        sumP+=d.P;
        sumK+=d.K;
        sumM+=d.M;
      });

      const avgN = sumN/hourlyBuffer.length;
      const avgP = sumP/hourlyBuffer.length;
      const avgK = sumK/hourlyBuffer.length;
      const avgM = sumM/hourlyBuffer.length;

      console.log("Hourly Average:",avgN,avgP,avgK,avgM);

      exec(`python predict.py ${avgN} ${avgP} ${avgK} ${avgM}`, (error, stdout) => {

        if(error){
          console.log("Prediction Error:",error);
          return;
        }

        latestData.hourlyPrediction = stdout.trim();

        console.log("Hourly Crop Prediction:",latestData.hourlyPrediction);

      });

      dailyBuffer.push({
        N:avgN,
        P:avgP,
        K:avgK,
        M:avgM
      });

      hourlyBuffer=[];

    }


    // ========================
    // DAILY AVERAGE (24 HOURS)
    // ========================

    if(dailyBuffer.length >= 24){

      let sumN=0,sumP=0,sumK=0,sumM=0;

      dailyBuffer.forEach(d=>{
        sumN+=d.N;
        sumP+=d.P;
        sumK+=d.K;
        sumM+=d.M;
      });

      const avgN=sumN/dailyBuffer.length;
      const avgP=sumP/dailyBuffer.length;
      const avgK=sumK/dailyBuffer.length;
      const avgM=sumM/dailyBuffer.length;

      console.log("Daily Average:",avgN,avgP,avgK,avgM);

      exec(`python predict.py ${avgN} ${avgP} ${avgK} ${avgM}`, (error, stdout) => {

        if(error){
          console.log("Prediction Error:",error);
          return;
        }

        latestData.dailyPrediction = stdout.trim();

        console.log("Daily Crop Prediction:",latestData.dailyPrediction);

      });

      dailyBuffer=[];

    }

  }
  else{

    console.log("Invalid data received:",data);

  }

});


// ========================
// LIVE DATA API
// ========================

app.get("/data",(req,res)=>{
  res.json(latestData);
});


// ========================
// HISTORY DATA
// ========================

app.get("/history",(req,res)=>{

  fs.readFile(fileName,"utf8",(err,data)=>{

    if(err){
      return res.status(500).json({error:"Cannot read CSV"});
    }

    const rows=data.trim().split("\n").slice(1);

    const result=rows.map(r=>{

      const c=r.split(",");

      return {
        date:c[0],
        time:c[1],
        N:Number(c[2]),
        P:Number(c[3]),
        K:Number(c[4]),
        M:Number(c[5]),
        crop:c[6]
      };

    });

    res.json(result);

  });

});
// ========================
// DOWNLOAD CSV
// ========================

app.get("/download", (req, res) => {

  const file = "data.csv";

  if (!fs.existsSync(file)) {
    return res.status(404).send("CSV file not found");
  }

  res.download(file);

});

// ========================
// SERVE DASHBOARD
// ========================

app.use(express.static(__dirname));


// ========================
// START SERVER
// ========================

app.listen(port,()=>{
  console.log(`Server running at http://localhost:${port}`);
});
// ========================
// LIVE DASHBOARD SCRIPT
// ========================

function fetchData(){

fetch("/data")
.then(res => res.json())
.then(data => {

const N = Number(data.N);
const P = Number(data.P);
const K = Number(data.K);
const M = Number(data.M);

document.getElementById("nValue").innerText = N;
document.getElementById("pValue").innerText = P;
document.getElementById("kValue").innerText = K;
document.getElementById("mValue").innerText = M;


// ========================
// DEFICIENCY ANALYSIS
// ========================

const nutrients = {
  Nitrogen: N,
  Phosphorus: P,
  Potassium: K
};

const minValue = Math.min(N,P,K);

let deficient = [];

for(const key in nutrients){
  if(nutrients[key] === minValue){
    deficient.push(key);
  }
}

document.getElementById("analysis").innerText =
"Nutrient Deficiency: " + deficient.join(" & ");


// ========================
// CROP RECOMMENDATION
// ========================

if(document.getElementById("cropPrediction")){
document.getElementById("cropPrediction").innerText =
data.prediction || "Waiting...";
}


const time = new Date().toLocaleTimeString();


// ========================
// UPDATE NPK CHART
// ========================

if(npkChart){

npkChart.data.labels.push(time);

npkChart.data.datasets[0].data.push(N);
npkChart.data.datasets[1].data.push(P);
npkChart.data.datasets[2].data.push(K);

if(npkChart.data.labels.length > 20){
npkChart.data.labels.shift();
npkChart.data.datasets.forEach(ds => ds.data.shift());
}

npkChart.update();

}


// ========================
// UPDATE MOISTURE CHART
// ========================

if(moistureChart){

moistureChart.data.labels.push(time);
moistureChart.data.datasets[0].data.push(M);

if(moistureChart.data.labels.length > 20){
moistureChart.data.labels.shift();
moistureChart.data.datasets[0].data.shift();
}

moistureChart.update();

}

})
.catch(err => console.log("Dashboard error:",err));

}

setInterval(fetchData,3000);
fetchData();
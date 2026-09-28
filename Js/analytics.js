// ========================
// ML ANALYTICS SCRIPT
// ========================

function updateAnalytics() {

    fetch("/data")
    .then(res => res.json())
    .then(data => {

        const N = Number(data.N);
        const P = Number(data.P);
        const K = Number(data.K);

        const liveCrop = data.prediction || "Waiting...";
        const hourlyCrop = data.hourlyPrediction || "Waiting...";
        const dailyCrop = data.dailyPrediction || "Waiting...";

        // Update NPK values
        document.getElementById("predictedNitrogen").innerText = N;
        document.getElementById("predictedPhosphorus").innerText = P;
        document.getElementById("predictedPotassium").innerText = K;

        // Update crop predictions
        document.getElementById("recommendedCrop").innerText = liveCrop;
        document.getElementById("hourlyCrop").innerText = hourlyCrop;
        document.getElementById("dailyCrop").innerText = dailyCrop;


        // ========================
        // SOIL SUITABILITY SCORE
        // ========================

        const avg = (N + P + K) / 3;

        let status = "";
        let color = "";

        if(avg > 3){
            status = "Highly Suitable";
            color = "green";
        }
        else if(avg > 40){
            status = "Moderately Suitable";
            color = "orange";
        }
        else{
            status = "Not Suitable";
            color = "red";
        }

        const suitability = document.getElementById("soilSuitability");

        suitability.innerText = status;
        suitability.style.color = color;

    })
    .catch(err => console.log("Analytics error:", err));
}

// update every 3 seconds
setInterval(updateAnalytics, 3000);

// run once initially
updateAnalytics();
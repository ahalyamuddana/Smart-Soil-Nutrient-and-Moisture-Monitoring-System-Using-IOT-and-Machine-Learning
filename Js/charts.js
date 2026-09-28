// ========================
// DASHBOARD CHARTS
// ========================

let npkChart = null;
let moistureChart = null;

function initCharts() {

  const npkCanvas = document.getElementById("npkChart");
  const moistureCanvas = document.getElementById("moistureChart");

  // Stop if not on dashboard
  if (!npkCanvas || !moistureCanvas) {
    console.log("Charts not initialized (not on dashboard page)");
    return;
  }

  // Make canvas responsive
  npkCanvas.style.width = "100%";
  npkCanvas.style.height = "300px";

  moistureCanvas.style.width = "100%";
  moistureCanvas.style.height = "300px";

  const npkCtx = npkCanvas.getContext("2d");
  const moistureCtx = moistureCanvas.getContext("2d");

  // ========================
  // NPK CHART
  // ========================

  npkChart = new Chart(npkCtx, {

    type: "line",

    data: {
      labels: [],
      datasets: [

        {
          label: "Nitrogen",
          data: [],
          borderColor: "#2563eb",
          backgroundColor: "rgba(37,99,235,0.1)",
          fill: false,
          tension: 0.3
        },

        {
          label: "Phosphorus",
          data: [],
          borderColor: "#9333ea",
          backgroundColor: "rgba(147,51,234,0.1)",
          fill: false,
          tension: 0.3
        },

        {
          label: "Potassium",
          data: [],
          borderColor: "#f97316",
          backgroundColor: "rgba(249,115,22,0.1)",
          fill: false,
          tension: 0.3
        }

      ]
    },

    options: {

      responsive: true,
      maintainAspectRatio: false,
      animation: false,

      plugins: {
        legend: {
          position: "top"
        }
      },

      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: "ppm"
          }
        }
      }

    }

  });


  // ========================
  // MOISTURE CHART
  // ========================

  moistureChart = new Chart(moistureCtx, {

    type: "line",

    data: {
      labels: [],
      datasets: [

        {
          label: "Moisture",
          data: [],
          borderColor: "#06b6d4",
          backgroundColor: "rgba(6,182,212,0.1)",
          fill: false,
          tension: 0.3
        }

      ]
    },

    options: {

      responsive: true,
      maintainAspectRatio: false,
      animation: false,

      plugins: {
        legend: {
          position: "top"
        }
      },

      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: "%"
          }
        }
      }

    }

  });

  console.log("Dashboard charts initialized");

}

// initialize charts when page loads
window.addEventListener("DOMContentLoaded", initCharts);
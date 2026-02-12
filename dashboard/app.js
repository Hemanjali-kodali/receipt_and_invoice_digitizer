const sidebarItems = document.querySelectorAll(".sidebar li");
const pages = document.querySelectorAll(".page");
const pageTitle = document.getElementById("pageTitle");

const uploadBtn = document.getElementById("uploadBtn");
const fileInput = document.getElementById("fileInput");
const resultOutput = document.getElementById("resultOutput");
const processing = document.getElementById("processing");

const totalProcessed = document.getElementById("totalProcessed");
const thisMonth = document.getElementById("thisMonth");
const historyTable = document.getElementById("historyTable");
const logoutBtn = document.getElementById("logoutBtn");

let totalCount = 0;
let monthCount = 0;

/* Sidebar Navigation */
sidebarItems.forEach(item => {
  item.addEventListener("click", () => {
    sidebarItems.forEach(i => i.classList.remove("active"));
    item.classList.add("active");

    pages.forEach(p => p.classList.add("hidden"));
    const pageId = item.getAttribute("data-page");
    document.getElementById(pageId).classList.remove("hidden");

    pageTitle.textContent = item.textContent;
  });
});

/* Upload */
uploadBtn.addEventListener("click", () => {
  fileInput.click();
});

fileInput.addEventListener("change", () => {
  const file = fileInput.files[0];
  if (!file) return;

  processing.classList.remove("hidden");

  setTimeout(() => {
    processing.classList.add("hidden");

    totalCount++;
    monthCount++;

    totalProcessed.textContent = totalCount;
    thisMonth.textContent = monthCount;
    // Update today's weekday in chart
let today = new Date().getDay(); 
// JS: 0=Sun, 1=Mon, 2=Tue...

let adjustedIndex = today === 0 ? 6 : today - 1;
// Convert so chart matches Mon-Sun order

weeklyData[adjustedIndex]++;
weeklyChart.update();


    const fakeData = {
      date: new Date().toLocaleDateString(),
      vendor: "ABC Store",
      total: "$125.00"
    };

    resultOutput.textContent = JSON.stringify(fakeData, null, 2);

    const row = `
      <tr>
        <td>${fakeData.date}</td>
        <td>${fakeData.vendor}</td>
        <td>${fakeData.total}</td>
      </tr>
    `;
    historyTable.innerHTML += row;

  }, 1500);
});

/* Logout */
logoutBtn.addEventListener("click", () => {
  alert("Logged out successfully!");
});
/* ==========================
   DYNAMIC WEEKLY CHART
========================== */

const ctx = document.getElementById("weeklyChart");

// Start with zero data
let weeklyData = [0, 0, 0, 0, 0, 0, 0];

const weeklyChart = new Chart(ctx, {
  type: "bar",
  data: {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    datasets: [{
      label: "Scans",
      data: weeklyData,
      backgroundColor: "rgba(99, 102, 241, 0.8)",
      borderRadius: 10
    }]
  },
  options: {
    responsive: true,
    plugins: {
      legend: { display: false }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { stepSize: 1 }
      }
    }
  }
});

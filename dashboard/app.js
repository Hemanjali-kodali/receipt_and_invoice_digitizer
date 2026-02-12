const uploadBtn = document.getElementById("uploadBtn");
const fileInput = document.getElementById("fileInput");
const resultOutput = document.getElementById("resultOutput");
const processing = document.getElementById("processing");

const totalProcessed = document.getElementById("totalProcessed");
const thisMonth = document.getElementById("thisMonth");

let totalCount = 0;
let monthCount = 0;

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

    const fakeData = {
      vendor: "ABC Store",
      date: "2026-02-15",
      total: "$125.00",
      items: ["Item 1", "Item 2"]
    };

    resultOutput.textContent = JSON.stringify(fakeData, null, 2);

  }, 1500);
});

/*
====================================================
    WEIGHT TRACKING
====================================================
*/

let weightChart = null;
let currentProfile = null;

initializeWeightPage();

async function initializeWeightPage() {
  const profile = await requireAuth();

  if (!profile) return;

  currentProfile = profile;

  // Default the date input to today
  document.getElementById("log-date").value = todayAsDateString();

  await loadAndRenderChart();

  document
    .getElementById("log-weight-btn")
    .addEventListener("click", showLogForm);

  document
    .getElementById("cancel-log-btn")
    .addEventListener("click", hideLogForm);

  document
    .getElementById("weight-form")
    .addEventListener("submit", handleLogSubmit);
}

/*
====================================================
    Helpers
====================================================
*/

function todayAsDateString() {
  // Local-time YYYY-MM-DD, safe for a <input type="date">
  const now = new Date();
  const offset = now.getTimezoneOffset();
  const local = new Date(now.getTime() - offset * 60 * 1000);
  return local.toISOString().slice(0, 10);
}

function showLogForm() {
  document.getElementById("log-weight-form-section").style.display = "block";
  document.getElementById("log-weight-btn").style.display = "none";
}

function hideLogForm() {
  document.getElementById("log-weight-form-section").style.display = "none";
  document.getElementById("log-weight-btn").style.display = "block";
}

/*
====================================================
    Load + Render Chart
====================================================
*/

async function loadAndRenderChart() {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const fromDate = thirtyDaysAgo.toISOString().slice(0, 10);

  const { data, error } = await db
    .from("weight_logs")
    .select("weight, logged_at")
    .eq("user_id", currentProfile.id)
    .gte("logged_at", fromDate)
    .order("logged_at", { ascending: true });

  if (error) {
    console.error("loadAndRenderChart error:", error);
    return;
  }

  const emptyState = document.getElementById("chart-empty-state");
  const canvas = document.getElementById("weight-chart");

  if (!data || data.length === 0) {
    emptyState.style.display = "block";
    canvas.style.display = "none";
    return;
  }

  emptyState.style.display = "none";
  canvas.style.display = "block";

  const labels = data.map((row) =>
    new Date(row.logged_at + "T00:00:00").toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    }),
  );
  const weights = data.map((row) => row.weight);

  renderChart(labels, weights);
}

function renderChart(labels, weights) {
  const ctx = document.getElementById("weight-chart").getContext("2d");

  if (weightChart) {
    weightChart.destroy();
  }

  weightChart = new Chart(ctx, {
    type: "line",
    data: {
      labels,
      datasets: [
        {
          label: "Weight (lbs)",
          data: weights,
          borderColor: "#39ff14",
          backgroundColor: "rgba(57, 255, 20, 0.1)",
          pointBackgroundColor: "#39ff14",
          pointRadius: 3,
          tension: 0.3,
          fill: true,
          spanGaps: true,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false },
      },
      scales: {
        x: {
          ticks: { color: "#9b9b9b" },
          grid: { color: "#2d2d2d" },
        },
        y: {
          ticks: { color: "#9b9b9b" },
          grid: { color: "#2d2d2d" },
        },
      },
    },
  });
}

/*
====================================================
    Log / Overwrite a Weigh-In
====================================================
*/

async function handleLogSubmit(event) {
  event.preventDefault();

  const dateValue = document.getElementById("log-date").value;
  const weightValue = parseFloat(
    document.getElementById("log-weight-input").value,
  );

  if (!dateValue) {
    alert("Please choose a date.");
    return;
  }

  if (isNaN(weightValue) || weightValue <= 0) {
    alert("Please enter a valid weight.");
    return;
  }

  const submitBtn = event.target.querySelector("button[type='submit']");
  submitBtn.disabled = true;
  submitBtn.textContent = "Saving...";

  // upsert on the (user_id, logged_at) unique constraint —
  // logging the same day twice overwrites that day's entry
  // instead of creating a duplicate.
  const { error } = await db.from("weight_logs").upsert(
    {
      user_id: currentProfile.id,
      logged_at: dateValue,
      weight: weightValue,
    },
    { onConflict: "user_id,logged_at" },
  );

  submitBtn.disabled = false;
  submitBtn.textContent = "Save";

  if (error) {
    console.error("handleLogSubmit error:", error);
    alert("Couldn't save that entry. Please try again.");
    return;
  }

  document.getElementById("weight-form").reset();
  document.getElementById("log-date").value = todayAsDateString();
  hideLogForm();

  await loadAndRenderChart();
}

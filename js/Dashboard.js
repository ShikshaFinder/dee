class Dashboard {
  constructor() {
    this.diseaseFilter = document.getElementById("disease-filter");
    this.dateFilter = document.getElementById("date-filter");
    this.charts = {};
    this.initializeEventListeners();
    this.loadDashboard();
  }

  initializeEventListeners() {
    this.diseaseFilter.addEventListener("change", () => this.updateDashboard());
    this.dateFilter.addEventListener("change", () => this.updateDashboard());
  }

  loadDashboard() {
    const records = Storage.get("patientRecords") || [];
    this.updateDiseaseFilter(records);
    this.updateDashboard();
  }

  updateDiseaseFilter(records) {
    const diseases = [...new Set(records.map((record) => record.disease))];
    this.diseaseFilter.innerHTML =
      '<option value="">Filter by Disease</option>';
    diseases.forEach((disease) => {
      const option = document.createElement("option");
      option.value = disease;
      option.textContent = disease;
      this.diseaseFilter.appendChild(option);
    });
  }

  updateDashboard() {
    let records = Storage.get("patientRecords") || [];

    // Apply filters
    const selectedDisease = this.diseaseFilter.value;
    const selectedDate = this.dateFilter.value;

    if (selectedDisease) {
      records = records.filter((record) => record.disease === selectedDisease);
    }

    if (selectedDate) {
      records = records.filter((record) => record.visitDate >= selectedDate);
    }

    this.updateCharts(records);
  }

  updateCharts(records) {
    // Destroy existing charts
    Object.values(this.charts).forEach((chart) => chart.destroy());
    this.charts = {};

    // Symptom Frequency Chart
    const symptomFrequency = this.calculateSymptomFrequency(records);
    this.renderSymptomFrequencyChart(symptomFrequency);

    // Disease Trends Chart
    const diseaseTrends = this.calculateDiseaseTrends(records);
    this.renderDiseaseTrendsChart(diseaseTrends);

    // Healing Duration Chart
    const healingDuration = this.calculateHealingDuration(records);
    this.renderHealingDurationChart(healingDuration);

    // Visit Frequency Chart
    const visitFrequency = this.calculateVisitFrequency(records);
    this.renderVisitFrequencyChart(visitFrequency);

    // Fees Chart
    const feesData = this.calculateFeesData(records);
    this.renderFeesChart(feesData);
  }

  calculateSymptomFrequency(records) {
    const frequency = {};
    records.forEach((record) => {
      record.symptoms.forEach((symptom) => {
        frequency[symptom] = (frequency[symptom] || 0) + 1;
      });
    });
    return Object.entries(frequency).map(([name, value]) => ({ name, value }));
  }

  calculateDiseaseTrends(records) {
    const trends = {};
    records.forEach((record) => {
      const month = new Date(record.visitDate).toLocaleString("default", {
        month: "short",
      });
      trends[month] = (trends[month] || 0) + 1;
    });
    return Object.entries(trends).map(([name, value]) => ({ name, value }));
  }

  calculateHealingDuration(records) {
    const duration = records.reduce(
      (acc, record) => acc + record.healingDuration,
      0
    );
    return duration / records.length || 0;
  }

  calculateVisitFrequency(records) {
    const frequency = {};
    records.forEach((record) => {
      const patient = record.patientName;
      frequency[patient] = (frequency[patient] || 0) + 1;
    });
    return Object.entries(frequency).map(([name, value]) => ({ name, value }));
  }

  calculateFeesData(records) {
    const fees = {};
    records.forEach((record) => {
      const patient = record.patientName;
      fees[patient] = (fees[patient] || 0) + record.fees;
    });
    return Object.entries(fees).map(([name, value]) => ({ name, value }));
  }

  renderSymptomFrequencyChart(data) {
    const ctx = document
      .getElementById("symptom-frequency-chart")
      .getContext("2d");
    this.charts.symptomFrequency = new Chart(ctx, {
      type: "bar",
      data: {
        labels: data.map((item) => item.name),
        datasets: [
          {
            label: "Symptom Frequency",
            data: data.map((item) => item.value),
            backgroundColor: "rgba(54, 162, 235, 0.5)",
            borderColor: "rgba(54, 162, 235, 1)",
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true,
          },
        },
      },
    });
  }

  renderDiseaseTrendsChart(data) {
    const ctx = document
      .getElementById("disease-trends-chart")
      .getContext("2d");
    this.charts.diseaseTrends = new Chart(ctx, {
      type: "line",
      data: {
        labels: data.map((item) => item.name),
        datasets: [
          {
            label: "Disease Trends",
            data: data.map((item) => item.value),
            fill: false,
            borderColor: "rgba(75, 192, 192, 1)",
            tension: 0.1,
          },
        ],
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true,
          },
        },
      },
    });
  }

  renderHealingDurationChart(data) {
    const ctx = document
      .getElementById("healing-duration-chart")
      .getContext("2d");
    this.charts.healingDuration = new Chart(ctx, {
      type: "doughnut",
      data: {
        labels: ["Average Healing Duration"],
        datasets: [
          {
            data: [data],
            backgroundColor: ["rgba(255, 99, 132, 0.5)"],
            borderColor: ["rgba(255, 99, 132, 1)"],
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            callbacks: {
              label: function (context) {
                return `Average: ${context.raw.toFixed(1)} days`;
              },
            },
          },
        },
      },
    });
  }

  renderVisitFrequencyChart(data) {
    const ctx = document
      .getElementById("visit-frequency-chart")
      .getContext("2d");
    this.charts.visitFrequency = new Chart(ctx, {
      type: "bar",
      data: {
        labels: data.map((item) => item.name),
        datasets: [
          {
            label: "Visit Frequency",
            data: data.map((item) => item.value),
            backgroundColor: "rgba(153, 102, 255, 0.5)",
            borderColor: "rgba(153, 102, 255, 1)",
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true,
          },
        },
      },
    });
  }

  renderFeesChart(data) {
    const ctx = document.getElementById("fees-chart").getContext("2d");
    this.charts.fees = new Chart(ctx, {
      type: "pie",
      data: {
        labels: data.map((item) => item.name),
        datasets: [
          {
            data: data.map((item) => item.value),
            backgroundColor: [
              "rgba(255, 99, 132, 0.5)",
              "rgba(54, 162, 235, 0.5)",
              "rgba(255, 206, 86, 0.5)",
              "rgba(75, 192, 192, 0.5)",
              "rgba(153, 102, 255, 0.5)",
            ],
            borderColor: [
              "rgba(255, 99, 132, 1)",
              "rgba(54, 162, 235, 1)",
              "rgba(255, 206, 86, 1)",
              "rgba(75, 192, 192, 1)",
              "rgba(153, 102, 255, 1)",
            ],
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          tooltip: {
            callbacks: {
              label: function (context) {
                return `$${context.raw}`;
              },
            },
          },
        },
      },
    });
  }
}

// Initialize Dashboard when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  new Dashboard();
});

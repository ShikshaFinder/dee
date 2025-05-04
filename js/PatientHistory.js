class PatientHistory {
  constructor() {
    this.recordsContainer = document.getElementById("patient-records");
    this.searchInput = document.getElementById("search-input");
    this.dateFilter = document.getElementById("date-filter");
    this.exportButtons = document.querySelectorAll(".export-btn");
    this.initializeEventListeners();
    this.loadRecords();
  }

  initializeEventListeners() {
    this.searchInput.addEventListener("input", () => this.filterRecords());
    this.dateFilter.addEventListener("change", () => this.filterRecords());
    this.exportButtons.forEach((button) => {
      button.addEventListener("click", (e) => this.handleExport(e));
    });
  }

  async loadRecords() {
    try {
      const records = await API.getRecords();
      this.displayRecords(records);
    } catch (error) {
      this.showErrorMessage("Error loading patient records. Please try again.");
    }
  }

  async filterRecords() {
    try {
      const records = await API.getRecords();
      const searchTerm = this.searchInput.value.toLowerCase();
      const dateFilter = this.dateFilter.value;

      const filteredRecords = records.filter((record) => {
        const matchesSearch =
          record.patientName.toLowerCase().includes(searchTerm) ||
          record.disease.toLowerCase().includes(searchTerm);
        const matchesDate =
          dateFilter === "all" ||
          (dateFilter === "today" && Utils.isToday(record.visitDate)) ||
          (dateFilter === "week" && Utils.isThisWeek(record.visitDate)) ||
          (dateFilter === "month" && Utils.isThisMonth(record.visitDate));

        return matchesSearch && matchesDate;
      });

      this.displayRecords(filteredRecords);
    } catch (error) {
      this.showErrorMessage("Error filtering records. Please try again.");
    }
  }

  displayRecords(records) {
    this.recordsContainer.innerHTML = "";

    if (records.length === 0) {
      this.recordsContainer.innerHTML =
        '<div class="alert alert-info">No records found.</div>';
      return;
    }

    records.forEach((record) => {
      const recordElement = this.createRecordElement(record);
      this.recordsContainer.appendChild(recordElement);
    });
  }

  createRecordElement(record) {
    const div = document.createElement("div");
    div.className = "card mb-3";
    div.innerHTML = `
      <div class="card-body">
        <h5 class="card-title">${record.patientName}</h5>
        <h6 class="card-subtitle mb-2 text-muted">${record.disease}</h6>
        <p class="card-text">
          <strong>Visit Date:</strong> ${Utils.formatDate(record.visitDate)}<br>
          <strong>Severity:</strong> ${record.severity}<br>
          <strong>Healing Duration:</strong> ${record.healingDuration} days<br>
          <strong>Fees:</strong> $${record.fees}
        </p>
        <div class="btn-group">
          <button class="btn btn-primary btn-sm edit-btn" data-id="${
            record.id
          }">Edit</button>
          <button class="btn btn-danger btn-sm delete-btn" data-id="${
            record.id
          }">Delete</button>
        </div>
      </div>
    `;

    // Add event listeners for edit and delete buttons
    div
      .querySelector(".edit-btn")
      .addEventListener("click", () => this.handleEdit(record));
    div
      .querySelector(".delete-btn")
      .addEventListener("click", () => this.handleDelete(record.id));

    return div;
  }

  async handleEdit(record) {
    // Fill the form with record data
    const form = document.getElementById("patient-form");
    form.elements["patient-name"].value = record.patientName;
    form.elements["contact-info"].value = record.contactInfo;
    form.elements["visit-date"].value = record.visitDate;
    form.elements["symptoms"].value = record.symptoms;
    form.elements["disease"].value = record.disease;
    form.elements["severity"].value = record.severity;
    form.elements["diagnosis"].value = record.diagnosis;
    form.elements["treatment"].value = record.treatment;
    form.elements["healing-duration"].value = record.healingDuration;
    form.elements["fees"].value = record.fees;

    // Scroll to form
    form.scrollIntoView({ behavior: "smooth" });
  }

  async handleDelete(id) {
    if (confirm("Are you sure you want to delete this record?")) {
      try {
        await API.deleteRecord(id);
        this.loadRecords();
        this.showSuccessMessage("Record deleted successfully!");
      } catch (error) {
        this.showErrorMessage("Error deleting record. Please try again.");
      }
    }
  }

  async handleExport(e) {
    const format = e.target.dataset.format;
    try {
      const records = await API.getRecords();
      if (format === "csv") {
        Utils.exportToCSV(records);
      } else if (format === "pdf") {
        Utils.exportToPDF(records);
      }
    } catch (error) {
      this.showErrorMessage("Error exporting records. Please try again.");
    }
  }

  showSuccessMessage(text) {
    const message = document.createElement("div");
    message.className = "alert alert-success mt-3";
    message.textContent = text;

    this.recordsContainer.insertBefore(
      message,
      this.recordsContainer.firstChild
    );

    setTimeout(() => {
      message.remove();
    }, 3000);
  }

  showErrorMessage(text) {
    const message = document.createElement("div");
    message.className = "alert alert-danger mt-3";
    message.textContent = text;

    this.recordsContainer.insertBefore(
      message,
      this.recordsContainer.firstChild
    );

    setTimeout(() => {
      message.remove();
    }, 3000);
  }
}

// Initialize PatientHistory when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  new PatientHistory();
});
